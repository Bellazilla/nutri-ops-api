import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  getStatistics() {
    return this.statisticsService.getStatistics();
  }

  @Get('top-selling-products')
  getTopSellingProducts() {
    return this.statisticsService.getTopSellingProducts();
  }
}
