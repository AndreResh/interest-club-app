import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';
import { CreateMessageDto } from './types';

@WebSocketGateway(3001, {
  cors: {
    origin: '*', // Разрешить любые источники
    methods: ['GET', 'POST'], // Допустимые HTTP-методы
  },
})
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  // Подключение пользователя к чату
  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(chatId.toString()); // Добавляем пользователя в комнату чата
    console.log(`User ${client.id} joined chat ${chatId}`);
  }

  @SubscribeMessage('getChatHistory')
  async handleGetChatHistory(
    @MessageBody()
    { chatId, page, limit }: { chatId: number; page: number; limit: number },
    @ConnectedSocket() client: Socket,
  ) {
    const chatHistory = await this.chatService.getChatHistory(
      chatId,
      page,
      limit,
    );
    this.server.to(client.id).emit('chatHistory', chatHistory);
  }

  // Отправка сообщения
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, senderId, content, mediaFile } = createMessageDto;

    const message = await this.chatService.sendMessage(
      chatId,
      senderId,
      content,
      mediaFile,
    );

    // Отправляем сообщение всем подключённым пользователям в этот чат
    this.server.to(chatId.toString()).emit('message', message);
  }

  // Отметить сообщение как прочитанное
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() { userId, messageId }: { userId: number; messageId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const readStatus = await this.chatService.markMessageAsRead(
      userId,
      messageId,
    );

    // Отправляем уведомление всем пользователям чата
    this.server.to(client.id).emit('messageReadStatus', readStatus);
  }

  // Отключение пользователя от чата
  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(chatId.toString()); // Убираем пользователя из комнаты чата
    console.log(`User ${client.id} left chat ${chatId}`);
  }
}
