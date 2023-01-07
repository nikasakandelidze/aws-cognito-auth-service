import { GetUserCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { Injectable, BadRequestException } from '@nestjs/common';
import { CognitoUser, ISignUpResult } from 'amazon-cognito-identity-js';
import { handleCognitoError } from './commons/errorHandler';
import { AuthInputpDto, ConfirmUserDto } from './dto/auth.dto';
import { User } from './dto/users.dto';
import { AuthService } from './providers/auth.provider';
import { UserService } from './providers/users.providers';

@Injectable()
export class AppService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async signup(authInput: AuthInputpDto): Promise<CognitoUser> {
    if (!authInput.email || !authInput.password) {
      throw new BadRequestException({
        message: 'username and password must be specified',
      });
    }
    const result: ISignUpResult = await this.authService
      .registerUser(authInput)
      .catch(handleCognitoError);
    return result.user;
  }

  async confirmUser(confirmUserDto: ConfirmUserDto) {
    if (!confirmUserDto.confirmationCode || !confirmUserDto.username) {
      throw new BadRequestException({
        message: 'username and confirmation codes must be specified',
      });
    }
    const confirmResult = await this.authService
      .confirmUser(confirmUserDto)
      .catch(handleCognitoError);
    return { message: confirmResult };
  }

  async signin(authInput: AuthInputpDto): Promise<any> {
    const signinResult = this.authService
      .login(authInput)
      .catch(handleCognitoError);
    return (await signinResult).AuthenticationResult;
  }

  async getInfoAboutMe(authToken: string): Promise<User> {
    if (!authToken || !authToken.startsWith('Bearer')) {
      throw new BadRequestException({
        message:
          'Authorization header must be specified and of valid Bearer format',
      });
    }
    const token = authToken.split(' ').pop();
    const output: GetUserCommandOutput = await this.userService
      .getInfoAboutMe(token)
      .catch(handleCognitoError);
    const attributesMap: Record<string, string> = output.UserAttributes.reduce(
      (acc, curr) => ({ ...acc, [curr.Name]: curr.Value }),
      {},
    );
    const result: User = {
      username: output.Username,
      email: attributesMap['email'],
      verified: attributesMap['email_verified'] === 'true',
      sub: attributesMap['sub'],
    };
    return result;
  }

  async filterForUsers() {
    const result = await this.userService
      .filterUsers()
      .catch(handleCognitoError);
    return result;
  }
}
