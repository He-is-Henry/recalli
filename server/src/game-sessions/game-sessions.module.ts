import { Module } from '@nestjs/common';
import { GameSessionsService } from './game-sessions.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GameSessions, GameSessionsSchema } from './game-sessions.schema';
import { GameSessionsController } from './game-sessions.controller';
import { AuthModule } from '../auth/auth.module';
import { Levels, LevelsSchema } from '../levels/levels.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GameSessions.name,
        schema: GameSessionsSchema,
      },
      { name: Levels.name, schema: LevelsSchema },
    ]),
    AuthModule,
  ],
  controllers: [GameSessionsController],
  providers: [GameSessionsService],
  exports: [MongooseModule],
})
export class GameSessionsModule {}
