import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Group } from '../groups/group.entity';

import { Review } from './review.entity';
import { CreateReviewDto, UpdateReviewDto } from './types';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(userId: number, createReviewDto: CreateReviewDto): Promise<Review> {
    const { groupId, ...reviewData } = createReviewDto;

    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException(`Group with id ${groupId} not found`);
    }

    const review = this.reviewRepository.create({
      ...reviewData,
      user: { id: userId },
      group,
    });

    return this.reviewRepository.save(review);
  }

  async findAll(groupId: number): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { group: { id: groupId } },
    });
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    Object.assign(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async remove(id: number): Promise<void> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    await this.reviewRepository.remove(review);
  }
}
