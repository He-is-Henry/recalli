import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type HospitalDocument = HydratedDocument<Hospital>;

@Schema({ timestamps: true })
export class Hospital {
  @Prop({ required: true, unique: true })
  publicId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop()
  address?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  adminUser?: mongoose.Types.ObjectId;
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);
HospitalSchema.index({ name: 'text', publicId: 'text' });
