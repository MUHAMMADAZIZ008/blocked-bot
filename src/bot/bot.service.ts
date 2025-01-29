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
  private readonly groupId = '-1002498407388';
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    @InjectModel(Users.name) private readonly userModel: Model<Users>,
  ) {}

  onModuleInit() {
    console.log('BotService moduli ishga tushdi');
  }

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply(`Salom! ${ctx.from.first_name}`);
  }

  @On('message')
  async onMessage(@Ctx() ctx: Context): Promise<any> {
    const userId = ctx.message?.from?.id;
    const chatId = ctx.message?.chat?.id;
    const messageId = ctx.message?.message_id;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    let currentUser = await this.userModel.findOne({ telegram_id: userId });

    if (!currentUser) {
      await this.saveToDb(ctx.from, chatId);
      currentUser = await this.userModel.findOne({ telegram_id: userId });
    }

    const challengeKey = ctx.text?.toLowerCase().trim() || '';
    if (challengeKey === 'challenge') {
      await ctx.reply(
        `
        Tabriklayman siz challenge ishtirokchisiga aylandingiz!
        Shartlar:

        1. Ishtirok vaqti: 5:40 dan 6:30 gacha
        2. Ishtirok uchun kalit: uyg'ondim va turdim
        3. Kalitni aniq yuborish!
        `,
      );
    }

    // 48 soatdan ko‘p vaqt davomida yozmagan foydalanuvchilar
    if (challengeKey === `uyg'ondim va turdim`) {
      if (
        now.getTime() - currentUser.last_active.getTime() >
        48 * 60 * 60 * 1000
      ) {
        await ctx.reply(
          'Siz challengedan chiqib ketgansiz, chunki 2 kun ketma-ket atilgan shartlarni bajarmagansiz!',
        );
      }

      // 05:50 - 06:30 oralig'ida xabarlarni qabul qilish
      if (
        (currentHour === 5 && currentMinute >= 50) ||
        (currentHour === 6 && currentMinute <= 30)
      ) {
        await this.userModel.updateOne(
          { telegram_id: userId },
          { last_active: now },
        );
        ctx.reply(
          `Juda yaxshi! ${currentUser.first_name || currentUser.last_name || currentUser.username}! Davomli bo'ling! Davomiylik muvaffaqqiyat kaliti!`,
          { reply_parameters: { message_id: messageId } },
        );
      }

      // Agar xabar noto‘g‘ri vaqtda jo‘natilgan bo‘lsa
      await ctx.reply(
        'Sizning xabaringiz qabul qilinmadi, chunki aytilgan vaqtdan kechiktingiz!',
        { reply_parameters: { message_id: messageId } },
      );
    }
  }

  @Cron('0 2 * * *')
  async checkInactiveUsers() {
    const now = Date.now();
    const users = await this.userModel.find({ chat_id: this.groupId });

    for (const user of users) {
      if (
        now - user.last_active.getTime() > 48 * 60 * 60 * 1000 &&
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

  private async kickUser(userId: number) {
    try {
      await this.bot.telegram.kickChatMember(this.groupId, userId);
      await this.userModel.deleteOne({ telegram_id: userId });
      console.log(`Foydalanuvchi (${userId}) guruhdan chiqarildi.`);
    } catch (err) {
      console.error(`Foydalanuvchini chiqarishda xatolik: ${err}`);
    }
  }

  private sendWarning(user: any) {
    this.bot.telegram.sendMessage(
      this.groupId,
      `Hello, @${user.username}. If you don't complete the challenges ${user.limit} more times, you will be removed from the group.`,
    );
  }

  private async saveToDb(user, chatId) {
    const newUser = {
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code,
      telegram_id: user.id,
      last_active: new Date(),
      chat_id: chatId,
      limit: 2,
    };
    await this.userModel.create(newUser);
  }
}

// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Cron } from '@nestjs/schedule';
// import { Model } from 'mongoose';
// import { Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
// import { Users } from 'src/schema/users.schema';
// import { Telegraf } from 'telegraf';
// import { Context } from 'telegraf';

// @Update()
// @Injectable()
// export class BotService implements OnModuleInit {
//   private readonly groupId = '-1002415061771';
//   constructor(
//     @InjectBot() private readonly bot: Telegraf<Context>,
//     @InjectModel(Users.name) private readonly userModel: Model<Users>,
//   ) {}

//   onModuleInit() {
//     console.log('BotService moduli ishga tushdi');
//   }

//   @Start()
//   async start(@Ctx() ctx: Context) {
//     await ctx.reply('Salom! Bot ishga tushdi.');
//   }

//   @On('message')
//   async onMessage(@Ctx() ctx: Context): Promise<any> {
//     const userId = ctx.message?.from?.id;
//     const chatId = ctx.message?.chat?.id;
//     const messageId = ctx.message?.message_id;
//     const now = new Date();
//     const currentHour = now.getHours();
//     const currentMinute = now.getMinutes();

//     console.log(chatId);
//     // console.log(ctx);

//     let currentUser = await this.userModel.findOne({ telegram_id: userId });
//     console.log(currentUser);

//     if (!currentUser) {
//       await this.saveToDb(ctx.from, chatId);
//       currentUser = await this.userModel.findOne({ telegram_id: userId });
//     }

//     // 1 daqiqa davomida yozmagan foydalanuvchilar
//     if (now.getTime() - currentUser.last_active.getTime() < 60 * 1000) {
//       return await ctx.reply(
//         'Siz challengedan chiqib ketgansiz, chunki 1 daqiqa ichida shartni bajarmadingiz!',
//       );
//     }

//     // 11:00 - 12:00 oralig'ida xabarlarni qabul qilish
//     if (currentHour === 11 || (currentHour === 12 && currentMinute === 0)) {
//       await this.userModel.updateOne(
//         { telegram_id: userId },
//         { last_active: now },
//       );
//       return await ctx.reply(
//         `Juda yaxshi! ${currentUser.first_name || currentUser.last_name || currentUser.username}! Davomli bo'ling! Davomiylik muvaffaqqiyat kaliti!`,
//         { reply_parameters: { message_id: messageId } },
//       );
//     }

//     // Agar xabar noto‘g‘ri vaqtda jo‘natilgan bo‘lsa
//     return await ctx.reply(
//       'Sizning xabaringiz qabul qilinmadi, chunki aytilgan vaqtdan kechiktingiz!',
//       { reply_parameters: { message_id: messageId } },
//     );
//   }

//   @Cron('*/1 * * * *')
//   async checkInactiveUsers() {
//     const now = Date.now();
//     const users = await this.userModel.find({ chat_id: this.groupId });

//     for (const user of users) {
//       if (
//         now - user.last_active.getTime() > 60 * 1000 &&
//         user.telegram_id !== 7699328433 &&
//         user.telegram_id !== 5456276170
//       ) {
//         try {
//           if (user.limit > 0) {
//             await this.kickUser(user.telegram_id);
//           } else if (user.limit < 0) {
//             this.sendWarning(user);
//           }
//         } catch (err) {
//           console.error(`Foydalanuvchini chiqarishda xatolik: ${err}`);
//         }
//       }
//     }
//   }

//   private async kickUser(userId: number) {
//     try {
//       await this.bot.telegram.kickChatMember(this.groupId, userId);
//       await this.userModel.deleteOne({ telegram_id: userId });
//       console.log(`Foydalanuvchi (${userId}) guruhdan chiqarildi.`);
//     } catch (err) {
//       console.error(`Foydalanuvchini chiqarishda xatolik: ${err}`);
//     }
//   }

//   private sendWarning(user: any) {
//     this.bot.telegram.sendMessage(
//       this.groupId,
//       `Hello, @${user.username}. If you don't complete the challenges ${user.limit} more times, you will be removed from the group.`,
//     );
//   }

//   private async saveToDb(user, chatId) {
//     const newUser = {
//       first_name: user.first_name,
//       last_name: user.last_name,
//       username: user.username,
//       language_code: user.language_code,
//       telegram_id: user.id,
//       last_active: new Date(),
//       chat_id: chatId,
//       limit: 2,
//     };
//     await this.userModel.create(newUser);
//   }
// }
