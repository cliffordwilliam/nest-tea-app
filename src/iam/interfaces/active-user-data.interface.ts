import { Role } from 'src/users/enums/role.enum';

// req user / token payload shape
export interface ActiveUserData {
  // default req user (user id)
  sub: number;
  // additional req user (partial)
  username: string;
  refreshTokenId: string;
  role: Role;
}
