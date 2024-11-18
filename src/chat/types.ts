import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string; // Содержимое сообщения

  @IsInt()
  chatId: number; // Идентификатор чата

  @IsInt()
  senderId: number; // Идентификатор отправителя (пользователя)

  @IsOptional()
  mediaFile?: MediaFile;
}

export type MediaFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}