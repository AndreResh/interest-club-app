import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { Message } from './entity/message.entity';
import { MessageReadStatus } from './entity/message-read-status';
import { MediaFile } from './types';
import { MinioService } from './minio.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
    @InjectRepository(MessageReadStatus)
    private readStatusRepository: Repository<MessageReadStatus>,
    private readonly minioService: MinioService,
  ) {}

  async sendMessage(
    chatId: number,
    senderId: number,
    content: string,
    mediaFile?: MediaFile,
  ): Promise<Message> {
    let mediaUrl: string | undefined;

    if (mediaFile) {
      mediaUrl = await this.minioService.uploadFile(
        mediaFile.buffer,
        mediaFile.originalname,
        mediaFile.mimetype,
      );
    }

    const message = this.messageRepository.create({
      chat: { id: chatId },
      sender: { id: senderId },
      content,
      mediaUrl,
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
    const messages = await this.messageRepository.find({
      where: { chat: { id: chatId } },
      order: { sentAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return Promise.all(
      messages.map(async (message) => {
        if (message.mediaUrl) {
          message.mediaUrl = await this.minioService.getFileUrl(message.mediaUrl.split('/').pop()!);
        }
        return message;
      }),
    );
  }

  async getMediaFileUrl(fileKey: string): Promise<string> {
    return this.minioService.getFileUrl(fileKey);
  }
}
