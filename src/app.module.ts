import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BotModule } from './bot/bot.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://muhammadaziz:Mm08gulomov@cluster0.or776.mongodb.net/<blocked-user>?retryWrites=true&w=majority',
      {
        retryAttempts: 5,
        retryDelay: 3000,
      },
    ),
    BotModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
