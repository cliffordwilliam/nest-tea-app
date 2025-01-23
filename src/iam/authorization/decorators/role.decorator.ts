import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../users/enums/role.enum';

// use my key to get my val
export const ROLE_KEY = 'roles';

export const Roles = (roles: Role) => SetMetadata(ROLE_KEY, roles);
