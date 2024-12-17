import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

import { Group } from '../groups/group.entity';

import { Review } from './review.entity';
import { CreateReviewDto, UpdateReviewDto } from './types';

@Injectable()
export class ReviewService {
  private readonly cacheTtl: number;

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.cacheTtl = parseInt(
      this.configService.get<string>('CACHE_TTL_REVIEWS', '300'),
      10,
    );
  }

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

    const savedReview = await this.reviewRepository.save(review);

    // 1. Получаем актуальные данные
    const reviews = await this.reviewRepository.find({
      where: { group: { id: groupId } },
    });

    await this.setCache(`reviews:group:${groupId}`, reviews);

    return savedReview;
  }

  async findAll(groupId: number): Promise<Review[]> {
    // Пробуем получить данные из кэша
    const cachedReviews = await this.redis.get(`reviews:group:${groupId}`);
    if (cachedReviews) {
      return JSON.parse(cachedReviews); // Возвращаем кэшированные данные
    }

    // Если кэш не найден, загружаем из базы данных
    const reviews = await this.reviewRepository.find({
      where: { group: { id: groupId } },
    });

    await this.setCache(`reviews:group:${groupId}`, reviews);

    return reviews;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['group'], // Загружаем группу, чтобы знать, какой кэш удалить
    });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    const groupId = review.group.id;

    Object.assign(review, updateReviewDto);
    const updatedReview = await this.reviewRepository.save(review);

    const reviews = await this.reviewRepository.find({
      where: { group: { id: groupId } },
    });

    await this.setCache(`reviews:group:${groupId}`, reviews);

    return updatedReview;
  }

  async remove(id: number): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['group'], // Загружаем группу, чтобы знать, какой кэш удалить
    });
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    const groupId = review.group.id;

    await this.reviewRepository.remove(review);

    const reviews = await this.reviewRepository.find({
      where: { group: { id: groupId } },
    });

    await this.setCache(`reviews:group:${groupId}`, reviews);
  }

  private async setCache(key: string, value: unknown): Promise<void> {
    try {
      await this.redis.set(
        key,
        JSON.stringify(value),
        'EX',
        this.cacheTtl,
      );
    } catch (error) {
      const err = error as Error;
      console.error(`Error setting cache: ${err.message}`);
    }
  }
}
