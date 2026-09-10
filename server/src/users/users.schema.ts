import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

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

@Schema({ timestamps: true })
export class Users {
  @Prop({ unique: true, sparse: true })
  publicId?: string; // e.g. PAT-1000 for patients

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' })
  hospitalId?: mongoose.Types.ObjectId;

  @Prop({})
  createdAt: Date;

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

  @Prop({
    required: true,
    default: 'user',
    enum: ['user', 'admin', 'hospital_admin', 'hospital_staff'],
  })
  role: 'user' | 'admin' | 'hospital_admin' | 'hospital_staff';
}

export const UsersSchema = SchemaFactory.createForClass(Users);
