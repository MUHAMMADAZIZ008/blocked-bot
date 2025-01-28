import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UserSchema } from 'src/schema/users.schema';
import { TelegrafModule } from 'nestjs-telegraf';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: '7862835353:AAEULWJaydANcAb96QWxdtTOlx3XvN1iroU', // Telegram bot tokenini bu yerga yozing
    }), //7862835353:AAEULWJaydANcAb96QWxdtTOlx3XvN1iroU // 7699328433:AAFx_QfMSzoGIzv-PzmD_6dW6OX8tmBAOFA
    MongooseModule.forFeature([{ name: Users.name, schema: UserSchema }]),
  ],
  providers: [BotService],
})
export class BotModule {}
