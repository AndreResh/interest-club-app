import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Group } from '../groups/group.entity';
import { User } from '../users/user.entity';

import { Complaint } from './complaint.entity';
import { CreateComplaintDto } from './types';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintRepository: Repository<Complaint>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createComplaint(
    userId: number,
    createComplaintDto: CreateComplaintDto,
  ): Promise<Complaint> {
    const { reason, groupId, reportedUserId } = createComplaintDto;

    let group: Group | null = null;
    let reportedUser: User | null = null;

    if (groupId) {
      group = await this.groupRepository.findOne({ where: { id: groupId } });
      if (!group) {
        throw new NotFoundException(`Group with ID ${groupId} not found`);
      }
    }

    if (reportedUserId) {
      reportedUser = await this.userRepository.findOne({
        where: { id: reportedUserId },
      });
      if (!reportedUser) {
        throw new NotFoundException(`User with ID ${reportedUserId} not found`);
      }
    }

    if (!group && !reportedUser) {
      throw new BadRequestException(
        'Either groupId or reportedUserId must be provided.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const complaint = this.complaintRepository.create({
      reason,
      group,
      reportedUser,
      user,
    });
    return this.complaintRepository.save(complaint);
  }

  async getAllComplaints(page: number, limit: number): Promise<Complaint[]> {
    const [complaints] = await this.complaintRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'reportedUser', 'group'],
    });
    return complaints;
  }

  async getComplaintsByGroup(groupId: number): Promise<Complaint[]> {
    return this.complaintRepository.find({
      where: { group: { id: groupId } },
      relations: ['user', 'group'],
    });
  }

  async getComplaintsByUser(userId: number): Promise<Complaint[]> {
    return this.complaintRepository.find({
      where: { reportedUser: { id: userId } },
      relations: ['user', 'reportedUser'],
    });
  }

  async deleteComplaint(id: number): Promise<void> {
    const result = await this.complaintRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }
  }
}
