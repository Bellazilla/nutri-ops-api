import { Injectable } from '@nestjs/common';
import { CreateErrorLogDto } from './dto/create-error-log.dto';
import { ErrorLog } from './error-logs.entity';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ErrorLogsService {
  constructor(
    @InjectRepository(ErrorLog)
    private readonly errorLogsReporsitory: Repository<ErrorLog>,
  ) {}
  async create(createErrorLogDto: CreateErrorLogDto) {
    const newError = await this.errorLogsReporsitory.save(createErrorLogDto);
    return newError;
  }

  async findAll() {
    const data = await this.errorLogsReporsitory.find({
      order: { createdAt: 'DESC' },
    });
    return {
      data,
    };
  }

  async getTodaysErrors() {
    const yesterday = new Date();
    yesterday.setUTCHours(-1, 0, 0, 0);

    const data = await this.errorLogsReporsitory.find({
      where: {
        createdAt: MoreThanOrEqual(yesterday),
      },
    });

    return data;
  }
}
