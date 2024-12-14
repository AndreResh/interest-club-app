import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Group } from '../groups/group.entity';

import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review } from './review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Group])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
