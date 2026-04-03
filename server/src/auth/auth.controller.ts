import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import { AuthGuard } from './auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from '../users/users.schema';
import { Model } from 'mongoose';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private authService: AuthService,
  ) {}

  @Post('signup')
  async signup(@Body() signInDto: { email: string; password: string }) {
    return await this.authService.create(signInDto);
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
