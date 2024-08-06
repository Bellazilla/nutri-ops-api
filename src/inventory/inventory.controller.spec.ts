import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from 'products/products.entity';
import { Repository } from 'typeorm';
import { PS_Stock_Available } from 'presta_entities/presta-stock-available.ps-entity';
import { PS_Product_Attribute } from 'presta_entities/presta_product-attribute.ps-entity';
import { WmsService } from 'wms/wms.service';
import { Inventory } from './inventory.entity';
import { PS_Product } from 'presta_entities/presta-product.ps-entity';
import { PurchaseOrder } from 'purchase-orders/purchase-orders.entity';
import { PurchaseOrderLineItem } from 'purchase-order-line-items/purchase-ordier-line-items.entity';

describe('InventoryController', () => {
  let controller: InventoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        InventoryService,
        WmsService,
        { provide: getRepositoryToken(Product), useClass: Repository },
        {
          provide: getRepositoryToken(PS_Stock_Available, 'presta'),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PS_Product_Attribute, 'presta'),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PS_Product, 'presta'),
          useClass: Repository,
        },
        { provide: getRepositoryToken(Inventory), useClass: Repository },
        { provide: getRepositoryToken(PurchaseOrder), useClass: Repository },
        {
          provide: getRepositoryToken(PurchaseOrderLineItem),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
