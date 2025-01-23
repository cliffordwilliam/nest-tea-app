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
    // use key to get req token data
    const user = request[REQUEST_USER_KEY] as ActiveUserData | undefined;
    // check if logged in user role is the same as decor's
    return contextRole === user?.role;
  }
}
