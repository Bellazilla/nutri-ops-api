import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Product,
  ProductPopularity,
  ProductsQueryParams,
  StockStatus,
} from './products.entity';
import {
  Repository,
  EntityManager,
  ILike,
  MoreThanOrEqual,
  MoreThan,
  LessThanOrEqual,
} from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { processExcelFile as processPowerbodyFile } from 'utilities/supplier-adapters/powerbody/adapter';
import { processExcelFile as processPrometuesFile } from 'utilities/supplier-adapters/prometues/adapter';
import { getSwedishSupplementsSupplierProducts } from 'utilities/supplier-adapters/swedish-supplements/adapter';
import { processBiouFile } from 'utilities/supplier-adapters/biou/adapter';
import { SuppliersService } from 'suppliers/suppliers.service';
import { Supplier } from 'suppliers/suppliers.entity';
import { processVitamin360File } from 'utilities/supplier-adapters/vitamin360/adapter';
import { addLeadingZeros } from 'utils/addLeadingZeros';
import { InventoryService } from 'inventory/inventory.service';
import { Inventory } from 'inventory/inventory.entity';
import { WmsService } from 'wms/wms.service';
import { convertSEKtoEUR } from 'utils/convertSEKtoEUR';
import { ProductOrderCountService } from 'product-order-count/product-order-count.service';

type Paginate = {
  data: Product[];
  count: number;
  lastSync: Inventory | undefined;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly supplierService: SuppliersService,
    private readonly inventoryService: InventoryService,
    private readonly wmsService: WmsService,
    private readonly productOrderCountService: ProductOrderCountService,

    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async getTrendingProducts(date: Date) {
    const entries =
      await this.productOrderCountService.getTrendingProductsWithinRange(
        date,
        10,
      );

    return entries;
  }

  async query(
    queryParams: ProductsQueryParams = { pageNumber: 1, pageSize: 25 },
  ): Promise<Paginate> {
    const take = queryParams.pageSize;
    const skip = (queryParams.pageNumber - 1) * queryParams.pageSize;

    const whereParams: Record<string, any> = {
      supplier: {},
      orderCounts: {},
    }; // Parameters for the query

    if (queryParams.supplierId) {
      whereParams.supplier.id = queryParams.supplierId;
    }

    if (queryParams.brand) {
      whereParams.brand = ILike(`%${queryParams.brand}%`);
    }

    if (queryParams.sku) {
      whereParams.sku = ILike(`%${queryParams.sku}%`);
    }

    if (queryParams.ean) {
      whereParams.ean = ILike(`%${queryParams.ean}%`);
    }

    if (queryParams.productName) {
      whereParams.product = ILike(`%${queryParams.productName}%`);
    }

    if (queryParams.popularity) {
      whereParams.popularity = queryParams.popularity;
    }

    if (queryParams.stockStatus) {
      whereParams.warehouse_stock =
        queryParams.stockStatus === StockStatus.IN_STOCK
          ? MoreThan(0)
          : LessThanOrEqual(0);
    }

    if (queryParams.orderRange) {
      const date = new Date(queryParams.orderRange);
      date.setHours(0, 0, 0);
      whereParams.orderCounts.createdAt = MoreThanOrEqual(date);
    }

    const [result, total] = await this.productRepository.findAndCount({
      relations: ['supplier', 'orderCounts'],
      where: whereParams,
      skip,
      take,
    });

    const lastSync = await this.inventoryService.getLast();

    return { data: result, count: total, lastSync };
  }

  async query_deprecated(
    queryParams: ProductsQueryParams = { pageNumber: 1, pageSize: 25 },
  ): Promise<Paginate> {
    const take = queryParams.pageSize;
    const skip = (queryParams.pageNumber - 1) * queryParams.pageSize;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Perform a LEFT JOIN with the Supplier table, assuming there's a 'supplierId' column in your Product entity
    queryBuilder.leftJoinAndSelect('product.supplier', 'supplier');

    // Use an array to store filter conditions
    const whereConditions = [];
    const whereParams: Record<string, any> = {}; // Parameters for the query

    // Add a condition to filter by supplierId if it's provided in queryParams
    if (queryParams.supplierId) {
      whereConditions.push('supplier.id = :supplierId');
      whereParams.supplierId = queryParams.supplierId;
    }

    if (queryParams.brand) {
      const brand = `%${queryParams.brand}%`;
      whereConditions.push('product.brand ILIKE :brand');
      whereParams.brand = brand;
    }

    if (queryParams.sku) {
      const sku = `%${queryParams.sku}%`;
      whereConditions.push('product.sku ILIKE :sku');
      whereParams.sku = sku;
    }

    if (queryParams.ean) {
      const ean = `%${queryParams.ean}%`;
      whereConditions.push('product.ean ILIKE :ean'); // Change '=' to 'LIKE'
      whereParams.ean = ean; // Use the modified 'sku' with wildcards
    }

    if (queryParams.productName) {
      const productName = `%${queryParams.productName}%`;
      whereConditions.push('product.product ILIKE :productName');
      whereParams.productName = productName;
    }

    // Combine all filter conditions using 'AND'
    if (whereConditions.length > 0) {
      queryBuilder.where(whereConditions.join(' AND '), whereParams);
    }

    // Add other conditions, filters, or order by clauses as needed
    // For example:
    // queryBuilder.andWhere('product.someColumn = :value', { value: someValue });
    // queryBuilder.orderBy('product.name', 'ASC');

    // Execute the query and get the result and total count

    const lastSync = await this.inventoryService.getLast();

    const [result, total] = await queryBuilder
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return { data: result, count: total, lastSync };
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(
    query: Partial<Product>,
    supplierId: number,
  ): Promise<Product | null> {
    return this.productRepository.findOneBy({
      sku: query.sku,
      ean: query.ean,
      supplier: { id: supplierId },
    });
  }

  async create(product: Product): Promise<Product> {
    return this.productRepository.save(product);
  }

  async update(id: number, product: Partial<Product>): Promise<Product> {
    const entity = await this.productRepository.findOne({ where: { id } });

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }

    // Update the entity fields with the updateData
    this.productRepository.merge(entity, product);

    return this.productRepository.save(entity);
  }

  async getOutOfStockProducts() {
    const wmsArticles = await this.wmsService.getProductsWithLowStock();
    const products_out_of_stock: Product[] = [];
    for (const article of wmsArticles.data) {
      const products = await this.productRepository.find({
        where: { ean: article?.barCodeInfo?.barCode },
      });
      if (products.length) {
        let totalStock = 0;
        for (const product of products) {
          totalStock += parseInt(product.quantity);
        }

        if (totalStock === 0) {
          products_out_of_stock.push(products[0]);
        }
      }
    }

    return products_out_of_stock;
  }

  async createOrUpdateProducts(
    supplier: Supplier,
    products: Product[],
    entityManager: EntityManager,
  ) {
    try {
      await entityManager.transaction(async (transactionalEntityManager) => {
        for (const product of products) {
          if (product) {
            transactionalEntityManager.upsert(
              Product,
              { ...product, supplier },
              ['sku'],
            );
          }
        }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  removeDuplicateProducts(products: Partial<Product>[]) {
    const visitedEans = new Set();
    const nonDuplicatedList: any = [];

    products.forEach((obj) => {
      const ean = obj.ean;
      if (!visitedEans.has(ean)) {
        visitedEans.add(ean);
        nonDuplicatedList.push(obj);
      }
    });

    return nonDuplicatedList;
  }

  async syncSwedishSupplementsProducts(supplier: Supplier) {
    try {
      const products = await getSwedishSupplementsSupplierProducts();
      const visitedEans = new Set();
      const mappedProducts = products.map((p: any) => {
        if (
          p.articleNumber &&
          !visitedEans.has(addLeadingZeros(p.articleNumber))
        ) {
          visitedEans.add(addLeadingZeros(p.articleNumber));
          const brand = p.articleName.substring(0, p.articleName.indexOf('-'));
          const product: Partial<Product> = {
            brand: brand.trim() ?? '',
            ean: addLeadingZeros(p.articleNumber),
            imageUrl: '',
            rrp: '',
            sku: addLeadingZeros(p.articleNumber),
            price: convertSEKtoEUR(p.purchasePrice, 0.088), // convert from Swedish Kroner to Euro
            quantity: p.inventoryInfo.sellableNumberOfItems,
            product: p.articleName,
            wholesalePrice: '',
            wholesalePriceWithPromo: '',
            productUrl: '',
            warehouse_stock: p?.inventoryInfo?.sellableNumberOfItems ?? 0,
            minimumReorderAmount: p?.minimumReorderQuantity ?? 0,
          };
          return product;
        }
      });

      await this.createOrUpdateProducts(
        supplier,
        mappedProducts as Product[],
        this.entityManager,
      );
    } catch (e) {
      console.log(e);
    }
  }
  async syncPowerbodyProducts(supplier: Supplier, wmsArticles: any[]) {
    try {
      const products = await processPowerbodyFile();
      const visitedEans = new Set();
      const mappedProducts = [];
      for (const p of products) {
        visitedEans.add(addLeadingZeros(p.ean));
        const wmsArticle = wmsArticles.find(
          (a) => a.articleNumber === addLeadingZeros(p.ean),
        );
        const product: Partial<Product> = {
          brand: p.brand,
          ean: addLeadingZeros(p.ean),
          imageUrl: p.imageUrl,
          rrp: '',
          sku: p.sku,
          price: p.wholeSalePriceWithYourDiscount || p.promo,
          quantity: p.quantity,
          product: p.product,
          wholesalePrice: p.wholesalePrice,
          wholesalePriceWithPromo: p.wholesalePriceWithPromo,
          productUrl: p.productUrl,
          warehouse_stock:
            wmsArticle?.inventoryInfo?.sellableNumberOfItems ?? 0,
          minimumReorderAmount: wmsArticle?.minimumReorderQuantity ?? 0,
        };

        mappedProducts.push(product);
      }

      await this.createOrUpdateProducts(
        supplier,
        mappedProducts as Product[],
        this.entityManager,
      );
    } catch (e) {
      console.log(e);
    }
  }

  getDiscountPrice = (supplier: Supplier, product: Product) => {
    if (!supplier.discountDeal) {
      return product.price;
    }

    const originalPrice = Number(product.price);
    const discount = (originalPrice * supplier.discountDeal) / 100;

    return originalPrice - discount;
  };

  async syncBiouProducts(supplier: Supplier, wmsArticles: any[]) {
    try {
      const products = await processBiouFile();
      const visitedEans = new Set();
      const mappedProducts = [];
      for (const p of products) {
        visitedEans.add(addLeadingZeros(p.ean));
        const wmsArticle = wmsArticles.find(
          (a) => a.articleNumber === addLeadingZeros(p.ean),
        );
        const product: Partial<Product> = {
          brand: p.brand,
          ean: addLeadingZeros(p.ean),
          ean_original: p.ean,
          imageUrl: p.imageUrl,
          rrp: '',
          sku: p.sku,
          price: this.getDiscountPrice(supplier, p),
          quantity: p.quantity,
          product: p.product,
          wholesalePrice: '',
          wholesalePriceWithPromo: '',
          productUrl: '',
          warehouse_stock:
            wmsArticle?.inventoryInfo?.sellableNumberOfItems ?? 0,
          minimumReorderAmount: wmsArticle?.minimumReorderQuantity ?? 0,
        };

        mappedProducts.push(product);
      }

      await this.createOrUpdateProducts(
        supplier,
        mappedProducts as Product[],
        this.entityManager,
      );
    } catch (e) {
      console.log(e);
    }
  }

  async syncPrometeusProducts(supplier: Supplier, wmsArticles: any[]) {
    try {
      const products = await processPrometuesFile();
      const visitedEans = new Set();
      const mappedProducts = products.map((p) => {
        if (p.ean && !visitedEans.has(addLeadingZeros(p.ean))) {
          visitedEans.add(addLeadingZeros(p.ean));
          const wmsArticle = wmsArticles.find(
            (a) => a.articleNumber === addLeadingZeros(p.ean),
          );
          const product: Partial<Product> = {
            brand: p.brand,
            ean: addLeadingZeros(p.ean),
            imageUrl: p.imageUrl,
            rrp: '',
            sku: p.sku,
            price: p.wholeSalePriceWithYourDiscount || p.promo,
            quantity: p.quantity,
            product: p.product,
            wholesalePrice: p.wholesalePrice,
            wholesalePriceWithPromo: p.wholesalePriceWithPromo,
            productUrl: p.productUrl,
            warehouse_stock:
              wmsArticle?.inventoryInfo?.sellableNumberOfItems ?? 0,
            minimumReorderAmount: wmsArticle?.minimumReorderQuantity ?? 0,
          };
          return product;
        }
      });

      await this.createOrUpdateProducts(
        supplier,
        mappedProducts as Product[],
        this.entityManager,
      );
    } catch (e) {
      console.log(e);
    }
  }

  async syncVitamin360Products(supplier: Supplier, wmsArticles: any[]) {
    try {
      const products = await processVitamin360File();
      const visitedEans = new Set();
      const mappedProducts = [];
      for (const p of products) {
        if (p.ean && !visitedEans.has(addLeadingZeros(p.ean))) {
          visitedEans.add(addLeadingZeros(p.ean));
          const wmsArticle = wmsArticles.find(
            (a) => a.articleNumber === addLeadingZeros(p.ean),
          );
          const product: Partial<Product> = {
            brand: p.brand,
            ean: addLeadingZeros(p.ean),
            imageUrl: p.imageUrl,
            rrp: '',
            sku: p.sku,
            price: p.price,
            quantity: p.quantity,
            product: p.product,
            wholesalePrice: '',
            wholesalePriceWithPromo: '',
            productUrl: '',
            warehouse_stock:
              wmsArticle?.inventoryInfo?.sellableNumberOfItems ?? 0,
            minimumReorderAmount: wmsArticle?.minimumReorderQuantity ?? 0,
          };
          mappedProducts.push(product);
        }
      }

      await this.createOrUpdateProducts(
        supplier,
        mappedProducts as Product[],
        this.entityManager,
      );
    } catch (e) {
      console.log(e);
    }
  }

  async syncProducts() {
    try {
      const wmsArticles = await this.wmsService.getAllArticles();
      await this.resetProductsQuantity();
      const suppliers = await this.supplierService.findAll();
      console.info('---------SYNC STARTED----------');
      for (const supplier of suppliers) {
        if (supplier.is_active) {
          switch (supplier.name.toLowerCase()) {
            case 'biou':
              await this.syncBiouProducts(supplier, wmsArticles);
              break;
            case 'powerbody':
              await this.syncPowerbodyProducts(supplier, wmsArticles);
              break;
            case 'swedishsupplements':
              await this.syncSwedishSupplementsProducts(supplier);
              break;

            case 'vitamin360':
              await this.syncVitamin360Products(supplier, wmsArticles);
              break;
            case 'prometeus':
              await this.syncPrometeusProducts(supplier, wmsArticles);
              break;
            default:
          }
        }
      }

      return 'products were succesfully synced';
    } catch (e) {
      throw e;
    }
  }

  async resetProductsQuantity() {
    try {
      const products = await this.productRepository.find();
      for (const product of products) {
        await this.update(product.id, { quantity: '0' });
      }

      return 'Successfully reset products quantity';
    } catch (e) {
      console.error(e);
      return 'Reset products quantity was not succesful';
    }
  }

  async setProductPopularity(
    productId: number,
    productPopularity: ProductPopularity,
  ): Promise<boolean> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (product?.id) {
      product.popularity = productPopularity;
      await this.productRepository.save(product);

      return true;
    }

    return false;
  }

  async resetProductsPopularity() {
    const products = await this.productRepository.find();
    for (const product of products) {
      await this.setProductPopularity(product.id, ProductPopularity.not_sold);
    }

    return true;
  }

  async syncProductsPopularity() {
    try {
      await this.resetProductsPopularity();
      await this.syncLowPopularProducts();
      await this.syncMediumPopularProducts();
      await this.syncHighPopularProducts();

      return 'successfully updated popular products';
    } catch (e) {
      console.error('something when wrong when syncing product popularity', e);
      return 'Could not sync product popularity records. Please refer to logs';
    }
  }

  async syncHighPopularProducts() {
    const date = new Date();
    date.setDate(date.getDate() - 28);
    const products =
      await this.productOrderCountService.getTrendingProductsWithinRange(
        date,
        16,
      );
    for (const p of products) {
      await this.setProductPopularity(p.product.id, ProductPopularity.high);
    }

    return 'done';
  }

  async syncMediumPopularProducts() {
    const date = new Date();
    date.setDate(date.getDate() - 28);
    const products =
      await this.productOrderCountService.getTrendingProductsWithinRange(
        date,
        4,
      );
    for (const p of products) {
      await this.setProductPopularity(p.product.id, ProductPopularity.medium);
    }

    return 'done';
  }

  async syncLowPopularProducts() {
    const date = new Date();
    date.setDate(date.getDate() - 28);
    const products =
      await this.productOrderCountService.getTrendingProductsWithinRange(
        date,
        1,
      );
    for (const p of products) {
      await this.setProductPopularity(p.product.id, ProductPopularity.low);
    }

    return 'done';
  }
}
