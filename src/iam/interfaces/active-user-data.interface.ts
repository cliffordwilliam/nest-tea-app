import { Role } from 'src/users/enums/role.enum';

export interface ActiveUserData {
  sub: number; // this is the user id
  username: string;
  refreshTokenId: string; // todo: move this to its own file?
  role: Role;
}
