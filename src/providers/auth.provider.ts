import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuthInputpDto, ConfirmUserDto } from 'src/dto/auth.dto';
import {
  CognitoUserPool,
  CognitoUser,
  ICognitoUserPoolData,
  ISignUpResult,
  ICognitoUserData,
} from 'amazon-cognito-identity-js';
import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { AwsConfigService } from './aws.config.provider';

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool;

  constructor(
    private cognitoClient: CognitoIdentityProviderClient,
    private readonly awsConfig: AwsConfigService,
  ) {
    const poolData: ICognitoUserPoolData = {
      UserPoolId: this.awsConfig.getUserPoolId(),
      ClientId: this.awsConfig.getClientId(),
    };
    this.userPool = new CognitoUserPool(poolData);
  }

  async registerUser(authInput: AuthInputpDto): Promise<ISignUpResult> {
    if (!authInput.email || !authInput.password) {
      throw new BadRequestException({
        message: 'Email and Password must both be specified',
      });
    }
    return new Promise((resolve, reject) => {
      this.userPool.signUp(
        authInput.email,
        authInput.password,
        [],
        null,
        (err, result) => {
          if (err) {
            reject(err);
            Logger.log(
              `Error while trying to signup. Description: ${err.message}`,
            );
          } else {
            Logger.log(`Succesfully signed up. Signup response: ${result}`);
            resolve(result);
          }
        },
      );
    });
  }

  async confirmUser(confirmUserDto: ConfirmUserDto): Promise<any> {
    const userData: ICognitoUserData = {
      Username: confirmUserDto.username,
      Pool: this.userPool,
    };
    const cognitoUser = new CognitoUser(userData);
    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(
        confirmUserDto.confirmationCode,
        false,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        },
      );
    });
  }

  async login(authInput: AuthInputpDto) {
    const loginData: any = {
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: authInput.email,
        PASSWORD: authInput.password,
      },
      ClientId: this.awsConfig.getClientId(),
      UserPoolId: this.awsConfig.getUserPoolId(),
    };
    const loginResult = await this.cognitoClient.send(
      new AdminInitiateAuthCommand(loginData),
    );
    return loginResult;
  }
}
