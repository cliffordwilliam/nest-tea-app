import * as Joi from '@hapi/joi';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import { TeasModule } from './teas/teas.module';
import { UsersModule } from './users/users.module';
import { IamModule } from './iam/iam.module';

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
          .default('postgres'),
        DATABASE_HOST: Joi.string().default('localhost'),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USER: Joi.string().default('user'),
        DATABASE_PASSWORD: Joi.string().default('password'),
        DATABASE_NAME: Joi.string().default('database'),
        JWT_SECRET: Joi.string().required(),
        JWT_TOKEN_AUDIENCE: Joi.string().default('localhost:3000'),
        JWT_TOKEN_ISSUER: Joi.string().default('localhost:3000'),
        JWT_ACCESS_TOKEN_TTL: Joi.string().default('300'),
        JWT_REFRESH_TOKEN_TTL: Joi.string().default('3600'),
        REDIS_HOST: Joi.string().default('localhost'),
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
    // sub modules
    TeasModule,
    UsersModule,
    IamModule,
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
  ],
})
export class AppModule {}
