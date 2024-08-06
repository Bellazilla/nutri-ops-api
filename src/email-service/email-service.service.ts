import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Email } from './email-service.entity';
import { Repository } from 'typeorm';
import * as sgMail from '@sendgrid/mail';
import { CreateEmailDto } from './dto/create-email.dto';

@Injectable()
export class EmailServiceService {
  constructor(
    @InjectRepository(Email)
    private readonly emailServiceRepository: Repository<Email>,
  ) {}

  async send(email: CreateEmailDto) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');
    const msg: sgMail.MailDataRequired = {
      to: email.recipient,
      cc: process.env.SUPPORT_EMAIL_ADDRESS,
      from: 'info@incci.com',
      subject: email.subject,
      text: email.body,
    };
    sgMail
      .send(msg)
      .then(async () => {
        await this.emailServiceRepository.save(email);
        return {
          statu: 200,
          message: 'Email was sent',
        };
      })
      .catch((error: any) => {
        console.error(error);
        return {
          status: 400,
          error,
        };
      });
  }
}
