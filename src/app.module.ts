import * as Joi from '@hapi/joi';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import appConfig from './config/app.config';
import { IamModule } from './iam/iam.module';
import { TeasModule } from './teas/teas.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // init builtin config module
    ConfigModule.forRoot({
      // register root config
      load: [appConfig],
      // env validation
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'staging')
          .default('development'),
        DATABASE_TYPE: Joi.string()
          .valid('mysql', 'postgres', 'mariadb', 'mongodb', 'sqlite')
          .required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_TOKEN_AUDIENCE: Joi.string().default('localhost:3000'),
        JWT_TOKEN_ISSUER: Joi.string().default('localhost:3000'),
        JWT_ACCESS_TOKEN_TTL: Joi.string().default('300'),
        JWT_REFRESH_TOKEN_TTL: Joi.string().default('3600'),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        RATE_LIMIT_TTL: Joi.number().default(60),
        RATE_LIMIT_LIMIT: Joi.number().default(5),
        BCRYPT_SALT: Joi.number().default(12),
        CLOUDINARY_API_SECRET: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
        CLOUDINARY_FOLDER: Joi.string().required(),
        FRONTEND_URL: Joi.string().default('localhost:3001'),
      }),
    }),
    // db conn
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      useFactory: (rootConfig: ConfigType<typeof appConfig>) =>
        ({
          // env conn data
          type: rootConfig.database.type,
          host: rootConfig.database.host,
          port: rootConfig.database.port,
          username: rootConfig.database.username,
          password: rootConfig.database.password,
          database: rootConfig.database.name,
          // orm settings
          autoLoadEntities: true,
          synchronize: rootConfig.environment === 'development',
        }) as TypeOrmModuleOptions,
      inject: [appConfig.KEY],
    }),
    // rate limit
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      useFactory: (rootConfig: ConfigType<typeof appConfig>) =>
        [
          {
            ttl: rootConfig.rateLimit.ttl,
            limit: rootConfig.rateLimit.limit,
          },
        ] as ThrottlerModuleOptions,
      inject: [appConfig.KEY],
    }),
    // sub modules
    TeasModule,
    UsersModule,
    IamModule,
    CloudinaryModule,
  ],
  providers: [
    // register global
    {
      provide: APP_PIPE,
      useFactory: () => {
        return new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
        });
      },
    },
    // register global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
