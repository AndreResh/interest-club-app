import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MemberManagementService } from './member-management.service';
import { MemberManagementController } from './member-management.controller';
import { Membership } from './membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Membership])],
  providers: [MemberManagementService],
  controllers: [MemberManagementController],
  exports: [MemberManagementService],
})
export class MemberManagementModule {}
