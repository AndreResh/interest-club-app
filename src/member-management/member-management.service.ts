import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Membership, MembershipStatus } from './membership.entity';

@Injectable()
export class MemberManagementService {
  constructor(
    @InjectRepository(Membership)
    private membershipRepository: Repository<Membership>,
  ) {}

  // Получение всех участников для кружка
  async getMembersForGroup(groupId: number): Promise<Membership[]> {
    return this.membershipRepository.find({
      where: { group: { id: groupId }, status: MembershipStatus.ACTIVE },
    });
  }

  async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    return this.membershipRepository.exists({
      where: {
        user: { id: userId },
        group: { id: groupId },
        status: MembershipStatus.ACTIVE,
      },
    });
  }
}
