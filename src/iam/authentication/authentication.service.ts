import {
  ConflictException,
  Inject,
  Injectable,
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
    // prevent violating unique constraint
    const existingUser = await this.usersRepository.findOneBy({
      username: signUpDto.username,
    });
    if (existingUser) {
      throw new ConflictException(
        `User with username ${signUpDto.username} already exists`,
      );
    }
    // dto -> repo instance -> save
    const user = new User();
    user.username = signUpDto.username;
    user.password = await this.bcryptService.hash(signUpDto.password);
    await this.usersRepository.save(user);
  }

  async signIn(signInDto: SignInDto) {
    // user exists?
    const user = await this.usersRepository.findOneBy({
      username: signInDto.username,
    });
    if (!user) {
      throw new UnauthorizedException('User does not exists');
    }
    // password ok?
    const isEqual = await this.bcryptService.compare(
      signInDto.password,
      user.password,
    );
    if (!isEqual) {
      throw new UnauthorizedException('Password does not match');
    }
    // user -> token + refresh token
    return await this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    // new refresh token uuid to be saved in redis
    const refreshTokenId = randomUUID();
    // user -> token + refresh token
    const [accessToken, refreshToken] = await Promise.all([
      // access token
      this.signToken<Partial<ActiveUserData>>(
        // ttl (dynamic jwt config)
        this.jwtConfiguration.accessTokenTtl,
        // default payload (user id)
        user.id,
        // additional payload (partial active user data)
        { username: user.username, role: user.role },
      ),
      // refresh token
      this.signToken<Partial<ActiveUserData>>(
        // ttl (dynamic jwt config)
        this.jwtConfiguration.refreshTokenTtl,
        // default payload (user id)
        user.id,
        // additional payload (partial active user data)
        { refreshTokenId },
      ),
    ]);
    // save to redis (user id : token id)
    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      // get refresh token payload
      const payload: ActiveUserData = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        // jwt configs
        {
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
          secret: this.jwtConfiguration.secret,
          // this func param interface does not have expiresIn
        },
      );
      // find user by default payload (user id)
      const user = await this.usersRepository.findOneByOrFail({
        id: payload.sub,
      });
      // user saved redis refresh token vs passed refresh token
      const isValid = await this.refreshTokenIdsStorage.validate(
        user.id,
        payload.refreshTokenId,
      );
      if (isValid) {
        // refresh token passed is valid, del it from redis
        await this.refreshTokenIdsStorage.invalidate(user.id);
      } else {
        // passed refresh token is not the same as the one saved in redis
        throw new Error('Refresh token is invalid');
      }
      // make new token + refresh token with user
      return this.generateTokens(user);
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  private async signToken<T>(expiresIn: number, userId: number, payload?: T) {
    // payload -> token
    return await this.jwtService.signAsync(
      // user req token data
      {
        // default payload (user id)
        sub: userId,
        // additional payload (partial active user data)
        ...payload,
      },
      // jwt configs
      {
        // static jwt config
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        // ttl (dynamic jwt config)
        expiresIn,
      },
    );
  }
}
