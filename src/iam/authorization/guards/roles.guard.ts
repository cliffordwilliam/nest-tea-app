import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../../users/enums/role.enum';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';
import { ROLE_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // get decor val (user roles enum)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // no decor val? pass
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // req -> req user
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request[REQUEST_USER_KEY] as ActiveUserData) || null;

    // no req user?
    if (!user) {
      this.logger.warn('Unauthorized access attempt: User not authenticated');
      throw new UnauthorizedException('User not authenticated.');
    }

    // req user has no role prop?
    if (!user.role) {
      this.logger.warn(`Unauthorized access attempt: User role is missing`);
      throw new ForbiddenException('User role is missing.');
    }

    // req user role is in decor roles list?
    const hasRole = requiredRoles.includes(user.role);
    // no? throw
    if (!hasRole) {
      this.logger.warn(
        `Unauthorized access attempt by user ${user.username}. Required roles: ${requiredRoles.join(
          ', ',
        )}`,
      );
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }
    // yes? pass
    return true;
  }
}
