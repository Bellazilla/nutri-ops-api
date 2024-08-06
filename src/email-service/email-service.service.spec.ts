import { Test, TestingModule } from '@nestjs/testing';
import { EmailServiceService } from './email-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Email } from './email-service.entity';
import { Repository } from 'typeorm';

describe('EmailServiceService', () => {
  let service: EmailServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailServiceService,
        { provide: getRepositoryToken(Email), useClass: Repository },
      ],
    }).compile();

    service = module.get<EmailServiceService>(EmailServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
