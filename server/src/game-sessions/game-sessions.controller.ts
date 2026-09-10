import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { GameSessionsService } from './game-sessions.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import type { Request } from 'express';

@UseGuards(AuthGuard, RolesGuard)
@Controller('game-sessions')
export class GameSessionsController {
  constructor(private readonly gameSessionsService: GameSessionsService) {}

  @Roles(['user'])
  @Get('me')
  getMySessions(@Req() req: Request) {
    return this.gameSessionsService.findByUser(req.user!.sub);
  }

  @Roles(['user'])
  @Get(':level/start')
  startSession(
    @Req() req: Request,
    @Param('level', ParseIntPipe) level: number,
  ) {
    return this.gameSessionsService.startGame(req.user!.sub, level);
  }

  @Roles(['user'])
  @Post(':level/click')
  clickTile(
    @Req() req: Request,
    @Param('level', ParseIntPipe) level: number,
    @Body('boxIndex', ParseIntPipe) boxIndex: number,
  ) {
    return this.gameSessionsService.handleClick(req.user!.sub, level, boxIndex);
  }

  @Roles(['user'])
  @Post(':level/restart')
  restartSession(
    @Req() req: Request,
    @Param('level', ParseIntPipe) level: number,
  ) {
    return this.gameSessionsService.startGame(req.user!.sub, level, true);
  }

  @Roles(['user'])
  @Post(':level/review')
  reviewSession(
    @Req() req: Request,
    @Param('level', ParseIntPipe) level: number,
  ) {
    return this.gameSessionsService.handleReview(req.user!.sub, level);
  }
}
