import { Test, TestingModule } from '@nestjs/testing';
import { ErrorLogsController } from './error-logs.controller';
import { ErrorLogsService } from './error-logs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ErrorLog } from './error-logs.entity';
import { Repository } from 'typeorm';

describe('ErrorLogsController', () => {
  let controller: ErrorLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ErrorLogsController],
      providers: [
        ErrorLogsService,
        { provide: getRepositoryToken(ErrorLog), useClass: Repository },
      ],
    }).compile();

    controller = module.get<ErrorLogsController>(ErrorLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
