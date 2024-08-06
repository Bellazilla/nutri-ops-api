import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebAutomationService } from './web-automation.service';
import { ErrorLogsService } from 'error-logs/error-logs.service';
import { ErrorLogsModule } from 'error-logs/error-logs.module';
import { EmailServiceModule } from 'email-service/email-service.module';
import { EmailServiceService } from 'email-service/email-service.service';

@Module({
  imports: [TypeOrmModule.forFeature(), ErrorLogsModule, EmailServiceModule],
  providers: [WebAutomationService, ErrorLogsService, EmailServiceService],
  exports: [TypeOrmModule, WebAutomationService],
})
export class WebAutomationModule {}
