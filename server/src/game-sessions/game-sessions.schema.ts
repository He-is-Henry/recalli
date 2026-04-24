import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Users } from '../users/users.schema';
import { GameStatus } from './dto/create-game-session.dto';

export type GameSessionsDocument = HydratedDocument<GameSessions>;

@Schema()
export class GameSessions {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Users.name,
    required: true,
  })
  user: mongoose.Types.ObjectId;

  @Prop()
  level: number;

  @Prop({ default: [] })
  clicks: {
    boxIndex: number;
    correct: boolean;
    createdAt: Date;
  }[];

  @Prop({ default: [] })
  found: number[];

  @Prop({ default: [] })
  warnings: number[];

  @Prop({ type: String, enum: GameStatus, default: 'playing', required: true })
  status: GameStatus;
}

export const GameSessionsSchema = SchemaFactory.createForClass(GameSessions);
