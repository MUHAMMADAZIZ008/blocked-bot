import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BotModule } from './bot/bot.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/blocked-user'), //mongodb+srv://muhammadaziz:Mm08gulomov@cluster0.or776.mongodb.net/blocked-user?retryWrites=true&w=majority&tls=false
    BotModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
