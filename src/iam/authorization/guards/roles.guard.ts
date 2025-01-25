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
    // Extract roles metadata from handler or class
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      // No roles specified, allow access
      this.logger.debug('No roles specified, granting access');
      return true;
    }

    // Extract request and user data
    const request = context.switchToHttp().getRequest<Request>();
    const user = request[REQUEST_USER_KEY] as ActiveUserData | undefined;

    if (!user) {
      // User not authenticated
      this.logger.warn('Unauthorized access attempt: User not authenticated');
      throw new UnauthorizedException(
        'Authentication required to access this resource.',
      );
    }

    if (!user.role) {
      // User authenticated but role missing
      this.logger.warn(
        `Unauthorized access attempt by user ID ${user.sub}: Role is missing`,
      );
      throw new ForbiddenException(
        'You do not have the necessary permissions to access this resource.',
      );
    }

    // Check if the user's role is included in the required roles
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      this.logger.warn(
        `Access denied for user ID ${user.sub} (${user.username}): Required roles - ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException(
        'You do not have sufficient permissions to access this resource.',
      );
    }

    this.logger.log(`Access granted to user ID ${user.sub} (${user.username})`);
    return true;
  }
}
