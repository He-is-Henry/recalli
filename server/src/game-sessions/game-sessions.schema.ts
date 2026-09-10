import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Users } from '../users/users.schema';
import { GameStatus } from './dto/create-game-session.dto';

@Schema({ timestamps: true })
export class GameSessions {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Users.name,
    required: true,
  })
  user: mongoose.Types.ObjectId;

  @Prop({ required: true })
  level: number;

  @Prop({
    type: [
      {
        boxIndex: Number,
        correct: Boolean,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  clicks: {
    boxIndex: number;
    correct: boolean;
    createdAt: Date;
  }[];

  @Prop({ type: [Number], default: [] })
  found: number[];

  @Prop({ type: [Number], default: [] })
  warnings: number[];

  @Prop({
    type: String,
    enum: GameStatus,
    default: GameStatus.PLAYING,
    required: true,
  })
  status: GameStatus;

  @Prop({ default: Date.now })
  startedAt: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  duration?: number;
}

// Intersect GameSessions with Document so createdAt and updatedAt auto-complete
export type GameSessionsDocument = GameSessions & Document;

export const GameSessionsSchema = SchemaFactory.createForClass(GameSessions);
