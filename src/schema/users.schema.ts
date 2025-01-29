import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Users {
  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop({ unique: true })
  username: string;

  @Prop()
  language_code: string;

  @Prop({ unique: true })
  telegram_id: number;

  @Prop()
  last_active: Date;

  @Prop()
  chat_id: string;

  @Prop({ default: 3 })
  limit: number;
}

export const UserSchema = SchemaFactory.createForClass(Users);
