import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LevelsDocument = HydratedDocument<Levels>;

@Schema()
export class Levels {
  _id: string;

  @Prop({ required: true, unique: true })
  level: number;

  @Prop({ required: true })
  grid: number[];

  @Prop({ required: true })
  pattern: number[];

  @Prop({ required: true })
  story: string;

  video: string;

  audio: string;
}

export const LevelsSchema = SchemaFactory.createForClass(Levels);
