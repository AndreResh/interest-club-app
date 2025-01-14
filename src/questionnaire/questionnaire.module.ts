import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Group } from '../groups/group.entity';
import { CacheModule } from '../utils/cache.module';

import { Questionnaire } from './entity/questionnaire.entity';
import { Question } from './entity/question.entity';
import { Answer } from './entity/answer.entity';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireController } from './questionnaire.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Questionnaire, Question, Answer, Group]), CacheModule],
  providers: [QuestionnaireService],
  controllers: [QuestionnaireController],
})
export class QuestionnaireModule {}
