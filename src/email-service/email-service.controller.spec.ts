import { Test, TestingModule } from '@nestjs/testing';
import { EmailServiceController } from './email-service.controller';
import { EmailServiceService } from './email-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Email } from './email-service.entity';
import { Repository } from 'typeorm';

describe('EmailServiceController', () => {
  let controller: EmailServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailServiceController],
      providers: [
        EmailServiceService,
        { provide: getRepositoryToken(Email), useClass: Repository },
      ],
    }).compile();

    controller = module.get<EmailServiceController>(EmailServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
