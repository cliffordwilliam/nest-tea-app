import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';

// todo: move this to its own file
export class InvalidatedRefreshTokenError extends Error {}

@Injectable()
// subscribe to nest lifecycle events
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  // prepare prop to hold redis client
  private redisClient: Redis;

  // on app start
  onApplicationBootstrap() {
    // todo: make redis module to init connection
    this.redisClient = new Redis({
      // todo: use the environment variables
      host: 'localhost',
      port: 6379,
    });
  }

  // on app end
  onApplicationShutdown(signal?: string) {
    // cut redis conn
    return this.redisClient.quit();
  }

  async insert(userId: number, tokenId: string): Promise<void> {
    // add to redis (user id : token id)
    await this.redisClient.set(this.getKey(userId), tokenId);
  }

  async validate(userId: number, tokenId: string): Promise<boolean> {
    // use user id key to get token id
    const storedId = await this.redisClient.get(this.getKey(userId));
    // token db vs passed token
    if (storedId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }
    return storedId === tokenId;
  }

  async invalidate(userId: number): Promise<void> {
    // del token using user id key
    await this.redisClient.del(this.getKey(userId));
  }

  private getKey(userId: number): string {
    // this is just to reformat key str (for better visual look)
    return `user-${userId}`;
  }
}
