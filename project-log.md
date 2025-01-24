# why use nest

```
enterprise grade
focus on app, not config
```

# get node lts

```bash
nvm install --lts
nvm use --lts
node -v
```

# get nest cli globally

```bash
npm i -g @nestjs/cli
```

# make nest app

```bash
nest new
```

# sometimes vscode typescript intellisense doesnt work

```
just restart it usually works again
```

# ctrl + shift + p to use workspace typescript (cursor must be in .ts file)

```
TypeScript: Select TypeScript Version
```

# ctrl + shift + p to reload eslint and window

```
ESLint: Restart ESLint Server
Developer: Reload Window
```

# run watch mode

```bash
npm run start:dev
```

# lint and format

```bash
npm run lint
npm run format
```

# edit entry

```javascript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
```

# remove root module default deps

```javascript
import { Module } from '@nestjs/common';

@Module({})
export class AppModule {}
```

# declutter

```bash
rm src/app.controller.spec.ts
rm src/app.controller.ts
rm src/app.service.ts
```

# commit

```
make first commit
```

# create new github remote repo

```bash
# set name
# set desc
# then push existing to remote
```

# get config dep

```bash
npm i @nestjs/config
```

# generate random jwt secret

```bash
openssl rand -base64 32
```

# create .env

```
NODE_ENV=asd
DATABASE_TYPE=asd
DATABASE_USER=asd
DATABASE_PASSWORD=asd
DATABASE_NAME=asd
DATABASE_PORT=asd
DATABASE_HOST=asd
JWT_SECRET=asd
JWT_TOKEN_AUDIENCE=asd
JWT_TOKEN_ISSUER=asd
JWT_ACCESS_TOKEN_TTL=asd
JWT_REFRESH_TOKEN_TTL=asd
REDIS_HOST=asd
```

# get env validator dep

```bash
npm i @hapi/joi
npm i --save-dev @types/hapi__joi
```

# make root config (src/config/app.config.ts)

```javascript
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  environment: process.env.NODE_ENV || 'development',
  database: {
    type: process.env.DATABASE_TYPE || 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'user',
    password: process.env.DATABASE_PASSWORD || 'password',
    name: process.env.DATABASE_NAME || 'database',
  },
}));
```

# register root config + env validation

```javascript
import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import { TeasModule } from './teas/teas.module';

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
    // sub modules
    TeasModule,
  ],
})
export class AppModule {}
```

# make local postgresql (odin guide to install and use)

```bash
# enter postgresql shell
psql

# create db for this nest app
CREATE DATABASE asd_asd;

# exit shell
\q
```

# get typeorm dep

```bash
npm i @nestjs/typeorm typeorm pg
```

# e.g. conn data

```javascript
module.exports = new Pool({
  host: 'localhost',
  user: '<role_name>', // whoami
  database: 'dsada_dsadsa', // db name
  password: '<role_password>', // machine pass
  port: 5432, // The default port
});
```

# init typeorm 3rd party module

```javascript
import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import { TeasModule } from './teas/teas.module';

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
  ],
})
export class AppModule {}
```

# check db conn

```
run watch mode
see if typeorm deps initialized = that means connection to local db is ok
```

# make crud res

```bash
nest g res --no-spec
```

# [make transformer](https://github.com/typeorm/typeorm/issues/873) (src/common/transformers/column-numeric.transformer.ts)

```javascript
export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number {
    return parseFloat(data);
  }
}
```

# make crud entity

```javascript
import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric.transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Tea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'text', length: 500, nullable: true })
  description?: string;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(), // https://github.com/typeorm/typeorm/issues/873
  })
  price: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl?: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeInsert()
  normalizeFields() {
    // trim extra spaces
    this.name = this.name.trim().replace(/\s+/g, ' ');
    if (this.description) {
      this.imageUrl = this.description.trim().replace(/\s+/g, ' ');
    }
    if (this.imageUrl) {
      this.imageUrl = this.imageUrl.trim().replace(/\s+/g, ' ');
    }
  }
}
```

# register entity to parent domain

```javascript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tea } from './entities/tea.entity';
import { TeasController } from './teas.controller';
import { TeasService } from './teas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tea])],
  controllers: [TeasController],
  providers: [TeasService],
})
export class TeasModule {}
```

# update crud service to use repo

```javascript
import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric.transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Tea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(), // https://github.com/typeorm/typeorm/issues/873
  })
  price: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl?: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeInsert()
  normalizeFields() {
    // trim extra spaces
    this.name = this.name.trim().replace(/\s+/g, ' ');
    if (this.description) {
      this.imageUrl = this.description.trim().replace(/\s+/g, ' ');
    }
    if (this.imageUrl) {
      this.imageUrl = this.imageUrl.trim().replace(/\s+/g, ' ');
    }
  }
}
```

# get dbeaver

```
install dbeaver
open dbeaver
connect with the above connection data
```

# check with dbeaver if table is made

# get dto validator dep

```bash
npm i class-validator class-transformer
```

# update crud dto with validation decors

```javascript
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTeaDto {
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  @IsOptional()
  readonly description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  readonly price: number;

  @IsNumber()
  @Min(0)
  @Max(10000)
  readonly stock: number;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  @MaxLength(255)
  @IsOptional()
  readonly imageUrl?: string;
}
```

# register global validation pipe (it reads dto validation decors)

```javascript
import * as Joi from '@hapi/joi';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import { TeasModule } from './teas/teas.module';

@Module({
  imports: [
    // init 3rd party config module
    ConfigModule.forRoot({
      // load root config
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
          // env conn
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
```

# make common pagination dto (src/common/dto/pagination-query.dto.ts)

```javascript
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100) // prevent too much items in 1 req
  @Transform(({ value }) => (value ? Number(value) : 10))
  readonly limit?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  // no max, can offset till whatever
  @Transform(({ value }) => (value ? Number(value) : 0))
  readonly offset?: number;
}
```

# add pagination dto to find all (controller)

```javascript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CreateTeaDto } from './dto/create-tea.dto';
import { UpdateTeaDto } from './dto/update-tea.dto';
import { TeasService } from './teas.service';

@Controller('teas')
export class TeasController {
  constructor(private readonly teasService: TeasService) {}

  @Post()
  create(@Body() createTeaDto: CreateTeaDto) {
    return this.teasService.create(createTeaDto);
  }

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.teasService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.teasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateTeaDto: UpdateTeaDto) {
    return this.teasService.update(id, updateTeaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.teasService.remove(id);
  }
}
```

# add pagination dto to find all (service)

```javascript
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { CreateTeaDto } from './dto/create-tea.dto';
import { UpdateTeaDto } from './dto/update-tea.dto';
import { Tea } from './entities/tea.entity';

@Injectable()
export class TeasService {
  constructor(
    // inject repo
    @InjectRepository(Tea)
    private readonly teaRepository: Repository<Tea>,
  ) {}

  async create(createTeaDto: CreateTeaDto) {
    // prevent violating unique constraint
    const existingTea = await this.teaRepository.findOneBy({
      name: createTeaDto.name.trim().replace(/\s+/g, ' '),
    });
    if (existingTea) {
      throw new ConflictException(
        `Tea with name ${createTeaDto.name} already exists`,
      );
    }
    // dto -> repo instance -> save
    const tea = this.teaRepository.create(createTeaDto);
    return this.teaRepository.save(tea);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.teaRepository.find({
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: number) {
    const tea = await this.teaRepository.findOne({
      where: { id },
    });
    if (!tea) {
      throw new NotFoundException(
        `No tea found with ID #${id}. Please check the ID.`,
      );
    }
    return tea;
  }

  async update(id: number, updateTeaDto: UpdateTeaDto) {
    // dto -> repo instance -> save
    const tea = await this.teaRepository.preload({
      id,
      ...updateTeaDto,
    });
    if (!tea) {
      throw new NotFoundException(
        `No tea found with ID #${id}. Please check the ID.`,
      );
    }
    return this.teaRepository.save(tea);
  }

  async remove(id: number) {
    const tea = await this.findOne(id);
    return this.teaRepository.remove(tea);
  }
}
```

# test crud (start server 1st, then client)

```JSON
// create
// url: localhost:3000/teas
// method: post
// raw body (json):
{
  "name": "Green Tea",
  "description": "A soothing and refreshing green tea made from the finest leaves.",
  "price": 5.99,
  "stock": 150,
  "imageUrl": "https://example.com/images/green-tea.jpg"
}

{
  "name": "Chamomile Tea",
  "description": "A calming chamomile tea with a floral aroma.",
  "price": 7.49,
  "stock": 80,
  "imageUrl": "https://example.com/images/chamomile-tea.jpg"
}

{
  "name": "Black Tea",
  "price": 4.50,
  "stock": 200,
  "imageUrl": "https://example.com/images/black-tea.jpg"
}
```

```JSON
// get all
// url: localhost:3000/teas
// method: get
// query parameters:
// limit: 10
// offset: 1
```

```JSON
// get one
// url: localhost:3000/teas/1
// method: get
```

```JSON
// edit some
// url: localhost:3000/teas/1
// method: patch
// raw body (json):
{
  "stock": 100
}
```

```JSON
// delete
// url: localhost:3000/teas/1
// method: delete
```

# make user res

```bash
nest g res --no-spec
```

# make user entity

```javascript
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;
}
```

# register user entity

```javascript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

# get bcryptjs dep (bcrypt has dep issues)

```bash
npm i bcryptjs
npm i @types/bcryptjs -D
```

# make iam module

```bash
nest g module iam
nest g service iam/hashing/bcrypt --flat --no-spec
```

# edit iam bcrypt service (iam subdirs is for organizing serv & cont)

```javascript
import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcryptjs';

@Injectable()
export class BcryptService {
  // str -> hash
  async hash(data: string): Promise<string> {
    const salt = await genSalt();
    return hash(data, salt);
  }

  // str vs hash -> bool
  compare(data: string, encrypted: string): Promise<boolean> {
    return compare(data, encrypted);
  }
}
```

# make auth controller + service

```bash
nest g controller iam/authentication --no-spec
nest g service iam/authentication --no-spec
```

# make auth dto

```bash
nest g class iam/authentication/dto/sign-in.dto --no-spec --flat
nest g class iam/authentication/dto/sign-up.dto --no-spec --flat
```

# edit sign in dto

```javascript
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(10)
  @MaxLength(255)
  @IsNotEmpty()
  password: string;
}
```

# edit sign up dto

```javascript
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(10)
  @MaxLength(255)
  @IsNotEmpty()
  password: string;
}
```

# edit auth service

```javascript
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BcryptService } from '../hashing/bcrypt.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    // inject repo
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    // inject servs
    private readonly bcryptService: BcryptService,
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
    const user = await this.usersRepository.findOneBy({
      username: signInDto.username,
    });
    if (!user) {
      throw new UnauthorizedException('User does not exists');
    }
    const isEqual = await this.bcryptService.compare(
      signInDto.password,
      user.password,
    );
    if (!isEqual) {
      throw new UnauthorizedException('Password does not match');
    }
    // todo: return jwt later
    return true;
  }
}
```

# edit auth controller

```javascript
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
}
```

# edit iam module

```javascript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [BcryptService, AuthenticationService],
  controllers: [AuthenticationController],
})
export class IamModule {}
```

```JSON
// sign in with non existent user
// url: localhost:3000/authentication/sign-in
// method: post
// raw body (json):
{
  "username": "john_doe",
  "password": "SecurePass123!"
}

// res:
{
	"message": "User does not exists",
	"error": "Unauthorized",
	"statusCode": 401
}
```

```JSON
// sign up with non existent user
// url: localhost:3000/authentication/sign-up
// method: post
// raw body (json):
{
  "username": "john_doe",
  "password": "SecurePass123!"
}

// res:
// 201
```

```JSON
// sign up with existent user
// url: localhost:3000/authentication/sign-up
// method: post
// raw body (json):
{
  "username": "john_doe",
  "password": "SecurePass123!"
}

// res:
{
	"message": "User with username john_doe already exists",
	"error": "Conflict",
	"statusCode": 409
}
```

```JSON
// sign in with existent user
// url: localhost:3000/authentication/sign-in
// method: post
// raw body (json):
{
  "username": "john_doe",
  "password": "SecurePass123!"
}

// res:
// true
```

```JSON
// sign in with existent user but wrong creds
// url: localhost:3000/authentication/sign-in
// method: post
// raw body (json):
{
  "username": "john_doe",
  "password": "asddsadsadsadsadsa"
}

// res:

{
	"message": "Password does not match",
	"error": "Unauthorized",
	"statusCode": 401
}
```

# get jwt dep

```bash
npm i @nestjs/jwt
```

# make jwt config in iam domain (iam/config/jwt.config.ts)

```javascript
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  return {
    secret: process.env.JWT_SECRET,
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    accessTokenTtl: parseInt(process.env.JWT_ACCESS_TOKEN_TTL ?? '3600', 10),
  };
});
```

# register it to iam domain

```javascript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import jwtConfig from './config/jwt.config';
import { BcryptService } from './hashing/bcrypt.service';

@Module({
  imports: [
    // register entities
    TypeOrmModule.forFeature([User]),
    // register configs
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [BcryptService, AuthenticationService],
  controllers: [AuthenticationController],
})
export class IamModule {}
```

# register & init jwt 3rd party module in iam domain

```javascript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import jwtConfig from './config/jwt.config';
import { BcryptService } from './hashing/bcrypt.service';

@Module({
  imports: [
    // register entities
    TypeOrmModule.forFeature([User]),
    // register configs
    ConfigModule.forFeature(jwtConfig),
    // init 3rd party module
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [BcryptService, AuthenticationService],
  controllers: [AuthenticationController],
})
export class IamModule {}
```

# create iam interface for active user req payload (iam/interfaces/active-user-data.interface.ts)

```javascript
export interface ActiveUserData {
  sub: number; // this is the user id
  username: string;
}
```

# edit auth service to make and return token

```javascript
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import jwtConfig from '../config/jwt.config';
import { BcryptService } from '../hashing/bcrypt.service';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    // inject repo
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    // inject servs
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
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
    // make token
    const accessToken = await this.jwtService.signAsync(
      // user req payload
      {
        sub: user.id,
        username: user.username,
      } as ActiveUserData,
      // jwt token env data (for its settings)
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.accessTokenTtl,
      },
    );
    // give client token
    return {
      accessToken,
    };
  }
}
```

# make token guard (to be used by auth guard)

```bash
nest g guard iam/authentication/guards/access-token --flat --no-spec
```

# make iam constants (iam.constants.ts)

```javascript
export const REQUEST_USER_KEY = 'user'; // the req payload key, used by token guard
```

# make token guard

```javascript
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import jwtConfig from '../../config/jwt.config';
import { REQUEST_USER_KEY } from '../../iam.constants';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    // inject servs
    private readonly jwtService: JwtService,
    // inject configs
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // req got token?
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Authorization token is missing');
    }
    try {
      // token -> payload
      const payload: ActiveUserData = await this.jwtService.verifyAsync(
        token,
        // jwt configs
        {
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
          secret: this.jwtConfiguration.secret,
          // this func param interface does not have expiresIn
        },
      );
      // store payload in req with key
      request[REQUEST_USER_KEY] = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return undefined;
    }
    return authHeader.split(' ')[1];
  }
}
```

# make auth decor (src/iam/authentication/decorators/auth.decorator.ts)

```javascript
import { SetMetadata } from '@nestjs/common';

// use my key to get my val
export const PUBLIC_ROUTE_KEY = 'isPublic';

export const Public = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
```

# make auth guard (check decor val)

```bash
nest g guard iam/authentication/guards/authentication --flat --no-spec
```

# make auth guard

```javascript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PUBLIC_ROUTE_KEY } from '../decorators/public.decorator';
import { AccessTokenGuard } from './access-token.guard';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    // inject token guard (need its canActive)
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // get decor val (its val is always true)
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [
        // decor handler and class
        context.getHandler(),
        context.getClass(),
      ],
    );
    // no decor? call token guard logic (it checks for token)
    if (!isPublic) {
      return this.accessTokenGuard.canActivate(context);
    }
    // got decor with any val? pass
    return true;
  }
}
```

# global register auth guard in aim domain + register token guard too cuz auth guard uses it

```javascript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import jwtConfig from './config/jwt.config';
import { BcryptService } from './hashing/bcrypt.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    BcryptService,
    AuthenticationService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    AccessTokenGuard,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
```

# decor auth cont with pub (everything else is priv)

```javascript
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Public } from './decorators/public.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Public()
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
}
```

```JSON
// sign in with existent user
// url: localhost:3000/authentication/sign-in
// method: post
// raw body (json):
{
  "username": "john_doe",
  "password": "SecurePass123!"
}

// res:
{
	"accessToken": "asdsdadsa"
}
```

```JSON
// get all + no auth type bearer token
// url: localhost:3000/teas
// method: get

// res
{
	"message": "Authorization token is missing",
	"error": "Unauthorized",
	"statusCode": 401
}
```

```JSON
// get all + got auth type bearer token
// url: localhost:3000/teas
// method: get

// res
[
	{
		"id": 14,
		"name": "Green Tea",
		"description": "A soothing and refreshing green tea made from the finest leaves.",
		"price": 5.99,
		"stock": 150,
		"imageUrl": "A soothing and refreshing green tea made from the finest leaves.",
		"createdAt": "2025-01-23T17:24:51.029Z",
		"updatedAt": "2025-01-23T17:24:51.029Z"
	},
	{
		"id": 15,
		"name": "Chamomile Tea",
		"description": "A calming chamomile tea with a floral aroma.",
		"price": 7.49,
		"stock": 80,
		"imageUrl": "A calming chamomile tea with a floral aroma.",
		"createdAt": "2025-01-23T17:25:02.312Z",
		"updatedAt": "2025-01-23T17:25:02.312Z"
	},
	{
		"id": 16,
		"name": "Black Tea",
		"description": null,
		"price": 4.5,
		"stock": 200,
		"imageUrl": "https://example.com/images/black-tea.jpg",
		"createdAt": "2025-01-23T17:25:07.653Z",
		"updatedAt": "2025-01-23T17:25:07.653Z"
	}
]
```

# refactor auth serv (src/iam/authentication/authentication.service.ts)

```javascript
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import jwtConfig from '../config/jwt.config';
import { BcryptService } from '../hashing/bcrypt.service';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    // inject repo
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    // inject servs
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
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
    const [accessToken, refreshToken] = await Promise.all([
      // access token
      this.signToken<Partial<ActiveUserData>>(
        // ttl (dynamic jwt config)
        this.jwtConfiguration.accessTokenTtl,
        // default payload (user id)
        user.id,
        // additional payload (partial active user data)
        { username: user.username },
      ),
      // refresh token
      this.signToken<Partial<ActiveUserData>>(
        // ttl (dynamic jwt config)
        this.jwtConfiguration.refreshTokenTtl,
        // default payload (user id)
        user.id,
        // additional payload (partial active user data)
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  private async signToken<T>(expiresIn: number, userId: number, payload?: T) {
    // payload -> token
    return await this.jwtService.signAsync(
      // user req payload
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
```

```JSON
// sign in with existent user
// url: localhost:3000/authentication/sign-in
// method: post
// raw body (json):
{
  "username": "john_doe",
  "password": "SecurePass123!"
}

// res:
{
	"accessToken": "asd",
	"refreshToken": "asd"
}
```

# make refresh token dto (src/iam/authentication/dto/refresh-token.dto.ts)

```javascript
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @MaxLength(1024)
  @IsNotEmpty()
  readonly refreshToken: string;
}
```

# edit auth serv to make refresh token (src/iam/authentication/authentication.service.ts)

```javascript
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import jwtConfig from '../config/jwt.config';
import { BcryptService } from '../hashing/bcrypt.service';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    // inject repo
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    // inject servs
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
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
    // user -> token + refresh token
    const [accessToken, refreshToken] = await Promise.all([
      // access token
      this.signToken<Partial<ActiveUserData>>(
        // ttl (dynamic jwt config)
        this.jwtConfiguration.accessTokenTtl,
        // default payload (user id)
        user.id,
        // additional payload (partial active user data)
        { username: user.username },
      ),
      // refresh token
      this.signToken<Partial<ActiveUserData>>(
        // ttl (dynamic jwt config)
        this.jwtConfiguration.refreshTokenTtl,
        // default payload (user id)
        user.id,
        // additional payload (partial active user data)
      ),
    ]);
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
      // make new token + refresh token with user
      return this.generateTokens(user);
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  private async signToken<T>(expiresIn: number, userId: number, payload?: T) {
    // payload -> token
    return await this.jwtService.signAsync(
      // user req payload
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
```

# make new auth endpoint for refresh token (src/iam/authentication/dto/refresh-token.dto.ts)

```javascript
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Public } from './decorators/public.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Public()
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
```

```JSON
// sign in with existent user
// url: localhost:3000/authentication/sign-in
// method: post
// raw body (json):
{
  "username": "john_doe",
  "password": "SecurePass123!"
}

// res:
{
	"accessToken": "asd",
	"refreshToken": "asd"
}
```

```JSON
// use refresh token, to get new token
// url: localhost:3000/authentication/refresh-tokens
// method: post
// raw body (json):
{
  "refreshToken": "asd"
}

// res:
{
	"accessToken": "asd",
	"refreshToken": "asd"
}
```

# make custom decor to grab req payload (src/iam/decorators/active-user.decorator.ts)

```javascript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../iam.constants';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

// decor to grab req payload
export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    // get req
    const request: Request = ctx.switchToHttp().getRequest();
    // use key to get req payload
    const user = request[REQUEST_USER_KEY] as ActiveUserData | undefined;
    // return user
    return field ? user?.[field] : user;
  },
);
```

# try it out in any endpoint (in any controller u want)

```javascript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { CreateTeaDto } from './dto/create-tea.dto';
import { UpdateTeaDto } from './dto/update-tea.dto';
import { TeasService } from './teas.service';

@Controller('teas')
export class TeasController {
  constructor(private readonly teasService: TeasService) {}

  @Post()
  create(@Body() createTeaDto: CreateTeaDto) {
    return this.teasService.create(createTeaDto);
  }

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @ActiveUser() user: ActiveUserData | undefined,
  ) {
    console.log(user);
    return this.teasService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.teasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateTeaDto: UpdateTeaDto) {
    return this.teasService.update(id, updateTeaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.teasService.remove(id);
  }
}

```

```JSON
// try to see if user is grabbed from request
// url: localhost:3000/teas
// method: GET

// res:
[
	{
		"id": 14,
		"name": "Green Tea",
		"description": "A soothing and refreshing green tea made from the finest leaves.",
		"price": 5.99,
		"stock": 150,
		"imageUrl": "A soothing and refreshing green tea made from the finest leaves.",
		"createdAt": "2025-01-23T17:24:51.029Z",
		"updatedAt": "2025-01-23T17:24:51.029Z"
	},
	{
		"id": 15,
		"name": "Chamomile Tea",
		"description": "A calming chamomile tea with a floral aroma.",
		"price": 7.49,
		"stock": 80,
		"imageUrl": "A calming chamomile tea with a floral aroma.",
		"createdAt": "2025-01-23T17:25:02.312Z",
		"updatedAt": "2025-01-23T17:25:02.312Z"
	},
	{
		"id": 16,
		"name": "Black Tea",
		"description": null,
		"price": 4.5,
		"stock": 200,
		"imageUrl": "https://example.com/images/black-tea.jpg",
		"createdAt": "2025-01-23T17:25:07.653Z",
		"updatedAt": "2025-01-23T17:25:07.653Z"
	}
]

// server logs user data
// {
//   sub: 1,
//   username: 'john_doe',
//   iat: 1737497256,
//   exp: 1737500856,
//   aud: 'localhost:3000',
//   iss: 'localhost:3000'
// }
```

# [install redis locally](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-linux/)

# start redis locally

```bash
# start and stop it
sudo systemctl start redis-server
sudo systemctl stop redis-server
```

# get ioredis dep (redis client)

```bash
npm i ioredis
```

# create a new serv provider to handle redis talks (for storing token id, to revalidate)

```bash
nest g class iam/authentication/refresh-token-ids.storage --no-spec --flat
```

# restart ESLint helps with seeing new dep types

```
otherwise i get eslint err with ioredis instancing
```

# edit it

```javascript
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';

// todo move this to its own file
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
```

# register it to iam domain

```javascript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage';
import jwtConfig from './config/jwt.config';
import { BcryptService } from './hashing/bcrypt.service';

@Module({
  imports: [
    // register entities
    TypeOrmModule.forFeature([User]),
    // register configs
    ConfigModule.forFeature(jwtConfig),
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
    AccessTokenGuard,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
```

# use it in auth service (save valid token, if user req refresh is correct then del it)

```javascript
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
import { PG_UNIQUE_VIOLATION_ERROR_CODE } from '../iam.constants';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import {
  InvalidatedRefreshTokenError,
  RefreshTokenIdsStorage,
} from './refresh-token-ids.storage';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly bcryptService: BcryptService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      // create entity user instance with hashed password
      const user = new User();
      user.username = signUpDto.username;
      user.password = await this.bcryptService.hash(signUpDto.password);
      // save entity instance with repo
      await this.usersRepository.save(user);
    } catch (err) {
      // handle dup user
      if (err.code === PG_UNIQUE_VIOLATION_ERROR_CODE) {
        throw new ConflictException();
      }
      throw err;
    }
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
    // make token + refresh token
    return await this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    // new refresh token uuid to be saved in redis
    const refreshTokenId = randomUUID();
    // user -> token + refresh token
    const [accessToken, refreshToken] = await Promise.all([
      // access token
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        { username: user.username },
      ),
      // refresh token
      // todo: make interface for refresh token payload
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);
    // save to redis (user id : token uuid)
    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      // get passed in refresh token payload (we want the user id - sub & refresh token id)
      const payload: ActiveUserData & { refreshTokenId: string } =
        await this.jwtService.verifyAsync(
          refreshTokenDto.refreshToken,
          this.jwtConfiguration,
        );
      // find user in this payload
      const user = await this.usersRepository.findOneByOrFail({
        id: payload.sub,
      });
      // get this user saved redis refresh token, compare it to passed refresh token
      const isValid = await this.refreshTokenIdsStorage.validate(
        user.id,
        payload.refreshTokenId,
      );
      if (isValid) {
        // refresh token passed is valid, remove it from redis
        await this.refreshTokenIdsStorage.invalidate(user.id);
      } else {
        // passed refresh token is not the same as the one saved in redis
        throw new Error('Refresh token is invalid');
      }
      // make new token + refresh token with user
      return this.generateTokens(user);
    } catch (err) {
      if (err instanceof InvalidatedRefreshTokenError) {
        // handle when passed refresh token is not the same as the one saved in redis
        throw new UnauthorizedException('Access denied');
      }
      throw new UnauthorizedException();
    }
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    // use this to make token (dynamic payload)
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        // have to explicitly put in like this
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
```

```JSON
// sign in with existent user
// url: localhost:3000/authentication/sign-in
// method: post
// raw body (json):
{
  "username": "john_doe",
  "password": "SecurePass123!"
}

// res:
{
	"accessToken": "asd",
	"refreshToken": "asd"
}

// this refresh is stored in mem

```

```JSON
// use refresh token, to get new token
// url: localhost:3000/authentication/refresh-tokens
// method: post
// raw body (json):
{
  "refreshToken": "asd"
}

// res:
{
	"accessToken": "asd",
	"refreshToken": "asd"
}

// this refresh is removed from mem
```

```JSON
// use refresh token, to get new token again
// url: localhost:3000/authentication/refresh-tokens
// method: post
// raw body (json):
{
  "refreshToken": "asd"
}

// res:
{
	"message": "Access denied",
	"error": "Unauthorized",
	"statusCode": 401
}

// this refresh is removed from mem, so it does not exists! you cannot use it anymore

// set access token ttl 5 min
// frontend have bg process that periodically use refresh token
// attacked only have 5 min window to attack access and refresh token

// u can invalidate refresh token from backend
// that way if frontend tries to use refresh token
// it cannot and thus both its token and refresh token is not valid - logged out
```

# make role enums (users/enums/role.enum.ts)

```javascript
export enum Role {
  Regular = 'regular',
  Admin = 'admin',
}
```

# edit user entity add a new role col

```javascript
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ enum: Role, default: Role.Regular })
  role: Role;

  @BeforeInsert()
  normalizeFields() {
    // trim extra spaces
    this.username = this.username.trim().replace(/\s+/g, ' ');
  }
}
```

# update your existing user with role val (src/repl.ts)

```javascript
import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await repl(AppModule);
}
void bootstrap();
```

# start repl to update user entity via calling nestjs methods

```bash
npm run start -- --entryFile repl
```

# in repl, use user repo to update user entity (update user id 1 role to regular)

```bash
await get("UserRepository").update({ id: 1 }, { role: 'regular' })

# res
# > await get("UserRepository").update({ id: 1 }, { role: 'regular' })
# UpdateResult { generatedMaps: [], raw: [], affected: 1 }
```

# in repl, use user repo get all user to make sure its really mutated

```bash
await get("UserRepository").find()

# res
# > await get("UserRepository").find()
# [
#   User {
#     id: 1,
#     username: 'john_doe',
#     password: '$2b$10$wFWDdyi/26fg4WxZHMevL.Z/C0.yQIcjaUnNeSQq3EcsGyPPw.OU6',
#     role: 'regular'
#   }
# ]
```

# exit repl with ctrl C 3 times

# update active user to hold role data in it, this is the req payload

```javascript
import { Role } from 'src/users/enums/role.enum';

// token payload shape
export interface ActiveUserData {
  sub: number; // this is the user id
  username: string;
  role: Role;
}
```

# edit to include role in req payload (src/iam/authentication/authentication.service.ts)

```javascript
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
    // save to redis (user id : token uuid)
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
      // user req payload
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
```

# make new dir in iam autho, make decors dir in it, create roles.decorator.ts (src/iam/authorization/decorators/role.decorator.ts)

```javascript
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../users/enums/role.enum';

// use my key to get my val
export const ROLE_KEY = 'roles';

export const Roles = (roles: Role) => SetMetadata(ROLE_KEY, roles);
```

# make new guard

```bash
nest g guard iam/authorization/guards/roles --no-spec --flat
```

# edit guard

```javascript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '../../../users/enums/role.enum';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';
import { ROLE_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // get decor key -> (Regular / Admin)
    const contextRole = this.reflector.getAllAndOverride<Role>(ROLE_KEY, [
      // set this decor for decorating handler and class only
      context.getHandler(),
      context.getClass(),
    ]);
    // no decor? pass
    if (!contextRole) {
      return true;
    }
    // get req
    const request: Request = context.switchToHttp().getRequest();
    // use key to get req payload
    const user = request[REQUEST_USER_KEY] as ActiveUserData | undefined;
    // check if logged in user role is the same as decor's
    return contextRole === user?.role;
  }
}
```

# register it globally in iam module

```javascript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage';
import { RolesGuard } from './authorization/guards/roles.guard';
import jwtConfig from './config/jwt.config';
import { BcryptService } from './hashing/bcrypt.service';

@Module({
  imports: [
    // register entities
    TypeOrmModule.forFeature([User]),
    // register configs
    ConfigModule.forFeature(jwtConfig),
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
    AccessTokenGuard,
    // register global
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
```

# decor with admin role (create, update, delete prod with admin role)

```javascript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Roles } from 'src/iam/authorization/decorators/role.decorator';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { Role } from 'src/users/enums/role.enum';
import { CreateTeaDto } from './dto/create-tea.dto';
import { UpdateTeaDto } from './dto/update-tea.dto';
import { TeasService } from './teas.service';

@Controller('teas')
export class TeasController {
  constructor(private readonly teasService: TeasService) {}

  @Roles(Role.Admin)
  @Post()
  create(@Body() createTeaDto: CreateTeaDto) {
    return this.teasService.create(createTeaDto);
  }

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @ActiveUser() user: ActiveUserData | undefined,
  ) {
    console.log(user);
    return this.teasService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.teasService.findOne(id);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateTeaDto: UpdateTeaDto) {
    return this.teasService.update(id, updateTeaDto);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.teasService.remove(id);
  }
}
```

```JSON
// sign in with existent user
// url: localhost:3000/authentication/sign-in
// method: post
// raw body (json):
{
  "username": "john_doe",
  "password": "SecurePass123!"
}

// res:
{
	"accessToken": "asd",
	"refreshToken": "asd"
}

// this refresh is stored in mem
```

```JSON
// create
// url: localhost:3000/teas
// method: post
// raw body (json):
{
  "name": "Green Tea",
  "description": "A soothing and refreshing green tea made from the finest leaves.",
  "price": 5.99,
  "stock": 150,
  "imageUrl": "https://example.com/images/green-tea.jpg"
}

// res
{
	"message": "Forbidden resource",
	"error": "Forbidden",
	"statusCode": 403
}
```

# go to repl, turn this user to admin, then try to make tea

```bash
npm run start -- --entryFile repl
await get("UserRepository").update({ id: 1 }, { role: 'admin' })
```

```JSON
// sign in with existent user
// url: localhost:3000/authentication/sign-in
// method: post
// raw body (json):
{
  "username": "john_doe",
  "password": "SecurePass123!"
}

// res:
{
	"accessToken": "asd",
	"refreshToken": "asd"
}

// this refresh is stored in mem
```

```JSON
// create
// url: localhost:3000/teas
// method: post
// raw body (json):
{
  "name": "New Green Tea",
  "description": "A soothing and refreshing green tea made from the finest leaves.",
  "price": 5.99,
  "stock": 150,
  "imageUrl": "https://example.com/images/green-tea.jpg"
}

// res
{
	"name": "New Green Tea",
	"description": "A soothing and refreshing green tea made from the finest leaves.",
	"price": 5.99,
	"stock": 150,
	"imageUrl": "A soothing and refreshing green tea made from the finest leaves.",
	"id": 17,
	"createdAt": "2025-01-23T21:48:22.908Z",
	"updatedAt": "2025-01-23T21:48:22.908Z"
}
```
