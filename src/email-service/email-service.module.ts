import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Email } from './email-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Email])],
  exports: [TypeOrmModule],
})
export class EmailServiceModule {}
