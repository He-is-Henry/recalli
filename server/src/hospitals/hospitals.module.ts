import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hospital, HospitalSchema } from './hospitals.schema';
import { HospitalsService } from './hospitals.service';
import { HospitalsController } from './hospitals.controller';
import { CounterModule } from '../counter/counter.module';
import { AuthModule } from '../auth/auth.module';
import { Users, UsersSchema } from '../users/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hospital.name, schema: HospitalSchema },
      { name: Users.name, schema: UsersSchema },
    ]),
    CounterModule,
    AuthModule,
  ],
  controllers: [HospitalsController],
  providers: [HospitalsService],
  exports: [HospitalsService, MongooseModule],
})
export class HospitalsModule {}
