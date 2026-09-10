import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Users } from '../users/users.schema';
import { Hospital } from '../hospitals/hospitals.schema';

export type PatientHospitalLinkDocument = HydratedDocument<PatientHospitalLink>;

export enum LinkStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
}

export enum LinkCreatedBy {
  PATIENT = 'PATIENT',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
}

@Schema({ timestamps: true })
export class PatientHospitalLink {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Users.name,
    required: true,
  })
  patientId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Hospital.name,
    required: true,
  })
  hospitalId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Users.name })
  staffId?: mongoose.Types.ObjectId; // Assigned clinician/doctor

  @Prop({ type: String, enum: LinkStatus, default: LinkStatus.PENDING })
  status: LinkStatus;

  @Prop({ type: String, enum: LinkCreatedBy, default: LinkCreatedBy.PATIENT })
  createdBy: LinkCreatedBy;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Users.name })
  verifiedBy?: mongoose.Types.ObjectId;

  @Prop()
  verifiedAt?: Date;
}

export const PatientHospitalLinkSchema =
  SchemaFactory.createForClass(PatientHospitalLink);
PatientHospitalLinkSchema.index(
  { patientId: 1, hospitalId: 1 },
  { unique: true },
);
PatientHospitalLinkSchema.index({ hospitalId: 1, staffId: 1 });
