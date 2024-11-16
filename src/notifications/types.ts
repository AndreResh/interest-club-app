// // update-notification-preference.dto.ts
// import { IsBoolean, IsOptional } from 'class-validator';
//
// export class UpdateNotificationPreferenceDto {
//   @IsOptional()
//   @IsBoolean()
//   messageNotifications: boolean;
//
//   @IsOptional()
//   @IsBoolean()
//   groupUpdateNotifications: boolean;
//
//   @IsOptional()
//   @IsBoolean()
//   eventReminderNotifications: boolean;
// }
//
// interface NotificationJobData {
//   userId: number;
//   message: string;
//   type: 'push' | 'email' | 'web';
//   targetDevice: 'mobile' | 'web'; // указывает, какое устройство будет получать уведомление
//   notificationData?: any; // любые дополнительные данные для уведомления
// }
