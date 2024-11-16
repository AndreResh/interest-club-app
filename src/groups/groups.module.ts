import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/user.entity';
import { Chat } from '../chat/entities/chat.entity';
import { Membership } from '../member-management/membership.entity';
import { UserChat } from '../chat/entities/user-chat.entity';

import { Group } from './group.entity';
import { GroupController } from './groups.controller';
import { GroupService } from './groups.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, User, Chat, Membership, UserChat]),
  ],
  providers: [GroupService],
  controllers: [GroupController],
})
export class GroupsModule {}
