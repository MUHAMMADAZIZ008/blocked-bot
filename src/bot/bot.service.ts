import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { Users } from 'src/schema/users.schema';
import { Telegraf } from 'telegraf';
import { Context } from 'telegraf';

@Update()
@Injectable()
export class BotService implements OnModuleInit {
  private readonly groupId = '-1002415061771'; // Guruh ID'sini bu yerda ko'rsating

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @InjectModel(Users.name) private readonly userModel: Model<Users>,
  ) {} // Botni injekt qilamiz

  onModuleInit() {
    console.log('BotService moduli ishga tushdi');
  }

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply('Salom! Bot ishga tushdi.');
  }
  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    const userId = ctx.message?.from?.id;
    const chatId = ctx.message?.chat?.id;
    console.log(userId);

    const currentUser = await this.userModel.findOne({ telegram_id: userId });

    if (!currentUser) {
      const user = ctx.from;
      const newUser = {
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        telegram_id: user.id,
        last_active: Date.now(),
        chat_id: chatId,
      };
      await this.userModel.create(newUser);
    }
  }

  async checkInactiveUsers() {
    // const now = Date.now();
    const users = await this.userModel.find({ chat_id: this.groupId });

    for (const user of users) {
      if (
        // now - user.last_active > 1 * 60 * 1000 &&
        user.telegram_id !== 7699328433 &&
        user.telegram_id !== 5456276170
      ) {
        // 24 keyin tekshirish
        try {
          console.log('a');

          await this.kickUser(user.telegram_id);
        } catch (err) {
          console.error(`Foydalanuvchini chiqarishda xatolik: ${err}`);
        }
      }
    }
  }

  private async kickUser(userId: number) {
    try {
      await this.bot.telegram.kickChatMember(this.groupId, userId);
      await this.userModel.deleteOne({ telegram_id: userId });
      console.log(`Foydalanuvchi (${userId}) guruhdan chiqarildi.`);
    } catch (err) {
      console.error(`Foydalanuvchini chiqarishda xatolik: ${err}`);
    }
  }

  // @Cron('*/2 * * * * *')
  @Cron('0 6 * * *')
  handleCron() {
    this.checkInactiveUsers();
  }
}
