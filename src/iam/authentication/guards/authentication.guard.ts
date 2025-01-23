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
