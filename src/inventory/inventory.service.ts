import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PS_Product } from 'presta_entities/presta-product.ps-entity';
import { PS_Stock_Available } from 'presta_entities/presta-stock-available.ps-entity';
import { PS_Product_Attribute } from 'presta_entities/presta_product-attribute.ps-entity';
import { Product } from 'products/products.entity';
import { Not, Repository, createConnection } from 'typeorm';
import { WmsService } from 'wms/wms.service';
import { Inventory, InventorySyncStatus } from './inventory.entity';
import { findLargestNumber } from 'utils/findLargestNumber';
import { prestaShopDataSource } from '../../db/presta-shop-data-source';
import { addLeadingZeros } from 'utils/addLeadingZeros';

type Suggestion = {
  ean: string;
  newStockValue: number;
};

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventorySyncRepository: Repository<Inventory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(PS_Product, 'presta')
    private readonly prestaProductRepository: Repository<PS_Product>,
    @InjectRepository(PS_Stock_Available, 'presta')
    private readonly prestaStockAvailableRepository: Repository<PS_Stock_Available>,
    @InjectRepository(PS_Product_Attribute, 'presta')
    private readonly prestaProductAttributeRepository: Repository<PS_Product_Attribute>,
    private readonly wmsService: WmsService,
  ) {}

  public async getLast() {
    const list = await this.inventorySyncRepository.find({
      order: { createdAt: 'DESC' },
    });
    if (list) {
      return list[0];
    }
  }

  private async createInventorySyncItem() {
    const inventorySyncItem = new Inventory();
    inventorySyncItem.status = InventorySyncStatus.Started;

    return await this.inventorySyncRepository.save(inventorySyncItem);
  }

  private async updateInventorySyncItem(job: Inventory) {
    return await this.inventorySyncRepository.save(job);
  }

  private removeLeadingZeros(inputString: string) {
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

  getArticleCurrentStock(wmsArticles: any, productEan: string) {
    const item = wmsArticles.find((article: any) => {
      if (article.ean === productEan) {
        return article;
      }
    });
    if (item) {
      return item.currentStock;
    }
  }

  private extractQuantityFromMultipleSupplierProducts(
    supplierProducts: Product[],
  ) {
    const allQuantities = [];
    for (const supplierProduct of supplierProducts) {
      const quantity = parseInt(supplierProduct.quantity);
      if (quantity >= 0) {
        allQuantities.push(quantity);
      }
    }
    const largestQuantity = findLargestNumber(allQuantities) || 0;
    return largestQuantity;
  }

  async getStockAdjustmentSuggestions_deprecated(
    wmsArticles: any[],
    products: PS_Product[] | PS_Product_Attribute[],
  ): Promise<Suggestion[]> {
    const supplierProducts = await this.productRepository.find();
    const suggestions: Suggestion[] = [];

    for (const product of products) {
      if (product.ean13) {
        const currentStockInWareHouse = this.getArticleCurrentStock(
          wmsArticles,
          product.ean13,
        );
        if (currentStockInWareHouse && currentStockInWareHouse > 0) {
          suggestions.push({
            ean: addLeadingZeros(product.ean13),
            newStockValue: currentStockInWareHouse ?? 0,
          });
        } else {
          const results = supplierProducts.filter(
            (sp) =>
              this.removeLeadingZeros(sp.ean) ===
              this.removeLeadingZeros(product.ean13),
          );

          if (results.length) {
            const newQuantity =
              this.extractQuantityFromMultipleSupplierProducts(results);
            suggestions.push({
              ean: product.ean13,
              newStockValue: newQuantity,
            });
          }
        }
      }
    }

    return suggestions;
  }

  getQuantityFromSuppliers(
    supplierProducts: Product[],
    product: PS_Product | PS_Product_Attribute,
  ) {
    const results = supplierProducts.filter(
      (sp) =>
        this.removeLeadingZeros(sp.ean) ===
        this.removeLeadingZeros(product.ean13),
    );
    return this.extractQuantityFromMultipleSupplierProducts(results);
  }

  async getStockAdjustmentSuggestions(
    wmsArticles: any[],
    products: PS_Product[] | PS_Product_Attribute[],
  ): Promise<Suggestion[]> {
    const supplierProducts = await this.productRepository.find();
    const suggestions: Suggestion[] = [];

    for (const product of products) {
      if (product.ean13) {
        const quantityFromSuppliers =
          this.getQuantityFromSuppliers(supplierProducts, product) ?? 0;
        const quantityFromStock =
          this.getArticleCurrentStock(wmsArticles, product.ean13) ?? 0;
        const finalQuantity = quantityFromStock + quantityFromSuppliers;
        suggestions.push({ ean: product.ean13, newStockValue: finalQuantity });
      }
    }

    return suggestions;
  }

  async handleSingleProducts(
    products: PS_Product[],
    suggestions: Suggestion[],
    allStockAvailables: PS_Stock_Available[],
  ) {
    const updates = [];
    const visited = new Set();
    for (const product of products) {
      const suggestion = suggestions.find((s) => s.ean === product.ean13);
      const stockAvailable = allStockAvailables.find(
        (asa) => asa.id_product === product.id_product,
      );
      if (stockAvailable && suggestion) {
        if (!visited.has(stockAvailable.id_stock_available)) {
          stockAvailable.quantity = suggestion.newStockValue;
          updates.push(stockAvailable);
          visited.add(stockAvailable.id_stock_available);
        }
      }
    }

    return updates;
  }

  async handleCombinationPorudcts(
    products: PS_Product[],
    suggestions: Suggestion[],
    allStockAvailables: PS_Stock_Available[],
  ) {
    const updates = [];
    const visited = new Set();
    for (const product of products) {
      const stockAvailableItems = allStockAvailables.filter(
        (asa) => asa.id_product === product.id_product,
      );

      let totalQuantity = 0;

      for (const stockAvailable of stockAvailableItems) {
        if (!visited.has(stockAvailable.id_stock_available)) {
          if (
            stockAvailable.id_product_attribute &&
            stockAvailable.productAttribute
          ) {
            const suggestion = suggestions.find(
              (s) => s.ean === stockAvailable.productAttribute.ean13,
            );
            if (suggestion) {
              stockAvailable.quantity = suggestion.newStockValue;
              totalQuantity += suggestion.newStockValue;
              updates.push(stockAvailable);
              visited.add(stockAvailable.id_stock_available);
            }
          }
        }
      }

      const totalQuantityItem = stockAvailableItems.find(
        (sa) => sa.id_product_attribute === 0,
      );
      if (totalQuantityItem) {
        totalQuantityItem.quantity = totalQuantity;
        updates.push(totalQuantityItem);
      }
    }

    return updates;
  }

  async resetStocks() {
    const allStockAvailables = await this.prestaStockAvailableRepository.find({
      where: { quantity: Not(0) },
    });
    const updates = [];
    for (const stockAvailable of allStockAvailables) {
      stockAvailable.quantity = 0;
      updates.push(stockAvailable);
    }

    await this.saveData(updates);
  }

  async adjustInventory() {
    const job = await this.createInventorySyncItem();
    try {
      // Get all warehouse articles

      const wmsArticles =
        await this.wmsService.getAllArticlesWithStockInformation();
      // Get all single products
      const singleProducts = await this.prestaProductRepository.find({
        where: { product_type: Not('combinations') },
      });
      // const a = singleProducts.filter((s)=> s.id_product === 7303)
      // Get all combination products
      const combinationProducts = await this.prestaProductRepository.find({
        where: { product_type: 'combinations' },
      });
      // const b = combinationProducts.filter((s)=> s.id_product === 7303)
      // Get all product attributes
      const allProductAttributes =
        await this.prestaProductAttributeRepository.find();
      // Get single products stock quantity suggestions
      const singleProductStockSuggestions =
        await this.getStockAdjustmentSuggestions(wmsArticles, singleProducts);
      // Get combination products stock quantity suggestions
      const combinationProductsStockSuggestions =
        await this.getStockAdjustmentSuggestions(
          wmsArticles,
          allProductAttributes,
        );
      // Get all stock availables
      const allStockAvailables = await this.prestaStockAvailableRepository.find(
        { relations: ['productAttribute'] },
      );
      // Process update of single products
      const singleProductsUpdates = await this.handleSingleProducts(
        singleProducts,
        singleProductStockSuggestions,
        allStockAvailables,
      );
      // Process update of combination products
      const combinationProductsUpdates = await this.handleCombinationPorudcts(
        combinationProducts,
        combinationProductsStockSuggestions,
        allStockAvailables,
      );

      const updates = [...singleProductsUpdates, ...combinationProductsUpdates];

      await this.saveData(updates);

      job.status = InventorySyncStatus.Finished;
      this.updateInventorySyncItem(job);

      return 'Succesfully updated stock information';
    } catch (e) {
      job.status = InventorySyncStatus.Failed;
      job.description = JSON.stringify(e);
      this.updateInventorySyncItem(job);
      return {
        message: 'something went wrong while syncing stock quantities',
        error: e,
      };
    }
  }

  async saveData(updates: Partial<PS_Stock_Available>[]) {
    try {
      const connection = await createConnection(prestaShopDataSource);
      const queryRunner = connection.createQueryRunner();
      await queryRunner.connect();

      const updateData = updates
        .filter((update) => update.id_stock_available)
        .map((update) => ({
          id: update.id_stock_available,
          quantity: update.quantity,
        }));

      if (updateData.length === 0) {
        console.log('No valid updates to process.');
        return;
      }

      const ids = updateData.map((update) => update.id);
      const quantities = updateData.map((update) => update.quantity);

      await queryRunner.query(
        `UPDATE ps_stock_available
                     SET quantity = CASE id_stock_available
                        ${ids
                          .map(
                            (id, index) =>
                              `WHEN ${id} THEN ${quantities[index]}`,
                          )
                          .join(' ')}
                     END
                     WHERE id_stock_available IN (${ids.join(',')})`,
      );

      await queryRunner.release();
      await connection.destroy();
    } catch (error) {
      console.error('Error establishing the database connection: ', error);
    }
  }
}
