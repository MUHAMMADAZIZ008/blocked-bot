import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BotModule } from './bot/bot.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/blocked-bot'),
    BotModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
