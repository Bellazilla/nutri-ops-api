import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersService } from './purchase-orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './purchase-orders.entity';
import { Repository } from 'typeorm';
import { PurchaseOrderLineItem } from 'purchase-order-line-items/purchase-ordier-line-items.entity';
import { Product } from 'products/products.entity';
import { Supplier } from 'suppliers/suppliers.entity';
import { WmsService } from 'wms/wms.service';
import { PurchaseOrderLineItemsService } from 'purchase-order-line-items/purchase-order-line-items.service';
import { PurchaseOrderUpdateDTO } from './dto/update-purchase-order-dto';
import * as powerbodyExportUtils from 'utilities/supplier-adapters/powerbody/export-purchase-order';
import * as vitamin360ExportUtils from 'utilities/supplier-adapters/vitamin360/export-purchase-order';

describe('PurchaseOrdersService', () => {
  let service: PurchaseOrdersService;
  let purchaseOrderRepository: Repository<PurchaseOrder>;
  let purchaseOrderLineItemRepository: Repository<PurchaseOrderLineItem>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrdersService,
        WmsService,
        PurchaseOrderLineItemsService,
        { provide: getRepositoryToken(PurchaseOrder), useClass: Repository },
        {
          provide: getRepositoryToken(PurchaseOrderLineItem),
          useClass: Repository,
        },
        { provide: getRepositoryToken(Product), useClass: Repository },
        { provide: getRepositoryToken(Supplier), useClass: Repository },
      ],
    }).compile();

    service = module.get<PurchaseOrdersService>(PurchaseOrdersService);
    purchaseOrderRepository = module.get<Repository<PurchaseOrder>>(
      getRepositoryToken(PurchaseOrder),
    );
    purchaseOrderLineItemRepository = module.get<
      Repository<PurchaseOrderLineItem>
    >(getRepositoryToken(PurchaseOrderLineItem));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update the status when purchase order is found', async () => {
    // Arrange
    const reference = '123';
    const purchaseOrder: PurchaseOrder = {
      id: 1,
      reference,
      status: PurchaseOrderStatus.Draft,
    } as PurchaseOrder; // Replace with actual data

    jest
      .spyOn(purchaseOrderRepository, 'findOne')
      .mockResolvedValueOnce(purchaseOrder);
    jest.spyOn(service, 'update').mockResolvedValueOnce(purchaseOrder);

    // Act
    const result = await service.setStatus(
      reference,
      PurchaseOrderStatus.Created,
    );

    // Assert
    expect(result).toEqual(purchaseOrder);
  });

  it('should return "purchase order not found" when purchase order is not found', async () => {
    // Arrange
    const reference = '456';

    jest.spyOn(purchaseOrderRepository, 'findOne').mockResolvedValueOnce(null);

    // Act
    const result = await service.setStatus(
      reference,
      PurchaseOrderStatus.Created,
    );

    // Assert
    expect(result).toEqual('purchase order not found');
  });

  it('should handle errors during update status and return an appropriate response', async () => {
    // Arrange
    const reference = '789';
    const purchaseOrder: PurchaseOrder = {
      id: 1,
      reference,
      status: PurchaseOrderStatus.Draft,
    } as PurchaseOrder; // Replace with actual data

    jest
      .spyOn(purchaseOrderRepository, 'findOne')
      .mockResolvedValueOnce(purchaseOrder);
    jest
      .spyOn(service, 'update')
      .mockResolvedValueOnce('purchase order not found');

    // Act
    const result = await service.setStatus(
      reference,
      PurchaseOrderStatus.Cancelled,
    );

    // Assert
    expect(result).toEqual('purchase order not found'); // Adjust the expected error message as needed
  });

  it('should return an array of PurchaseOrder objects', async () => {
    // Arrange
    const purchaseOrders: PurchaseOrder[] = [
      {
        id: 1,
        reference: 'PO001',
        status: PurchaseOrderStatus.Created,
      } as PurchaseOrder,
      {
        id: 2,
        reference: 'PO002',
        status: PurchaseOrderStatus.Created,
      } as PurchaseOrder,
      // Add more sample data as needed
    ];

    jest
      .spyOn(purchaseOrderRepository, 'find')
      .mockResolvedValueOnce(purchaseOrders);

    // Act
    const result = await service.findAll();

    // Assert
    expect(result).toEqual(purchaseOrders);
  });

  it('should return a PurchaseOrder when a valid ID is provided', async () => {
    // Arrange
    const id = 1;
    const purchaseOrder: PurchaseOrder = {
      id,
      reference: 'PO001',
      status: PurchaseOrderStatus.Created,
    } as PurchaseOrder; // Replace with actual data

    jest
      .spyOn(purchaseOrderRepository, 'findOne')
      .mockResolvedValueOnce(purchaseOrder);

    // Act
    const result = await service.findOne(id);

    // Assert
    expect(result).toEqual(purchaseOrder);
  });

  it('should return null when no PurchaseOrder is found for the provided ID', async () => {
    // Arrange
    const id = 2;

    jest.spyOn(purchaseOrderRepository, 'findOne').mockResolvedValueOnce(null);

    // Act
    const result = await service.findOne(id);

    // Assert
    expect(result).toBeNull();
  });

  it('should return an array of PurchaseOrderLineItem objects for a valid purchaseOrderId', async () => {
    // Arrange
    const purchaseOrderId = 1;
    const lineItems: PurchaseOrderLineItem[] = [
      { id: 1, quantity: 10 } as PurchaseOrderLineItem,
      { id: 2, quantity: 23 } as PurchaseOrderLineItem,
      { id: 3, quantity: 40 } as PurchaseOrderLineItem,
    ];

    jest
      .spyOn(purchaseOrderLineItemRepository, 'find')
      .mockResolvedValueOnce(lineItems);

    // Act
    const result = await service.getPurchaseOrderLineItems(purchaseOrderId);

    // Assert
    expect(result).toEqual(lineItems);
  });

  it('should return an empty array when no PurchaseOrderLineItem is found for the provided purchaseOrderId', async () => {
    // Arrange
    const purchaseOrderId = 2;

    jest
      .spyOn(purchaseOrderLineItemRepository, 'find')
      .mockResolvedValueOnce([]);

    // Act
    const result = await service.getPurchaseOrderLineItems(purchaseOrderId);

    // Assert
    expect(result).toEqual([]);
  });

  it('should update and publish the purchase order successfully', async () => {
    // Arrange
    const updateDto: PurchaseOrderUpdateDTO = {
      id: 1,
      reference: 'PO001',
      status: PurchaseOrderStatus.Created,
    } as PurchaseOrderUpdateDTO; // Replace with actual data
    const purchaseOrder: PurchaseOrder = {
      id: 1,
      reference: 'PO001',
      status: PurchaseOrderStatus.Created,
    } as PurchaseOrder; // Replace with actual data

    jest
      .spyOn(purchaseOrderRepository, 'findOne')
      .mockResolvedValueOnce(purchaseOrder);
    jest
      .spyOn(purchaseOrderRepository, 'save')
      .mockResolvedValueOnce(purchaseOrder);
    jest
      .spyOn(service, 'createOrUpdateWmsPurchaseOrder')
      .mockResolvedValueOnce(purchaseOrder as any);

    // Act
    const result = await service.publish(updateDto);

    // Assert
    expect(result).toEqual(purchaseOrder);
  });

  it('should export Vitamin360 purchase order successfully', async () => {
    // Arrange
    const purchaseOrderId = 1;
    const purchaseOrder: PurchaseOrder = {
      id: purchaseOrderId,
      supplier: { name: 'Powerbody' } as Supplier,
    } as PurchaseOrder; // Replace with actual data
    const lineItems: PurchaseOrderLineItem[] = [
      {
        id: 1,
        quantity: 10,
        product: { id: 101, product: 'product 1' } as Product,
      } as PurchaseOrderLineItem,
      {
        id: 2,
        quantity: 5,
        product: { id: 102, product: 'product 2' } as Product,
      } as PurchaseOrderLineItem,
      // Add more sample data as needed
    ];

    jest
      .spyOn(purchaseOrderRepository, 'findOne')
      .mockResolvedValueOnce(purchaseOrder);
    jest
      .spyOn(purchaseOrderLineItemRepository, 'find')
      .mockResolvedValueOnce(lineItems);
    jest
      .spyOn(powerbodyExportUtils, 'exportPurchaseOrder')
      .mockResolvedValueOnce('Exported Powerbody order');

    // Act
    const result = await service.exportPurchaseOrder(purchaseOrderId);

    // Assert
    expect(result).toEqual('Exported Powerbody order');
  });

  it('should export Vitamin360 purchase order successfully', async () => {
    // Arrange
    const purchaseOrderId = 1;
    const purchaseOrder: PurchaseOrder = {
      id: purchaseOrderId,
      supplier: { name: 'Vitamin360' } as Supplier,
    } as PurchaseOrder; // Replace with actual data
    const lineItems: PurchaseOrderLineItem[] = [
      {
        id: 1,
        quantity: 10,
        product: { id: 101, product: 'product 1' } as Product,
      } as PurchaseOrderLineItem,
      {
        id: 2,
        quantity: 5,
        product: { id: 102, product: 'product 2' } as Product,
      } as PurchaseOrderLineItem,
      // Add more sample data as needed
    ];

    jest
      .spyOn(purchaseOrderRepository, 'findOne')
      .mockResolvedValueOnce(purchaseOrder);
    jest
      .spyOn(purchaseOrderLineItemRepository, 'find')
      .mockResolvedValueOnce(lineItems);
    jest
      .spyOn(vitamin360ExportUtils, 'exportPurchaseOrder')
      .mockResolvedValueOnce('Exported Vitamin360 order');

    // Act
    const result = await service.exportPurchaseOrder(purchaseOrderId);

    // Assert
    expect(result).toEqual('Exported Vitamin360 order');
  });
});
