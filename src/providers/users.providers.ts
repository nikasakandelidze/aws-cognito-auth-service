import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  GetUserCommandOutput,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable } from '@nestjs/common';
import { AwsConfigService } from './aws.config.provider';

@Injectable()
export class UserService {
  constructor(
    private readonly awsConfigService: AwsConfigService,
    private cognitoClient: CognitoIdentityProviderClient,
  ) {}

  async filterUsers() {
    const result = await this.cognitoClient.send(
      new ListUsersCommand({
        UserPoolId: this.awsConfigService.getUserPoolId(),
      }),
    );
    return result.Users;
  }

  async getInfoAboutMe(authToken: string): Promise<GetUserCommandOutput> {
    const result = await this.cognitoClient.send(
      new GetUserCommand({ AccessToken: authToken }),
    );
    return result;
  }
}
