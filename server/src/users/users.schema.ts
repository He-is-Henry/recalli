import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<Users>;

export interface Session {
  refreshToken: string;
  ip: string;
  device: string;
  os?: string;
  browser?: string;
  userAgent: string;
  createdAt: Date;
}

@Schema()
export class Users {
  _id: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [
      {
        refreshToken: String,
        ip: String,
        device: String,
        os: String,
        browser: String,
        userAgent: String,
        createdAt: Date,
      },
    ],
    default: [],
  })
  sessions: Session[];

  @Prop({ required: true, default: 'user' })
  role: 'user' | 'admin';
}

export const UsersSchema = SchemaFactory.createForClass(Users);
