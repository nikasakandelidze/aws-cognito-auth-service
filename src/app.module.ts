import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './providers/auth.provider';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { UserService } from './providers/users.providers';
import { AwsConfigService } from './providers/aws.config.provider';

const DEFAULT_REGION = 'us-east-1';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: '.development.env' })],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    UserService,
    AwsConfigService,
    {
      provide: CognitoIdentityProviderClient,
      useFactory: (configService: ConfigService) => {
        return new CognitoIdentityProviderClient({
          region: configService.get<string>('AWS_REGION') || DEFAULT_REGION,
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
