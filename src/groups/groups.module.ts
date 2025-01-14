import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/user.entity';
import { Chat } from '../chat/entity/chat.entity';
import { Membership } from '../member-management/membership.entity';
import { UserChat } from '../chat/entity/user-chat.entity';
import { CacheModule } from '../utils/cache.module';

import { Group } from './group.entity';
import { GroupController } from './groups.controller';
import { GroupService } from './groups.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, User, Chat, Membership, UserChat]), CacheModule
  ],
  providers: [GroupService],
  controllers: [GroupController],
})
export class GroupsModule {}
