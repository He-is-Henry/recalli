import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  async signup(@Body() signInDto: { email: string; password: string }) {
    await this.usersService.create(signInDto);
    return await this.authService.signIn(signInDto.email, signInDto.password);
  }
  @Post('login')
  signin(@Body() signInDto: { email: string; password: string }) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getUser(@Req() request: Request) {
    return this.authService.getUser(request.user!.sub);
  }
}
