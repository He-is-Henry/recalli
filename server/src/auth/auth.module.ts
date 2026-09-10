import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { Users, UsersSchema } from '../users/users.schema';
import { PatientHospitalLinksModule } from '../patient-hospital-links/patient-hospital-links.module';
import { CounterModule } from '../counter/counter.module';

@Module({
  imports: [
    UsersModule,
    PatientHospitalLinksModule,
    CounterModule, // Provides CounterService to AuthService
    MongooseModule.forFeature([{ name: Users.name, schema: UsersSchema }]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
