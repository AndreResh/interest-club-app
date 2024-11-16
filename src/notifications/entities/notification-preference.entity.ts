// import {
//   Entity,
//   Column,
//   PrimaryGeneratedColumn,
//   OneToOne,
//   JoinColumn,
// } from 'typeorm';
// import { User } from '../../users/user.entity';
//
// @Entity()
// export class NotificationPreference {
//   @PrimaryGeneratedColumn()
//   id: number;
//
//   @OneToOne(() => User, (user) => user.notificationPreference, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn()
//   user: User;
//
//   @Column({ default: true })
//   messageNotifications: boolean;
//
//   @Column({ default: true })
//   groupUpdateNotifications: boolean;
//
//   @Column({ default: true })
//   eventReminderNotifications: boolean;
// }
