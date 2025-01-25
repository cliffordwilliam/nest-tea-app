import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '../../../users/enums/role.enum';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';
import { ROLE_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // get decor vals (roles list)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      // no decor roles list, always pass
      this.logger.debug('No roles specified, granting access');
      return true;
    }

    // get req user
    const request = context.switchToHttp().getRequest<Request>();
    const user = request[REQUEST_USER_KEY] as ActiveUserData;

    // no req user
    if (!user) {
      this.logger.warn('Unauthorized access attempt: User not authenticated');
      throw new UnauthorizedException(
        'Authentication required to access this resource.',
      );
    }

    // req user role prop missing
    if (!user.role) {
      this.logger.warn(
        `Unauthorized access attempt by user ID ${user.sub}: Role is missing`,
      );
      throw new ForbiddenException(
        'You do not have the necessary permissions to access this resource.',
      );
    }

    // req user role in decor roles list?
    const hasRole = requiredRoles.includes(user.role);
    // no
    if (!hasRole) {
      this.logger.warn(
        `Access denied for user ID ${user.sub} (${user.username}): Required roles - ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException(
        'You do not have sufficient permissions to access this resource.',
      );
    }
    // yes
    this.logger.log(`Access granted to user ID ${user.sub} (${user.username})`);
    return true;
  }
}
