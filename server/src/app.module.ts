import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { PatientHospitalLinksModule } from './patient-hospital-links/patient-hospital-links.module';
import { GameSessionsModule } from './game-sessions/game-sessions.module';
import { LevelsModule } from './levels/levels.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    AuthModule,
    UsersModule,
    HospitalsModule,
    PatientHospitalLinksModule,
    GameSessionsModule,
    LevelsModule,
  ],
})
export class AppModule {}
