import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../iam.constants';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

// decor to grab req token data
export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    // get req
    const request: Request = ctx.switchToHttp().getRequest();
    // use key to get req token data
    const user = request[REQUEST_USER_KEY] as ActiveUserData | undefined;
    // return user
    return field ? user?.[field] : user;
  },
);
