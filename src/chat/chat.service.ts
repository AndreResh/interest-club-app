import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { MessageReadStatus } from './entities/message-read-status';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    @InjectRepository(MessageReadStatus)
    private readStatusRepository: Repository<MessageReadStatus>,
  ) {}

  async sendMessage(
    chatId: number,
    senderId: number,
    content: string,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      chat: { id: chatId },
      sender: { id: senderId },
      content,
    });
    const savedMessage = await this.messageRepository.save(message);

    // Уведомляем всех участников о новом сообщении

    return savedMessage;
  }

  async markMessageAsRead(userId: number, messageId: number): Promise<void> {
    const status = await this.readStatusRepository.findOne({
      where: { user: { id: userId }, message: { id: messageId } },
    });

    if (!status) {
      const newStatus = this.readStatusRepository.create({
        user: { id: userId },
        message: { id: messageId },
        readAt: new Date(),
      });
      await this.readStatusRepository.save(newStatus);
    } else {
      status.readAt = new Date();
      await this.readStatusRepository.save(status);
    }
  }

  async getChatHistory(
    chatId: number,
    page = 1,
    limit = 20,
  ): Promise<Message[]> {
    const skip = (page - 1) * limit;
    return this.messageRepository.find({
      where: { chat: { id: chatId } },
      order: { sentAt: 'ASC' },
      skip: skip,
      take: limit,
    });
  }
}
