import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage';
import { RolesGuard } from './authorization/guards/roles.guard';
import bcryptConfig from './config/bcrypt.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import { BcryptService } from './hashing/bcrypt.service';

@Module({
  imports: [
    // register entities
    TypeOrmModule.forFeature([User]),
    // register configs
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(redisConfig),
    ConfigModule.forFeature(bcryptConfig),
    // init 3rd party module
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [
    // my servs
    BcryptService,
    AuthenticationService,
    RefreshTokenIdsStorage,
    // register global
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    // register global
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [AuthenticationController],
  exports: [BcryptService],
})
export class IamModule {}
