import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsConfigService {
  private readonly CLIENT_ID: string;
  private readonly POOL_ID: string;

  constructor(private readonly configService: ConfigService) {
    this.CLIENT_ID = this.configService.get<string>('COGNITO_CLIENT_ID');
    this.POOL_ID = this.configService.get<string>('COGNITO_POOL_ID');
    if (!this.CLIENT_ID || !this.POOL_ID) {
      Logger.error(
        `No aws clientId or pool id provided as env variables. Stopping the application. Please provide them before running the app.`,
      );
      process.exit(0);
    }
  }

  getClientId(): string {
    return this.CLIENT_ID;
  }

  getUserPoolId(): string {
    return this.POOL_ID;
  }
}
