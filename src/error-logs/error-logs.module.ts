import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorLog } from './error-logs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorLog])],
  exports: [TypeOrmModule],
})
export class ErrorLogsModule {}
