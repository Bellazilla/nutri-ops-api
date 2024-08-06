import { Test, TestingModule } from '@nestjs/testing';
import { PrestaOrdersController } from './presta_orders.controller';
import { PrestaOrdersService } from './presta_orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PS_Orders } from 'presta_entities/presta_order.ps-entity';

describe('PrestaOrdersController', () => {
  let controller: PrestaOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrestaOrdersController],
      providers: [
        PrestaOrdersService,
        {
          provide: getRepositoryToken(PS_Orders, 'presta'),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<PrestaOrdersController>(PrestaOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
