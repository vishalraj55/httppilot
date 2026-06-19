import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('firebase'))
  @Get('me')
  async getMe(@Req() req) {
    const firebaseUser = req.user;
    return this.usersService.findOrCreate(
      firebaseUser.uid,
      firebaseUser.email,
      firebaseUser.name,
    );
  }
}
