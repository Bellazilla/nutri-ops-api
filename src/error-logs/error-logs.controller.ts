import { Controller, Get, Post, Body } from '@nestjs/common';
import { ErrorLogsService } from './error-logs.service';
import { CreateErrorLogDto } from './dto/create-error-log.dto';

@Controller('error-logs')
export class ErrorLogsController {
  constructor(private readonly errorLogsService: ErrorLogsService) {}

  @Post()
  create(@Body() createErrorLogDto: CreateErrorLogDto) {
    return this.errorLogsService.create(createErrorLogDto);
  }

  @Get()
  findAll() {
    return this.errorLogsService.findAll();
  }
}
