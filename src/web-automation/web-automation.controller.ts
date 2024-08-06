import { Controller, Get } from '@nestjs/common';
import { WebAutomationService } from './web-automation.service';

@Controller('web-automation')
export class WebAutomationController {
  constructor(private readonly webAutomationService: WebAutomationService) {}

  @Get('get-latest-powerbody-product-file')
  getLatestPowerBodyFiles() {
    return this.webAutomationService.getLatestPowerbodyProductFile();
  }
  @Get('get-latest-prometeus-product-file')
  getLatestPrometeusFile() {
    return this.webAutomationService.getLatestPrometeusFile();
  }
}
