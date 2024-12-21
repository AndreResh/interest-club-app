import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  // Получение значения из кэша
  async get<T>(key: string): Promise<T | null> {
    const cachedData = await this.redis.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  // Установка значения в кэш
  async set(key: string, value: unknown, ttl: number): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      const err = error as Error;
      console.error(`Error setting cache: ${err.message}`);
    }
  }

  // Удаление значения из кэша
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      const err = error as Error;
      console.error(`Error deleting cache: ${err.message}`);
    }
  }
}
