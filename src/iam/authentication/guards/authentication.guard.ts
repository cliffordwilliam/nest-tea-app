import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import jwtConfig from '../../config/jwt.config';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { PUBLIC_ROUTE_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticationGuard.name);

  constructor(
    private readonly reflector: Reflector,
    // inject servs
    private readonly jwtService: JwtService,
    // inject configs
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // get decor val (bool)
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // got decor? pass
    if (isPublic) {
      this.logger.log('Accessing public route');
      return true;
    }

    // no decor?

    // req -> token (auto throw)
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    try {
      // token -> payload
      const payload: ActiveUserData = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      // payload -> req user
      request[REQUEST_USER_KEY] = payload;

      this.logger.log(
        `User authenticated successfully (ID: ${payload.sub}, Role: ${payload.role})`,
      );

      // can pass
      return true;
    } catch (error) {
      this.logger.error('Token validation failed', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string {
    // req got auth header bearer token?
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Invalid or missing Authorization header');
      throw new UnauthorizedException('Authorization token is missing');
    }

    // extract and return the token
    return authHeader.split(' ')[1];
  }
}
