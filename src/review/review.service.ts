import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Group } from '../groups/group.entity';
import { CacheService } from '../utils/cache.service';
import { mapToUpdate } from '../utils/common';

import { Review } from './review.entity';
import { CreateReviewDto, UpdateReviewDto } from './types';

@Injectable()
export class ReviewService {
  private readonly cacheTtl: number;

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    this.cacheTtl = parseInt(
      this.configService.get<string>('CACHE_TTL_REVIEWS', '300'),
      10,
    );
  }

  async create(
    userId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const { groupId, ...reviewData } = createReviewDto;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const group = await queryRunner.manager.findOne(Group, {
        where: { id: groupId },
      });

      if (!group) {
        throw new NotFoundException(`Group with id ${groupId} not found`);
      }

      const review = queryRunner.manager.create(Review, {
        ...reviewData,
        user: { id: userId },
        group,
      });
      const savedReview = await queryRunner.manager.save(Review, review);

      const reviews = await queryRunner.manager.find(Review, {
        where: { group: { id: groupId } },
      });

      await this.cacheService.set(
        `reviews:group:${groupId}`,
        reviews,
        this.cacheTtl,
      );

      await queryRunner.commitTransaction();
      return savedReview;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  async findAll(groupId: number): Promise<Review[]> {
    const cacheKey = `reviews:group:${groupId}`;
    // Пробуем получить данные из кэша
    const cachedReviews = await this.cacheService.get<Review[]>(cacheKey);
    if (cachedReviews) {
      return cachedReviews;
    }

    // Если кэш не найден, загружаем из базы данных
    const reviews = await this.reviewRepository.find({
      where: { group: { id: groupId } },
    });

    await this.cacheService.set(cacheKey, reviews, this.cacheTtl);

    return reviews;
  }
  
  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const review = await queryRunner.manager.findOne(Review, {
        where: { id },
        relations: ['group'],
      });

      if (!review) {
        throw new NotFoundException(`Review with id ${id} not found`);
      }

      mapToUpdate(review, updateReviewDto);
      const updatedReview = await queryRunner.manager.save(Review, review);

      const groupId = review.group.id;
      const reviews = await queryRunner.manager.find(Review, {
        where: { group: { id: groupId } },
      });

      await this.cacheService.set(
        `reviews:group:${groupId}`,
        reviews,
        this.cacheTtl,
      );

      await queryRunner.commitTransaction();
      return updatedReview;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const review = await queryRunner.manager.findOne(Review, {
        where: { id },
        relations: ['group'],
      });

      if (!review) {
        throw new NotFoundException(`Review with id ${id} not found`);
      }

      const groupId = review.group.id;
      await queryRunner.manager.remove(Review, review);

      const reviews = await queryRunner.manager.find(Review, {
        where: { group: { id: groupId } },
      });

      await this.cacheService.set(
        `reviews:group:${groupId}`,
        reviews,
        this.cacheTtl,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
