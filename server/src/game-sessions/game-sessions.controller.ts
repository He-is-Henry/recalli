import {
  Controller,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  Post,
} from '@nestjs/common';
import { GameSessionsService } from './game-sessions.service';
import { AuthGuard } from '../auth/auth.guard';
import type { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('game-sessions')
export class GameSessionsController {
  constructor(private readonly gameSessionsService: GameSessionsService) {}

  @Get(':level/start')
  async startGame(@Param('level') level: number, @Req() request: Request) {
    return await this.gameSessionsService.startGame(request.user!.sub, level);
  }

  @Post(':level/click')
  async handleClick(
    @Body() body: { boxIndex: number },
    @Param('level') level: string,
    @Req() request: Request,
  ) {
    return await this.gameSessionsService.handleClick(
      request.user!.sub,
      +level,
      body.boxIndex,
    );
  }

  @Post(':level/restart')
  async restartGame(@Param('level') level: string, @Req() request: Request) {
    return await this.gameSessionsService.startGame(
      request.user!.sub,
      +level,
      true,
    );
  }
}
