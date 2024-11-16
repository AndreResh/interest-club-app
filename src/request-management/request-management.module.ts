import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/user.entity';
import { Membership } from '../member-management/membership.entity';
import { UserChat } from '../chat/entities/user-chat.entity';
import { Group } from '../groups/group.entity';
import { MemberManagementModule } from '../member-management/member-management.module';

import { Request } from './request.entity';
import { RequestController } from './request-management.controller';
import { RequestService } from './request-management.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, Group, User, Membership, UserChat]),
    MemberManagementModule,
  ],
  providers: [RequestService],
  controllers: [RequestController],
})
export class RequestManagementModule {}
