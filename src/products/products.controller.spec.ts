import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './products.entity';
import { Repository } from 'typeorm';
import { Inventory } from 'inventory/inventory.entity';
import { WmsService } from 'wms/wms.service';
import { SuppliersService } from 'suppliers/suppliers.service';
import { InventoryService } from 'inventory/inventory.service';
import { Supplier } from 'suppliers/suppliers.entity';
import { PS_Stock_Available } from 'presta_entities/presta-stock-available.ps-entity';
import { PS_Product_Attribute } from 'presta_entities/presta_product-attribute.ps-entity';
import { PS_Product } from 'presta_entities/presta-product.ps-entity';
import { PurchaseOrder } from 'purchase-orders/purchase-orders.entity';
import { PurchaseOrderLineItem } from 'purchase-order-line-items/purchase-ordier-line-items.entity';
import { JwtService } from '@nestjs/jwt';
import { ProductOrderCountService } from 'product-order-count/product-order-count.service';
import { ProductOrderCount } from 'product-order-count/product-order-count.entity';

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const mockEntityManager = {
      upsert: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        WmsService,
        SuppliersService,
        InventoryService,
        ProductOrderCountService,
        JwtService,
        { provide: getRepositoryToken(Product), useClass: Repository },
        { provide: getRepositoryToken(Inventory), useClass: Repository },
        { provide: getRepositoryToken(Supplier), useClass: Repository },
        { provide: getRepositoryToken(Product), useClass: Repository },
        {
          provide: getRepositoryToken(ProductOrderCount),
          useClass: Repository,
        },
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
        { provide: getEntityManagerToken(), useValue: mockEntityManager },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
