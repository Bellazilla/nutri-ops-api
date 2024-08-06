import { Body, Controller, Post } from '@nestjs/common';
import { EmailServiceService } from './email-service.service';
import { CreateEmailDto } from './dto/create-email.dto';

@Controller('email-service')
export class EmailServiceController {
  constructor(private readonly emailServiceService: EmailServiceService) {}

  @Post('send')
  send(@Body() email: CreateEmailDto) {
    return this.emailServiceService.send(email);
  }
}
