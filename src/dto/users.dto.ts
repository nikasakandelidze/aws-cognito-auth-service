export class User {
  username: string;
  email: string;
  verified: boolean;
  sub: string;
}

export class UserSyncDto {
  email: string;
  name: string;
  roles: Array<string>;
}
