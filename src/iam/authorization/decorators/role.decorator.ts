import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../users/enums/role.enum';

// use my key to get my val
export const ROLE_KEY = 'roles';

/**
 * Decorator to specify roles for a route or controller
 * Usage: @Roles(Role.Admin, Role.Regular)
 */
export const Roles = (...roles: Role[]) => {
  return SetMetadata(ROLE_KEY, roles);
};
