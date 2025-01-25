import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../iam.constants';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

// decor to grab req user
export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    // req -> req user
    const request: Request = ctx.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY] as ActiveUserData;
    return field ? user?.[field] : user;
  },
);
