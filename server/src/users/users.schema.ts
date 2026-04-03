import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<Users>;

@Schema()
export class Users {
  _id: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: [] })
  sessions: string[];

  @Prop({ required: true, default: 'user' })
  role: 'user' | 'admin';
}

export const UsersSchema = SchemaFactory.createForClass(Users);
