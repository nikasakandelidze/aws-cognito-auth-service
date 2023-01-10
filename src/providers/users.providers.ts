import {
  CognitoIdentityProviderClient,
  GetUserCommand,
  GetUserCommandOutput,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSyncDto } from 'src/dto/users.dto';
import { AwsConfigService } from './aws.config.provider';
import { UserEntity } from '../repository/user.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { RoleEntity } from '../repository/role.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly awsConfigService: AwsConfigService,
    private cognitoClient: CognitoIdentityProviderClient,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private dataSource: DataSource,
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

  async syncUserToLocalDb(syncUser: UserSyncDto) {
    if (!syncUser.email || !syncUser.name) {
      throw new BadRequestException({
        message: 'email and name fields are mandatory',
      });
    }
    if (!syncUser.roles) syncUser.roles = [];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await queryRunner.manager.find(UserEntity, {
        where: { email: syncUser.email, name: syncUser.email },
      });
      if (result && result.length > 0) {
        throw new BadRequestException({
          message: 'User with such email already exists',
        });
      }
      const user = new UserEntity();
      user.name = syncUser.name;
      user.email = syncUser.email;
      user.roles = await this.fillRoles(syncUser.roles, queryRunner);
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      return user;
    } catch (e) {
      Logger.warn(e.message);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException({ message: e.message });
    } finally {
      await queryRunner.release();
    }
  }

  async getSyncedUsers() {
    return await this.userRepository.find({ relations: ['roles'] });
  }

  private async fillRoles(
    roles: Array<string>,
    queryRunner: QueryRunner,
  ): Promise<Array<RoleEntity>> {
    return await Promise.all(
      roles
        .map(async (role) => {
          const roleResult = await queryRunner.manager.findOne(RoleEntity, {
            where: { title: role },
          });
          if (!roleResult) {
            const newRole = new RoleEntity();
            newRole.title = role;
            return await queryRunner.manager.save(newRole);
          } else {
            return roleResult;
          }
        })
        .filter((role) => role !== undefined),
    );
  }
}
