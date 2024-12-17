import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisModule } from '@nestjs-modules/ioredis';

import { GroupsModule } from './groups/groups.module';
import { ChatModule } from './chat/chat.module';
import { MemberManagementModule } from './member-management/member-management.module';
import { RequestManagementModule } from './request-management/request-management.module';
import { UsersModule } from './users/users.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Делаем ConfigModule глобальным
      envFilePath: ['.env'], // Считываем переменные из файла .env
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    RedisModule.forRoot({
      type: 'single',  // Тип подключения - одиночный Redis сервер
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,  // Строка подключения
      options: {
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB, 10),
      }
    }),
    GroupsModule,
    ChatModule,
    MemberManagementModule,
    RequestManagementModule,
    UsersModule,
    QuestionnaireModule,
    ReviewModule,
  ],
})
export class AppModule {}
