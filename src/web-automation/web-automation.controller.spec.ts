import { Test, TestingModule } from '@nestjs/testing';
import { WebAutomationController } from './web-automation.controller';

describe.skip('WebAutomationController', () => {
  let controller: WebAutomationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebAutomationController],
    }).compile();

    controller = module.get<WebAutomationController>(WebAutomationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
