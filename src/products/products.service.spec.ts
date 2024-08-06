import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { WmsService } from 'wms/wms.service';
import { SuppliersService } from 'suppliers/suppliers.service';
import { JwtService } from '@nestjs/jwt';
import { Inventory } from 'inventory/inventory.entity';
import { InventoryService } from 'inventory/inventory.service';
import { PS_Product } from 'presta_entities/presta-product.ps-entity';
import { PS_Stock_Available } from 'presta_entities/presta-stock-available.ps-entity';
import { PS_Product_Attribute } from 'presta_entities/presta_product-attribute.ps-entity';
import { PurchaseOrderLineItem } from 'purchase-order-line-items/purchase-ordier-line-items.entity';
import { PurchaseOrder } from 'purchase-orders/purchase-orders.entity';
import { Supplier } from 'suppliers/suppliers.entity';
import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { ProductOrderCountService } from 'product-order-count/product-order-count.service';
import { ProductOrderCount } from 'product-order-count/product-order-count.entity';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const mockEntityManager = {
      upsert: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
