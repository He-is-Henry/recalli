import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GameSessionsModule } from './game-sessions/game-sessions.module';
import { LevelsModule } from './levels/levels.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    LevelsModule,
    GameSessionsModule,
    UsersModule,
    AuthModule,
    GameSessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
