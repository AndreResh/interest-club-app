// // notification.processor.ts
// import { Injectable } from '@nestjs/common';
// import { InjectQueue } from '@nestjs/bull';
// import { Queue } from 'bull';
// import { Job } from 'bull';
// import { NotificationService } from './notification.service';
// import { Processor, Process } from '@nestjs/bull';
//
// @Injectable()
// export class NotificationProcessor {
//   constructor(
//     private readonly notificationService: NotificationService,
//     @InjectQueue('notificationQueue') private notificationQueue: Queue,
//   ) {}
//
//   @Process('sendNotification')
//   async handleNotificationJob(job: Job<NotificationJobData>) {
//     const { userId, message, type, targetDevice, notificationData } = job.data;
//
//     // В зависимости от типа уведомления выбираем соответствующий метод отправки
//     if (type === 'push') {
//       if (targetDevice === 'mobile') {
//         // Отправка push-уведомления на мобильное устройство
//         await this.notificationService.sendPushNotification(userId, message);
//       } else if (targetDevice === 'web') {
//         // Отправка Web Push уведомления
//         await this.notificationService.sendWebPushNotification(userId, message);
//       }
//     } else if (type === 'email') {
//       // Отправка email-уведомления
//       await this.notificationService.sendEmailNotification(userId, message);
//     } else if (type === 'web') {
//       // Отправка веб-уведомлений
//       await this.notificationService.sendWebNotification(userId, message);
//     }
//   }
//
//   // Метод для добавления задачи в очередь
//   async addNotificationToQueue(userId: number, message: string, type: string) {
//     await this.notificationQueue.add(
//       {
//         userId,
//         message,
//         type,
//       },
//       {
//         attempts: 5, // Количество попыток отправки уведомления
//         backoff: 1000, // Задержка перед повторной попыткой
//       },
//     );
//   }
// }
