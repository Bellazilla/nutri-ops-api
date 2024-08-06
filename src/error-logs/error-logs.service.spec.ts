import { Test, TestingModule } from '@nestjs/testing';
import { ErrorLogsService } from './error-logs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ErrorLog, ErrorLogType } from './error-logs.entity';
import { Repository } from 'typeorm';
import { CreateErrorLogDto } from './dto/create-error-log.dto';

describe('ErrorLogsService', () => {
  let errorLogsService: ErrorLogsService;
  let errorLogRepository: Repository<ErrorLog>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorLogsService,
        { provide: getRepositoryToken(ErrorLog), useClass: Repository },
      ],
    }).compile();

    errorLogsService = module.get<ErrorLogsService>(ErrorLogsService);
    errorLogRepository = module.get<Repository<ErrorLog>>(
      getRepositoryToken(ErrorLog),
    );
  });

  it('should be defined', () => {
    expect(errorLogsService).toBeDefined();
  });

  it('should create an error log', async () => {
    const createErrorLogDto: CreateErrorLogDto = {
      // Provide necessary data for testing DTO
      description: 'test error description',
      type: ErrorLogType.ProductSync,
    };

    const mockErrorLog = new ErrorLog();
    jest
      .spyOn(errorLogRepository, 'save')
      .mockImplementation(async () => mockErrorLog);

    const result = await errorLogsService.create(createErrorLogDto);

    expect(result).toBe(mockErrorLog);
  });

  it('should find all error logs', async () => {
    const mockErrorLogs: ErrorLog[] = [
      // Create mock error logs for testing
      {
        description: 'test error 1',
        type: ErrorLogType.FileDownload,
      } as ErrorLog,
      {
        description: 'test error 2',
        type: ErrorLogType.ProductSync,
      } as ErrorLog,
    ];

    jest
      .spyOn(errorLogRepository, 'find')
      .mockImplementation(async () => mockErrorLogs);

    const result = await errorLogsService.findAll();

    expect(result.data).toEqual(mockErrorLogs);
  });

  it("should find today's errors", async () => {
    const mockTodaysErrors: ErrorLog[] = [
      // Create mock error logs for testing
      {
        description: 'test error 1',
        type: ErrorLogType.FileDownload,
      } as ErrorLog,
      {
        description: 'test error 2',
        type: ErrorLogType.ProductSync,
      } as ErrorLog,
    ];

    jest
      .spyOn(errorLogRepository, 'find')
      .mockImplementation(async () => mockTodaysErrors);

    const result = await errorLogsService.getTodaysErrors();

    expect(result).toEqual(mockTodaysErrors);
  });
});
