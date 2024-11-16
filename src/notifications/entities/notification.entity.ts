// import {
//   Entity,
//   Column,
//   PrimaryGeneratedColumn,
//   ManyToOne,
//   CreateDateColumn,
// } from 'typeorm';
// import { User } from '../../users/user.entity';
//
// @Entity()
// export class Notification {
//   @PrimaryGeneratedColumn()
//   id: number;
//
//   @Column({ type: 'text' })
//   content: string;
//
//   @Column({
//     type: 'enum',
//     enum: ['message', 'groupUpdate', 'eventReminder', 'general'],
//     default: 'general',
//   })
//   type: string;
//
//   @Column({ default: false })
//   isRead: boolean;
//
//   @CreateDateColumn()
//   createdAt: Date;
//
//   @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
//   recipient: User;
// }
