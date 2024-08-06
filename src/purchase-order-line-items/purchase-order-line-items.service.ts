import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import {
  PurchaseOrderLineItem,
  PurchaseOrderLineItemQueryParams,
} from './purchase-ordier-line-items.entity';
import {
  CreatePurchaseOrderLineItemDto,
  GeneratePurchaseOrderLineItemsDto,
  PurchaseOrderLineItemDto,
} from 'purchase-order-line-items/dto/create-purchase-order-line-item-dto';
import {
  PurchaseOrder,
  PurchaseOrderStatus,
} from '../purchase-orders/purchase-orders.entity';
import { Product, ProductPopularity } from '../products/products.entity';
import { UpdatePurchaseOrderLineItemDto } from './dto/update-purchase-order-line-item-dto';
import { error } from 'console';
import { WmsService } from '../wms/wms.service';
import { calculatePurchaseOrderQuantity } from './utils';

type Paginate = {
  data: any;
  count: number;
};

@Injectable()
export class PurchaseOrderLineItemsService {
  constructor(
    @InjectRepository(PurchaseOrderLineItem)
    private readonly purchaseOrderLineItemRepository: Repository<PurchaseOrderLineItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    private readonly wmsService: WmsService,
  ) {}

  async remove(id: number) {
    try {
      await this.purchaseOrderLineItemRepository.delete(id);
      return {
        status: 200,
        message: `succesfully deleted ${id}`,
      };
    } catch (e) {
      return {
        status: 400,
        message: 'something went wrong',
        error: e,
      };
    }
  }

  async query(
    queryParams: PurchaseOrderLineItemQueryParams,
  ): Promise<Paginate> {
    const {
      pageSize = 25,
      pageNumber = 1,
      purchaseOrderId,
      ean,
      sku,
      brand,
      productName,
    } = queryParams;
    const skip = (pageNumber - 1) * pageSize;

    const [data, total] =
      await this.purchaseOrderLineItemRepository.findAndCount({
        where: {
          purchaseOrder: { id: purchaseOrderId },
          product: {
            ...(productName && { product: ILike(`%${productName}%`) }),
            ...(sku && { sku: ILike(`%${sku}%`) }),
            ...(ean && { ean: ILike(`%${ean}%`) }),
            ...(brand && { brand: ILike(`%${brand}%`) }),
          },
        },
        order: { product: { popularity: 'ASC' }, quantity: 'DESC' },
        relations: ['product'],
        take: pageSize,
        skip,
      });

    const mappedData = data.map((item) => ({
      ...item.product,
      productId: item.product.id,
      productName: item.product.product,
      id: item.id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      quantity: item.quantity,
    }));

    return {
      data: mappedData,
      count: total,
    };
  }

  async isProductInOtherOpePurchaseOrders(product: Product): Promise<boolean> {
    // Check if product exists in any open purchase orders
    const lineItems = await this.purchaseOrderLineItemRepository.find({
      where: [
        {
          product: { id: product.id },
          purchaseOrder: { status: PurchaseOrderStatus.Created },
        },
        {
          purchaseOrder: { status: PurchaseOrderStatus.WmsNotified },
        },
      ],
    });

    return !!lineItems.length;
  }

  async isExisting(
    purchaseOrderId: number,
    productId: number,
  ): Promise<boolean> {
    const purchaseOrderLineItem =
      await this.purchaseOrderLineItemRepository.findOne({
        where: {
          purchaseOrder: { id: purchaseOrderId },
          product: { id: productId },
        },
      });

    return !!purchaseOrderLineItem;
  }

  async isOpeForAddingLineItems(purchaseOrderId: number): Promise<boolean> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id: purchaseOrderId },
    });
    if (!purchaseOrder) {
      return false;
    }

    const { status } = purchaseOrder;
    const isOpen =
      status === PurchaseOrderStatus.Created ||
      status === PurchaseOrderStatus.Draft ||
      status === PurchaseOrderStatus.WmsNotified;

    return isOpen;
  }

  async create(
    createDto: CreatePurchaseOrderLineItemDto,
  ): Promise<PurchaseOrderLineItem | string> {
    const canAdd = await this.isOpeForAddingLineItems(
      createDto.purchaseOrderId,
    );

    if (!canAdd) {
      return 'Purchase order is not open for adding line items';
    }

    const isExisting = await this.isExisting(
      createDto.purchaseOrderId,
      createDto.productId,
    );
    if (isExisting) {
      return 'Product already existing in the Purchase Order';
    }

    try {
      const lineItem = new PurchaseOrderLineItem();
      const purchaseOrder = await this.purchaseOrderRepository.findOne({
        where: { id: createDto.purchaseOrderId },
      });
      const product = await this.productRepository.findOne({
        where: { id: createDto.productId },
      });
      if (purchaseOrder?.id && product?.id) {
        lineItem.purchaseOrder = purchaseOrder;
        lineItem.product = product;
        lineItem.quantity = createDto.quantity;
      }

      const newLineItem =
        await this.purchaseOrderLineItemRepository.save(lineItem);
      return newLineItem;
    } catch (e) {
      return 'something went wrong when creating purchase order line item';
    }
  }

  async createLineItem(
    purchaseOrder: PurchaseOrder,
    product: Product,
    quantity: number,
  ): Promise<PurchaseOrderLineItem> {
    const lineItem = new PurchaseOrderLineItem();
    lineItem.purchaseOrder = purchaseOrder;
    lineItem.product = product;
    lineItem.quantity = quantity;

    await this.purchaseOrderLineItemRepository.save(lineItem);

    return lineItem;
  }

  async update(
    updateDto: UpdatePurchaseOrderLineItemDto,
  ): Promise<PurchaseOrderLineItem | string> {
    try {
      const lineItem = await this.purchaseOrderLineItemRepository.findOne({
        where: { id: updateDto.id },
      });
      if (lineItem?.id) {
        lineItem.quantity = updateDto.quantity;
        const updateLineItem =
          await this.purchaseOrderLineItemRepository.save(lineItem);
        return updateLineItem;
      }
    } catch (e) {
      throw error;
    }

    return `something went wrong while update line item with id ${updateDto.id}`;
  }

  async createPurchaseOrderLineItems(
    purchaseOrder: PurchaseOrder,
    lineItems: PurchaseOrderLineItemDto[],
  ): Promise<string> {
    try {
      for (const lineItem of lineItems) {
        const product = await this.productRepository.findOne({
          where: { id: lineItem.productId },
        });
        if (product?.id) {
          this.createLineItem(purchaseOrder, product, lineItem.quantity);
        }
      }
      return 'ok';
    } catch (e) {
      throw e;
    }
  }

  findCheapestProduct(products: Product[]) {
    if (products.length === 0) {
      return null;
    }

    let cheapestProduct = products[0];

    for (let i = 1; i < products.length; i++) {
      if (products[i].price && products[i].price < cheapestProduct.price) {
        cheapestProduct = products[i];
      }
    }

    return cheapestProduct;
  }

  isMatchinSupplier(purchaseOrder: PurchaseOrder, product: Product) {
    return purchaseOrder?.supplierId === product?.supplier?.id;
  }

  private async canAddProductToLineItem(
    purchaseOrder: PurchaseOrder,
    product: Product,
  ): Promise<boolean> {
    if (this.isMatchinSupplier(purchaseOrder, product)) {
      return true;
    }

    return false;
  }

  removeLeadingZeros(inputString: string) {
    if (inputString && inputString.length) {
      let i = 0;

      // Find the index of the first non-zero character
      while (i < inputString.length && inputString[i] === '0') {
        i++;
      }

      // Return the substring starting from the first non-zero character
      return inputString.substring(i);
    }
  }

  async getQuantity(
    purchaseOrder: PurchaseOrder,
    product: Product,
    wmsArticle: any,
    miminumQuantity = 0,
  ) {
    let quantity = 0;
    const canAdd = await this.canAddProductToLineItem(purchaseOrder, product);
    if (product && canAdd) {
      quantity = calculatePurchaseOrderQuantity(wmsArticle);
      if (quantity > 0 && quantity < miminumQuantity) {
        quantity = miminumQuantity;
      }
    }

    return quantity;
  }

  private async findMatchingProducts(
    purchaseOrder: PurchaseOrder,
    wmsArticles: any[],
  ) {
    try {
      const products: PurchaseOrderLineItemDto[] = [];

      for (const wmsArticle of wmsArticles) {
        if (wmsArticle.articleNumber === '0768990537875') {
          console.log(wmsArticle);
        }
        const ean = this.removeLeadingZeros(wmsArticle?.barCodeInfo?.barCode);

        const results = await this.productRepository.find({
          where: {
            ean: ILike(`%${ean}%`),
            quantity: Not('0'),
            supplier: { is_active: true },
          },
          relations: ['supplier'],
        });

        if (results.length) {
          const cheapestProduct = this.findCheapestProduct(results);

          if (cheapestProduct) {
            const canAddToPurchaseOrder = await this.canAddProductToLineItem(
              purchaseOrder,
              cheapestProduct,
            );
            if (canAddToPurchaseOrder) {
              const miminumQuantity =
                cheapestProduct?.popularity === ProductPopularity.high ? 3 : 0;
              const quantity = await this.getQuantity(
                purchaseOrder,
                cheapestProduct,
                wmsArticle,
                miminumQuantity,
              );
              if (quantity > 0) {
                products.push({ productId: cheapestProduct.id, quantity });
              }
            }
          }
        }
      }

      return products;
    } catch (e) {
      console.error(e);
    }
  }

  async generateLineItemsBasedOnWmsOrders(
    generateLineItemsDto: GeneratePurchaseOrderLineItemsDto,
  ) {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id: generateLineItemsDto.purchaseOrderId },
    });

    if (!purchaseOrder) {
      return;
    }

    const wmsArticles = await this.wmsService.getProductsWithLowStock();

    const newLineItems = await this.findMatchingProducts(
      purchaseOrder,
      wmsArticles.data,
    );

    if (newLineItems) {
      return await this.createPurchaseOrderLineItems(
        purchaseOrder,
        newLineItems,
      );
    }

    return [];
  }
}
