import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Group } from '../groups/group.entity';
import { User } from '../users/user.entity';

import { Complaint } from './complaint.entity';
import { ComplaintsService } from './complaint.service';
import { ComplaintsController } from './complaint.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Complaint, Group, User])],
  providers: [ComplaintsService],
  controllers: [ComplaintsController],
})
export class ComplaintModule {}
