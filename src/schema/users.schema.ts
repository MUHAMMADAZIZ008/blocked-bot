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
  last_active: number;

  @Prop()
  chat_id: string;
}

export const UserSchema = SchemaFactory.createForClass(Users);
