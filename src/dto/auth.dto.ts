export class AuthResult {
  needsMfa: boolean;
  accessToken: string;
  expiresIn: string;
  idToken: string;
  refreshToken: string;
  tokenType: string;
}

export class AuthInputpDto {
  email: string;
  password: string;
}

export class ConfirmUserDto {
  username: string;
  confirmationCode: string;
}

export class SigninDto {
  username: string;
  password: string;
}
