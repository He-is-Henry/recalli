import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameSessionsController } from './game-sessions.controller';
import { GameSessionsService } from './game-sessions.service';
import { GameSessions, GameSessionsSchema } from './game-sessions.schema';
import { Levels, LevelsSchema } from '../levels/levels.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameSessions.name, schema: GameSessionsSchema },
      { name: Levels.name, schema: LevelsSchema },
    ]),
  ],
  controllers: [GameSessionsController],
  providers: [GameSessionsService],
  exports: [GameSessionsService],
})
export class GameSessionsModule {}
