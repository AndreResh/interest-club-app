import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatService } from './chat.service';
import { Message } from './entity/message.entity';
import { MessageReadStatus } from './entity/message-read-status';
import { Chat } from './entity/chat.entity';
import { ChatGateway } from './chat-gateway';
import { MinioService } from './minio.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, Message, MessageReadStatus]),
  ],
  providers: [ChatService, ChatGateway, MinioService],
})
export class ChatModule {}
