import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from 'products/products.entity';
import { Repository } from 'typeorm';
import { Inventory, InventorySyncStatus } from './inventory.entity';
import { PS_Product } from 'presta_entities/presta-product.ps-entity';
import { PS_Stock_Available } from 'presta_entities/presta-stock-available.ps-entity';
import { PS_Product_Attribute } from 'presta_entities/presta_product-attribute.ps-entity';
import { WmsService } from 'wms/wms.service';
import { PurchaseOrder } from 'purchase-orders/purchase-orders.entity';
import { PurchaseOrderLineItem } from 'purchase-order-line-items/purchase-ordier-line-items.entity';

describe('InventoryService', () => {
  let inventoryService: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        WmsService,
        { provide: getRepositoryToken(Inventory), useClass: Repository },
        { provide: getRepositoryToken(Product), useClass: Repository },
        {
          provide: getRepositoryToken(PS_Product, 'presta'),
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
        { provide: getRepositoryToken(PurchaseOrder), useClass: Repository },
        {
          provide: getRepositoryToken(PurchaseOrderLineItem),
          useClass: Repository,
        },
      ],
    }).compile();

    inventoryService = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(inventoryService).toBeDefined();
  });

  it('should return the last inventory sync item', async () => {
    // Mock the repository method find to return a list of inventory items
    jest
      .spyOn(inventoryService['inventorySyncRepository'], 'find')
      .mockResolvedValue([
        {
          id: 2,
          status: InventorySyncStatus.Finished,
          description: 'test description',
          createdAt: new Date('2023-01-02T00:00:00.000Z'),
        } as Inventory,
        {
          id: 1,
          status: InventorySyncStatus.Finished,
          description: 'test description',
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
        } as Inventory,
      ]);

    const result = await inventoryService.getLast();

    expect(result).toEqual({
      id: 2,
      status: InventorySyncStatus.Finished,
      createdAt: new Date('2023-01-02'),
      description: 'test description',
    });
  });

  it('should return undefined if no inventory items are found', async () => {
    // Mock the repository method find to return an empty list
    jest
      .spyOn(inventoryService['inventorySyncRepository'], 'find')
      .mockResolvedValue([]);

    const result = await inventoryService.getLast();

    expect(result).toBeUndefined();
  });

  it('should create and save an inventory sync item with status "Started"', async () => {
    // Mock the repository method save to return the created inventory item
    jest
      .spyOn(inventoryService['inventorySyncRepository'], 'save')
      .mockResolvedValueOnce({
        id: 1,
        status: InventorySyncStatus.Started,
        description: 'test desctipriont',
      } as Inventory);

    const result = await inventoryService['createInventorySyncItem']();

    expect(result).toEqual({
      id: 1,
      status: InventorySyncStatus.Started,
      description: 'test desctipriont',
    });
  });

  it('should update and save an inventory sync item', async () => {
    const inventoryItem = new Inventory();
    inventoryItem.id = 1;
    inventoryItem.status = InventorySyncStatus.Started;

    // Mock the repository method save to return the updated inventory item
    jest
      .spyOn(inventoryService['inventorySyncRepository'], 'save')
      .mockResolvedValueOnce({
        id: 1,
        status: InventorySyncStatus.Finished,
        description: 'test desctipriont',
      } as Inventory);

    const result =
      await inventoryService['updateInventorySyncItem'](inventoryItem);

    expect(result).toEqual({
      id: 1,
      status: InventorySyncStatus.Finished,
      description: 'test desctipriont',
    });
  });

  it('should remove leading zeros from an input string', () => {
    const inputString = '00012345';
    const result = inventoryService['removeLeadingZeros'](inputString);

    expect(result).toBe('12345');
  });

  it('should return an empty string if the input string is all zeros', () => {
    const inputString = '0000';
    const result = inventoryService['removeLeadingZeros'](inputString);

    expect(result).toBe('');
  });

  it('should return the same string if there are no leading zeros', () => {
    const inputString = '12345';
    const result = inventoryService['removeLeadingZeros'](inputString);

    expect(result).toBe('12345');
  });

  it('should return undefined if the input string is empty', () => {
    const inputString = '';
    const result = inventoryService['removeLeadingZeros'](inputString);

    expect(result).toBe(undefined);
  });

  it('should return the current stock of a product based on its EAN in the list of WMS articles', () => {
    const wmsArticles = [
      { ean: '123456789', currentStock: 50 },
      { ean: '987654321', currentStock: 30 },
      { ean: '555555555', currentStock: 20 },
    ];
    const productEan = '987654321';

    const result = inventoryService['getArticleCurrentStock'](
      wmsArticles,
      productEan,
    );

    expect(result).toBe(30);
  });

  it('should return undefined if the product EAN is not found in the list of WMS articles', () => {
    const wmsArticles = [
      { ean: '123456789', currentStock: 50 },
      { ean: '987654321', currentStock: 30 },
      { ean: '555555555', currentStock: 20 },
    ];
    const productEan = '999999999';

    const result = inventoryService['getArticleCurrentStock'](
      wmsArticles,
      productEan,
    );

    expect(result).toBeUndefined();
  });

  it('should return undefined if the list of WMS articles is empty', () => {
    const wmsArticles: any[] = [];
    const productEan = '987654321';

    const result = inventoryService['getArticleCurrentStock'](
      wmsArticles,
      productEan,
    );

    expect(result).toBeUndefined();
  });

  it('should extract the largest quantity from a list of supplier products', () => {
    const supplierProducts: Product[] = [
      { quantity: '10' } as Product,
      { quantity: '5' } as Product,
      { quantity: '20' } as Product,
    ];

    const result =
      inventoryService['extractQuantityFromMultipleSupplierProducts'](
        supplierProducts,
      );

    expect(result).toBe(20);
  });

  it('should handle zero quantities and return the largest non-negative quantity', () => {
    const supplierProducts: Product[] = [
      { quantity: '0' } as Product,
      { quantity: '15' } as Product,
      { quantity: '8' } as Product,
    ];

    const result =
      inventoryService['extractQuantityFromMultipleSupplierProducts'](
        supplierProducts,
      );

    expect(result).toBe(15);
  });

  it('should handle negative quantities and return the largest non-negative quantity', () => {
    const supplierProducts: Product[] = [
      { quantity: '-5' } as Product,
      { quantity: '10' } as Product,
      { quantity: '12' } as Product,
    ];

    const result =
      inventoryService['extractQuantityFromMultipleSupplierProducts'](
        supplierProducts,
      );

    expect(result).toBe(12);
  });

  it('should return 0 if all quantities are negative or zero', () => {
    const supplierProducts: Product[] = [
      { quantity: '0' } as Product,
      { quantity: '-5' } as Product,
      { quantity: '-10' } as Product,
    ];

    const result =
      inventoryService['extractQuantityFromMultipleSupplierProducts'](
        supplierProducts,
      );

    expect(result).toBe(0);
  });

  it('should return 0 if the list of supplier products is empty', () => {
    const supplierProducts: Product[] = [];

    const result =
      inventoryService['extractQuantityFromMultipleSupplierProducts'](
        supplierProducts,
      );

    expect(result).toBe(0);
  });

  it('should return stock adjustment suggestions for products with valid EANs and positive stock in WMS articles', async () => {
    const wmsArticles = [{ ean: '1234567890123', currentStock: 50 }];
    const ps_products: PS_Product[] = [
      { ean13: '1234567890123', id_product: 1 } as PS_Product,
    ];

    const products: Product[] = [
      { ean: '1234567890123', id: 1, quantity: '5' } as Product,
    ];

    jest
      .spyOn(inventoryService, 'getArticleCurrentStock')
      .mockImplementation((articles, ean) => {
        const article = articles.find((a: any) => a.ean === ean);
        return article ? article.currentStock : undefined;
      });

    jest
      .spyOn(inventoryService['productRepository'], 'find')
      .mockResolvedValue(products);

    const result = await inventoryService['getStockAdjustmentSuggestions'](
      wmsArticles,
      ps_products,
    );

    expect(result).toEqual([{ ean: '1234567890123', newStockValue: 55 }]);
  });
});
