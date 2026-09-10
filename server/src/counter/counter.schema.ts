import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CounterDocument = HydratedDocument<Counter>;

@Schema()
export class Counter {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, default: 1000 })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
