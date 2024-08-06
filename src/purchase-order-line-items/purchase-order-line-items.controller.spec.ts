import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrderLineItemsController } from './purchase-order-line-items.controller';
import { PurchaseOrderLineItemsService } from './purchase-order-line-items.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from 'inventory/inventory.entity';
import { PS_Product } from 'presta_entities/presta-product.ps-entity';
import { PS_Stock_Available } from 'presta_entities/presta-stock-available.ps-entity';
import { PS_Product_Attribute } from 'presta_entities/presta_product-attribute.ps-entity';
import { Product } from 'products/products.entity';
import { PurchaseOrder } from 'purchase-orders/purchase-orders.entity';
import { Supplier } from 'suppliers/suppliers.entity';
import { PurchaseOrderLineItem } from './purchase-ordier-line-items.entity';
import { WmsService } from 'wms/wms.service';

describe('PurchaseOrderLineItemsController', () => {
  let controller: PurchaseOrderLineItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrderLineItemsController],
      providers: [
        PurchaseOrderLineItemsService,
        WmsService,
        { provide: getRepositoryToken(Product), useClass: Repository },
        { provide: getRepositoryToken(Inventory), useClass: Repository },
        { provide: getRepositoryToken(Supplier), useClass: Repository },
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

    controller = module.get<PurchaseOrderLineItemsController>(
      PurchaseOrderLineItemsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
