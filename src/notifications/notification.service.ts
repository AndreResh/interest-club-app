// // notification.service.ts
// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Notification } from './entity/notification.entity';
// import { NotificationPreference } from './entity/notification-preference.entity';
// import { Server } from 'socket.io';
// import { Inject } from '@nestjs/common';
// import { User } from '../users/user.entity';
// import { UpdateNotificationPreferenceDto } from './types';
// import { NotificationProcessor } from './notification.processor';
//
// @Injectable()
// export class NotificationService {
//   constructor(
//     @InjectRepository(Notification)
//     private notificationRepository: Repository<Notification>,
//     @InjectRepository(NotificationPreference)
//     private preferenceRepository: Repository<NotificationPreference>,
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//     @Inject('SOCKET_SERVER') private readonly server: Server, // инжектим WebSocket сервер
//     private readonly notificationProcessor: NotificationProcessor,
//   ) {}
//
//   // Создание нового уведомления и отправка через WebSocket
//   async createNotification(
//     recipientId: number,
//     content: string,
//     type: string,
//   ): Promise<Notification | null> {
//     const user = await this.userRepository.findOne({
//       where: { id: recipientId },
//       relations: ['notificationPreference'],
//     });
//     if (!user) throw new Error('User not found');
//
//     const preference = user.notificationPreference;
//     if (!this.checkUserPreference(preference, type)) return null;
//
//     const notification = this.notificationRepository.create({
//       recipient: user,
//       content,
//       type,
//       isRead: false,
//     });
//
//     const savedNotification =
//       await this.notificationRepository.save(notification);
//
//     // Отправляем уведомление через WebSocket
//     this.server
//       .to(user.id.toString())
//       .emit('newNotification', savedNotification);
//
//     return savedNotification;
//   }
//
//   // Проверка предпочтений пользователя
//   private checkUserPreference(
//     preference: NotificationPreference,
//     type: string,
//   ): boolean {
//     switch (type) {
//       case 'message':
//         return preference.messageNotifications;
//       case 'groupUpdate':
//         return preference.groupUpdateNotifications;
//       case 'eventReminder':
//         return preference.eventReminderNotifications;
//       default:
//         return true;
//     }
//   }
//
//   // Обновление статуса уведомления как прочитанного
//   async markAsRead(
//     notificationId: number,
//     userId: number,
//   ): Promise<Notification> {
//     const notification = await this.notificationRepository.findOne({
//       where: { id: notificationId, recipient: { id: userId } },
//     });
//     if (!notification) throw new Error('Notification not found');
//
//     notification.isRead = true;
//     return await this.notificationRepository.save(notification);
//   }
//
//   // Получение всех уведомлений для пользователя
//   async getNotificationsForUser(userId: number): Promise<Notification[]> {
//     return await this.notificationRepository.find({
//       where: { recipient: { id: userId } },
//       order: { createdAt: 'DESC' },
//     });
//   }
//
//   // Обновление предпочтений пользователя
//   async updatePreferences(
//     userId: number,
//     updateDto: UpdateNotificationPreferenceDto,
//   ): Promise<NotificationPreference> {
//     const user = await this.userRepository.findOne({
//       where: { id: userId },
//       relations: ['notificationPreference'],
//     });
//     if (!user) throw new Error('User not found');
//
//     const preference =
//       user.notificationPreference || this.preferenceRepository.create();
//     preference.messageNotifications =
//       updateDto.messageNotifications ?? preference.messageNotifications;
//     preference.groupUpdateNotifications =
//       updateDto.groupUpdateNotifications ?? preference.groupUpdateNotifications;
//     preference.eventReminderNotifications =
//       updateDto.eventReminderNotifications ??
//       preference.eventReminderNotifications;
//
//     return this.preferenceRepository.save(preference);
//   }
//
//   // Получение предпочтений пользователя
//   async getPreferences(userId: number): Promise<NotificationPreference> {
//     const user = await this.userRepository.findOne({
//       where: { id: userId },
//       relations: ['notificationPreference'],
//     });
//     if (!user) throw new Error('User not found');
//     return user.notificationPreference;
//   }
//
//   async sendNotification(
//     userId: number,
//     message: string,
//     type: string,
//   ): Promise<void> {
//     // TODO
//     // Логика отправки уведомлений
//     // Можно интегрировать сервисы отправки email, SMS, push-уведомлений и т.д.
//     console.log(`Sending ${type} notification to user ${userId}: ${message}`);
//   }
//
//   // Метод для триггера уведомлений
//   async notifyUser(userId: number, message: string, type: string) {
//     await this.notificationProcessor.addNotificationToQueue(
//       userId,
//       message,
//       type,
//     );
//   }
//
//   async createNotificationJob(notificationData: NotificationJobData) {
//     // Добавляем задачу в очередь
//     await this.notificationQueue.add('sendNotification', notificationData, {
//       delay: 0, // можно установить задержку, если нужно
//     });
//   }
//
//   async sendPushNotification(userId: number, message: string): Promise<void> {
//     // Логика отправки push-уведомления через FCM
//     console.log(`Sending push notification to user ${userId}: ${message}`);
//   }
//
//   async sendWebPushNotification(
//     userId: number,
//     message: string,
//   ): Promise<void> {
//     // Логика отправки web push уведомления через Web Push API
//     console.log(`Sending Web Push notification to user ${userId}: ${message}`);
//   }
//
//   async sendEmailNotification(userId: number, message: string): Promise<void> {
//     // Логика отправки email-уведомления
//     console.log(`Sending email to user ${userId}: ${message}`);
//   }
//
//   async sendWebNotification(userId: number, message: string): Promise<void> {
//     // Логика отправки веб-уведомления
//     console.log(`Sending web notification to user ${userId}: ${message}`);
//   }
// }
