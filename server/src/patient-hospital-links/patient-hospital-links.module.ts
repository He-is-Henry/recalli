import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PatientHospitalLink,
  PatientHospitalLinkSchema,
} from './patient-hospital-link.schema';
import { PatientHospitalLinksService } from './patient-hospital-links.service';
import { PatientHospitalLinksController } from './patient-hospital-links.controller';
import { Users, UsersSchema } from '../users/users.schema';
import { GameSessionsModule } from '../game-sessions/game-sessions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PatientHospitalLink.name, schema: PatientHospitalLinkSchema },
      { name: Users.name, schema: UsersSchema },
    ]),
    GameSessionsModule,
  ],
  controllers: [PatientHospitalLinksController],
  providers: [PatientHospitalLinksService],
  exports: [PatientHospitalLinksService],
})
export class PatientHospitalLinksModule {}
