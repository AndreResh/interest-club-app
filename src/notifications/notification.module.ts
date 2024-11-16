// import { Module } from '@nestjs/common';
// import { NotificationService } from './notification.service';
// import { NotificationController } from './notification.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Notification } from './entities/notification.entity';
// import { NotificationPreference } from './entities/notification-preference.entity';
// import { BullModule } from '@nestjs/bull';
//
// @Module({
//   imports: [
//     BullModule.registerQueue({
//       name: 'notificationQueue', // Имя очереди
//       redis: {
//         host: 'localhost', // Настройки подключения к Redis
//         port: 6379,
//       },
//     }),
//     TypeOrmModule.forFeature([Notification, NotificationPreference]),
//   ],
//   controllers: [NotificationController],
//   providers: [NotificationService],
// })
// export class NotificationModule {}
