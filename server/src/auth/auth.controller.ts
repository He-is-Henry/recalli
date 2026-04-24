import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { AuthGuard } from './auth.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from '../users/users.schema';
import { Model } from 'mongoose';
import { RealMetadata } from './device.decorator';
import { MetadataDto } from './metadata.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private authService: AuthService,
  ) {}

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });
  }

  @Post('signup')
  async signup(
    @Body() signInDto: { email: string; password: string },
    @RealMetadata() metadata: MetadataDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.create(signInDto);
    const { accessToken, refreshToken } = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
      metadata,
    );
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('login')
  async login(
    @Body() signInDto: { email: string; password: string },
    @RealMetadata() metadata: MetadataDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
      metadata,
    );
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    console.log(cookies);
    if (!cookies) throw new UnauthorizedException('No refresh token');
    const token = cookies.refresh_token;
    console.log(token);
    if (!token) throw new UnauthorizedException('No refresh token');

    const { accessToken, refreshToken } = await this.authService.refresh(token);

    res.clearCookie('refresh_token');
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getUser(@Req() request: Request) {
    return this.authService.getUser(request.user!.sub);
  }
}
