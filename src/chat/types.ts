import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string; // Содержимое сообщения

  @IsInt()
  chatId: number; // Идентификатор чата

  @IsInt()
  senderId: number; // Идентификатор отправителя (пользователя)
}
