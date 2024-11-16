// // notification.controller.ts
// import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
// import { NotificationService } from './notification.service';
// import { UpdateNotificationPreferenceDto } from './types';
//
// @Controller('notifications')
// export class NotificationController {
//   constructor(private readonly notificationService: NotificationService) {}
//
//   // Создание уведомления
//   @Post(':userId')
//   async createNotification(
//     @Param('userId') userId: number,
//     @Body('content') content: string,
//     @Body('type') type: string,
//   ) {
//     return this.notificationService.createNotification(userId, content, type);
//   }
//
//   // Получение уведомлений пользователя
//   @Get(':userId')
//   async getNotificationsForUser(@Param('userId') userId: number) {
//     return this.notificationService.getNotificationsForUser(userId);
//   }
//
//   // Пометить уведомление как прочитанное
//   @Put(':id/read')
//   async markAsRead(@Param('id') id: number, @Body('userId') userId: number) {
//     return this.notificationService.markAsRead(id, userId);
//   }
//
//   // Получение предпочтений пользователя
//   @Get(':userId')
//   async getPreferences(@Param('userId') userId: number) {
//     return this.notificationService.getPreferences(userId);
//   }
//
//   // Обновление предпочтений пользователя
//   @Put(':userId')
//   async updatePreferences(
//     @Param('userId') userId: number,
//     @Body() updateDto: UpdateNotificationPreferenceDto,
//   ) {
//     return this.notificationService.updatePreferences(userId, updateDto);
//   }
// }
