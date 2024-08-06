import { ErrorLogType } from 'error-logs/error-logs.entity';

export class CreateErrorLogDto {
  description: string;
  type: ErrorLogType;
}
