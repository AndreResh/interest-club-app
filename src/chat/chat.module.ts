import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatService } from './chat.service';
import { Message } from './entities/message.entity';
import { MessageReadStatus } from './entities/message-read-status';
import { Chat } from './entities/chat.entity';
import { ChatGateway } from './chat-gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, Message, MessageReadStatus]),
  ],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
