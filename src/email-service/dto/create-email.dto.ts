import { EmailType } from 'email-service/email-service.entity';

export class CreateEmailDto {
  subject: string;
  body: string;
  recipient: string;
  type: EmailType;
}
