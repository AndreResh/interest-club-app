// // socket.gateway.ts
// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   MessageBody,
//   ConnectedSocket,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { NotificationService } from './notification.service';
//
// @WebSocketGateway({
//   cors: {
//     origin: '*',
//   },
// })
// export class SocketGateway {
//   @WebSocketServer() server: Server;
//
//   constructor(private readonly notificationService: NotificationService) {}
//
//   // Подключение пользователя к WebSocket
//   @SubscribeMessage('join')
//   handleJoin(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
//     client.join(userId.toString());
//     console.log(`User ${userId} joined WebSocket`);
//   }
//
//   // Отправка уведомления через WebSocket
//   @SubscribeMessage('sendNotification')
//   async sendNotification(
//     @MessageBody()
//     {
//       userId,
//       content,
//       type,
//     }: { userId: number; content: string; type: string },
//     @ConnectedSocket() client: Socket,
//   ) {
//     const notification = await this.notificationService.createNotification(
//       userId,
//       content,
//       type,
//     );
//     if (notification) {
//       this.server.to(userId.toString()).emit('newNotification', notification);
//     }
//   }
// }
