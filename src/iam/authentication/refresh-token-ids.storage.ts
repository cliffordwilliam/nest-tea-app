import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Redis from 'ioredis';
import jwtConfig from '../config/jwt.config';
import redisConfig from '../config/redis.config';

@Injectable()
// subscribe to nest lifecycle events
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private redisClient: Redis;
  private readonly logger = new Logger(RefreshTokenIdsStorage.name);

  constructor(
    // inject configs
    @Inject(redisConfig.KEY)
    private readonly redisConfiguration: ConfigType<typeof redisConfig>,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  // on app start
  onApplicationBootstrap() {
    try {
      // init redit conn
      this.redisClient = new Redis({
        host: this.redisConfiguration.host,
        port: this.redisConfiguration.port,
        password: this.redisConfiguration.password,
        family: 0, // force ipv4
      });

      this.logger.log('Connected to Redis');

      this.redisClient.on('error', (error) => {
        this.logger.error('Redis connection error', error.stack);
      });

      this.redisClient.on('reconnecting', () => {
        this.logger.warn('Redis is reconnecting...');
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis reconnected successfully');
      });
    } catch (error) {
      this.logger.error('Error during Redis initialization', error);
      throw new Error('Redis is unavailable');
    }
  }

  // on app end
  async onApplicationShutdown() {
    try {
      // cut redis conn
      if (this.redisClient) {
        await this.redisClient.quit();
        this.logger.log('Redis connection closed');
      }
    } catch (error) {
      this.logger.error('Error shutting down Redis connection', error);
    }
  }

  async insert(userId: number, tokenId: string): Promise<void> {
    try {
      // save to redis (user id : token id)
      await this.redisClient.set(
        this.getKey(userId),
        tokenId,
        // del refresh token from redis if its invalid alr
        'EX',
        this.jwtConfiguration.refreshTokenTtl,
      );
      this.logger.log(`Refresh token saved for user ID: ${userId}`);
    } catch (error) {
      this.logger.error('Error inserting refresh token', error);
      throw new Error('Could not save the refresh token');
    }
  }

  async validate(userId: number, tokenId: string): Promise<boolean> {
    try {
      // use user id key to get token id
      const storedId = await this.redisClient.get(this.getKey(userId));
      // no token db?
      if (!storedId) {
        this.logger.warn(`Refresh token not found for user ID: ${userId}`);
        throw new UnauthorizedException('Refresh token not found');
      }
      // token db vs passed token
      if (storedId !== tokenId) {
        this.logger.warn(`Invalid refresh token for user ID: ${userId}`);
        throw new UnauthorizedException('Refresh token is invalid');
      }
      return true;
    } catch (error) {
      this.logger.error('Error validating refresh token', error);
      throw new UnauthorizedException('Refresh token is invalid');
    }
  }

  async invalidate(userId: number): Promise<void> {
    try {
      // del token using user id key
      await this.redisClient.del(this.getKey(userId));
      this.logger.log(`Refresh token invalidated for user ID: ${userId}`);
    } catch (error) {
      this.logger.error('Error invalidating refresh token', error);
      throw new Error('Could not invalidate the refresh token');
    }
  }

  // get refresh token id by user id
  async getByUserName(userId: number): Promise<string | null> {
    return await this.redisClient.get(this.getKey(userId));
  }

  private getKey(userId: number): string {
    // this is just to reformat key str
    return `auth:user-${userId}-refresh-token`;
  }
}
