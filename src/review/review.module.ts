import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';

import { Group } from '../groups/group.entity';
import { CacheService } from '../utils/cache.service';

import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review } from './review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Group]), RedisModule],
  controllers: [ReviewController],
  providers: [ReviewService, CacheService],
})
export class ReviewModule {}
