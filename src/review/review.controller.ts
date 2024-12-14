import { Controller, Post, Body, Param, Patch, Delete, Get, Query } from '@nestjs/common';

import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './types';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  create(@Body() createReviewDto: CreateReviewDto) {
    const userId = 1; // Временно захардкожено - будет через jwt токе доставать
    return this.reviewService.create(userId, createReviewDto);
  }

  @Get('group/:groupId')
  findAll(@Param('groupId') groupId: number) {
    return this.reviewService.findAll(groupId);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.reviewService.remove(id);
  }
}
