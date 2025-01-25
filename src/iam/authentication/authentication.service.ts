import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import jwtConfig from '../config/jwt.config';
import { BcryptService } from '../hashing/bcrypt.service';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    // inject repo
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    // inject servs
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    // inject configs
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { username, password } = signUpDto;

    // user alr exist? throw
    const existingUser = await this.usersRepository.findOneBy({ username });
    if (existingUser) {
      this.logger.warn(`User with username ${username} already exists`);
      throw new ConflictException('Username is already taken');
    }

    // dto -> repo instance -> save
    const user = new User();
    user.username = username;
    user.password = await this.bcryptService.hash(password);
    await this.usersRepository.save(user);
    this.logger.log(`New user registered with username: ${username}`);
  }

  async signIn(signInDto: SignInDto) {
    const { username, password } = signInDto;

    // user exists?
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) {
      this.logger.warn(`Failed login attempt for username: ${username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if the user already has an active session by verifying the refresh token
    const existingRefreshToken =
      await this.refreshTokenIdsStorage.getByUserName(user.id);
    if (existingRefreshToken) {
      this.logger.warn(`User with username ${username} is already signed in`);
      throw new UnauthorizedException(
        'You are already signed in. Please use refresh token to get a new session.',
      );
    }

    // password ok?
    const isPasswordValid = await this.bcryptService.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for username: ${username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // give tokens
    this.logger.log(`User logged in: ${username}`);
    return await this.generateTokens(user);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      // del saved token (auto throw)
      const user = await this.refreshTokenRotation(
        refreshTokenDto.refreshToken,
      );
      // give tokens
      this.logger.log(`Refresh tokens generated for user ID: ${user.id}`);
      return this.generateTokens(user);
    } catch (error) {
      this.logger.error('Invalid or expired refresh token', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async signOut(refreshTokenDto: RefreshTokenDto) {
    try {
      // del saved token (auto throw)
      const user = await this.refreshTokenRotation(
        refreshTokenDto.refreshToken,
      );
      this.logger.log(`User ID ${user.id} has successfully signed out.`);
      // worst case access token is usable for 5 min, after that cannot refresh it
    } catch (error) {
      this.logger.error(`Error while signing out user`, error);
      throw new UnauthorizedException('Failed to sign out');
    }
  }

  private async refreshTokenRotation(refreshToken: string): Promise<User> {
    // passed refresh token -> payload (auto throw)
    const payload: ActiveUserData = await this.jwtService.verifyAsync(
      refreshToken,
      this.jwtConfiguration,
    );

    // payload -> user
    const user = await this.usersRepository.findOneByOrFail({
      id: payload.sub,
    });

    // passed refresh token vs redis saved token (auto throw)
    await this.refreshTokenIdsStorage.validate(user.id, payload.refreshTokenId);

    // one time refresh token is used, del it
    await this.refreshTokenIdsStorage.invalidate(user.id);

    return user;
  }

  private async generateTokens(user: User) {
    const refreshTokenId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        this.jwtConfiguration.accessTokenTtl,
        user.id,
        { username: user.username, role: user.role },
      ),
      this.signToken<Partial<ActiveUserData>>(
        this.jwtConfiguration.refreshTokenTtl,
        user.id,
        { refreshTokenId },
      ),
    ]);

    // save refresh token id in redis
    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);

    this.logger.log(`Tokens generated for user ID: ${user.id}`);
    return { accessToken, refreshToken };
  }

  private async signToken<T>(
    expiresIn: number, // dynamic config
    userId: number, // req payload prop
    payload?: T, // extra payload prop
  ): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, ...payload },
      {
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
        expiresIn,
      },
    );
  }
}
