import { Module } from '@nestjs/common';
import { LevelsService } from './levels.service';
import { LevelsController } from './levels.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Levels, LevelsSchema } from './levels.schema';
import { AuthModule } from '../auth/auth.module';
import {
  GameSessions,
  GameSessionsSchema,
} from '../game-sessions/game-sessions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Levels.name, schema: LevelsSchema },
      {
        name: GameSessions.name,
        schema: GameSessionsSchema,
      },
    ]),
    AuthModule,
  ],
  controllers: [LevelsController],
  providers: [LevelsService],
  exports: [LevelsService],
})
export class LevelsModule {}
