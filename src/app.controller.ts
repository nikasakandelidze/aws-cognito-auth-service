import { Body, Controller, Post, Get, Headers } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthInputpDto, ConfirmUserDto } from './dto/auth.dto';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('auth/signup')
  async signup(@Body() authInput: AuthInputpDto) {
    return await this.appService.signup(authInput);
  }

  @Post('auth/confirm')
  async confirmUser(@Body() confirmUserDto: ConfirmUserDto) {
    return await this.appService.confirmUser(confirmUserDto);
  }
  @Post('auth/signin')
  async signin(@Body() authInput: AuthInputpDto) {
    return await this.appService.signin(authInput);
  }

  @Get('users/me')
  async getInfoAboutMe(@Headers('Authorization') auth: string) {
    return await this.appService.getInfoAboutMe(auth);
  }

  @Get('users')
  async filterUsers() {
    return await this.appService.filterForUsers();
  }
}
