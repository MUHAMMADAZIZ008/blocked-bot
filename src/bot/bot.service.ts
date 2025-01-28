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
  private readonly groupId = '-1002498407388'; // Guruh ID'sini bu yerda ko'rsating
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

    const messageId = ctx.message?.message_id; // Xabar ID'sini olish
    console.log(ctx);

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

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
        limit: 4, // Cheklovni qo'shish
      };
      await this.userModel.create(newUser);
    }
    if (currentUser) {
      if (currentHour === 6 && currentMinute >= 0 && currentMinute <= 10) {
        await this.userModel.updateOne(
          { telegram_id: currentUser.telegram_id },
          { last_active: now },
        );

        await ctx.reply(
          `Good ${currentUser.first_name || currentUser.last_name || currentUser.username} 🥳`,
          { reply_parameters: { message_id: messageId } },
        );
      } else {
        await this.userModel.updateOne(
          { telegram_id: currentUser.telegram_id },
          { limit: currentUser.limit - 1 },
        );
      }
    }
  }

  async checkInactiveUsers() {
    const now = Date.now();
    const users = await this.userModel.find({ chat_id: this.groupId });

    for (const user of users) {
      if (
        now - user.last_active > 24 * 60 * 60 * 1000 &&
        user.telegram_id !== 7862835353 &&
        user.telegram_id !== 5456276170
      ) {
        try {
          if (user.limit < 0) {
            await this.kickUser(user.telegram_id);
          } else {
            this.sendWarning(user);
          }
        } catch (err) {
          console.error(`Foydalanuvchini chiqarishda xatolik: ${err}`);
        }
      }
    }
  }

  sendWarning(user: any) {
    this.bot.telegram.sendMessage(
      this.groupId,
      `Hello, @${user.username}. If you don't complete the challenges ${user.limit} more times, you will be removed from the group.`,
    );
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
  @Cron('0 2 * * *')
  handleCron() {
    this.checkInactiveUsers();
  }
}
