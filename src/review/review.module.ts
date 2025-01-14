import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';

import { Group } from '../groups/group.entity';
import { CacheModule } from '../utils/cache.module';

import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review } from './review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Group]), RedisModule, CacheModule], 
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
