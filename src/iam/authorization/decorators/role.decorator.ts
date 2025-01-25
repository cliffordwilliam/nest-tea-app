import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../users/enums/role.enum';

// use my key to get my val
export const ROLE_KEY = 'roles';

/**
 * Decorator to specify roles for a route or controller
 * @param roles - List of roles that are allowed to access the route
 * Usage: @Roles(Role.Admin, Role.User)
 */
export const Roles = (...roles: Role[]) => {
  return SetMetadata(ROLE_KEY, roles);
};
