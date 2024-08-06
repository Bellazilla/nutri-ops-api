import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Product } from 'products/products.entity';
import { PurchaseOrderLineItem } from 'purchase-order-line-items/purchase-ordier-line-items.entity';
import { PurchaseOrder } from 'purchase-orders/purchase-orders.entity';
import { Repository } from 'typeorm';
import { objectToQueryParams } from 'utils/objectToQueryParams';

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export interface PopularProduct extends Product {
  numberOfTimeOrdered: number;
}
@Injectable()
export class WmsService {
  @InjectRepository(Product)
  private readonly productRepositoru: Repository<Product>;
  @InjectRepository(PurchaseOrder)
  private readonly purchaseOrderRepository: Repository<PurchaseOrder>;
  @InjectRepository(PurchaseOrderLineItem)
  private readonly purchaseOrderLineItemRepository: Repository<PurchaseOrderLineItem>;

  private wmsBaseUrl = process.env.WMS_BASE_API;
  private wmsGoodsOwnerId = process.env.WMS_GOODS_OWNER_ID;
  private headers = {
    Authorization: process.env.WMS_AUTHENTICATION,
  };

  private addLeadingZeros(str: string) {
    const targetLength = 13;
    if (str.length < targetLength) {
      const numberOfZerosToAdd = targetLength - str.length;
      const zeros = '0'.repeat(numberOfZerosToAdd);
      return zeros + str;
    } else {
      return str;
    }
  }

  getPurchaseOrderLines(lineItems: PurchaseOrderLineItem[]) {
    return lineItems.map((lineItem) => ({
      rowNumber: lineItem.id,
      articleNumber: this.addLeadingZeros(lineItem.product.ean),
      numberOfItems: lineItem.quantity,
    }));
  }

  async putPurchaseOrder(purchaseOrderId: number) {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id: purchaseOrderId },
      relations: ['supplier'],
    });

    if (purchaseOrder?.id) {
      const lineItems = await this.purchaseOrderLineItemRepository.find({
        where: { purchaseOrder: { id: purchaseOrderId } },
        relations: ['product'],
      });

      const wmsPurchaseOrder = {
        goodsOwnerId: this.wmsGoodsOwnerId,
        purchaseOrderNumber: purchaseOrder.reference,
        supplierInfo: {
          supplierName: purchaseOrder.supplier.name,
          supplierAddress: {
            name: purchaseOrder.supplier.name,
            address: ' ',
            postCode: ' ',
            city: ' ',
            telePhone: ' ',
            remark: ' ',
            email: ' ',
            mobilePhone: ' ',
            countryStateCode: ' ',
            countryCode: '',
          },
        },
        purchaseOrderLines: this.getPurchaseOrderLines(lineItems),
      };

      try {
        const response = await axios.put(
          `${this.wmsBaseUrl}/purchaseOrders`,
          wmsPurchaseOrder,
          { headers: this.headers },
        );
        if (response) {
          return {
            message: 'Pruchase order created in wms',
            data: response,
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  async queryArticles(articleNumbers: string[]) {
    const queryParams = articleNumbers
      .map((number) => `articleNumbers=${encodeURIComponent(number)}`)
      .join('&');
    const response = await axios.get(
      `${this.wmsBaseUrl}/articles?goodsOwnerId=${this.wmsGoodsOwnerId}&${queryParams}`,
      { headers: this.headers },
    );

    return response.data;
  }

  async getAllArticles() {
    const response = await axios.get(
      `${this.wmsBaseUrl}/articles?goodsOwnerId=${this.wmsGoodsOwnerId}`,
      { headers: this.headers },
    );

    return response.data;
  }

  async getProductsWithLowStock() {
    const response = await axios.get(
      `${this.wmsBaseUrl}/articles?goodsOwnerId=${this.wmsGoodsOwnerId}&onlyArticlesBelowStockLimitConsideringNumberOfBookedItems=true`,
      { headers: this.headers },
    );
    const articles = response.data;
    const filteredArticles = articles.filter(
      (article: any) => article.inventoryInfo.numberOfBookedItems > 0,
    );
    return {
      count: filteredArticles.length,
      data: filteredArticles,
    };
  }

  async generateStockLimitFroGivenArticles(articles: any[]) {
    await Promise.all(
      articles.map(async (article) => {
        try {
          const body = {
            stockLimit: getRandomInt(10, 100),
            minimumReorderQuantity: getRandomInt(10, 100),
            goodsOwnerId: this.wmsGoodsOwnerId,
            articleNumber: article.articleNumber,
          };
          await axios.put(
            `${this.wmsBaseUrl}/articles/${article.articleSystemId}`,
            body,
            { headers: this.headers },
          );
        } catch (e) {
          console.error(e);
        }
      }),
    );

    return 'ok';
  }

  async queryOrders(queryParams: any) {
    const params = {
      goodsOwnerId: this.wmsGoodsOwnerId,
      maxOrdersToGet: 3000,
      ...queryParams,
    };

    try {
      const resposne = await axios.get(
        `${this.wmsBaseUrl}/orders?${objectToQueryParams(params)}`,
        { headers: this.headers },
      );
      return resposne.data;
    } catch (e) {
      console.log(e);
    }
  }

  extractArticlesFromOrders(orders: any) {
    const allLineItems = orders.flatMap((order: any) => order.orderLines);

    if (allLineItems.length) {
      const allArticleNumbers = allLineItems.map(
        (lineItem: any) => lineItem?.article.articleNumber,
      );
      return allArticleNumbers;
    }
    return [];
  }

  countMostRepeatedItems(
    strings: string[],
  ): { articleNumber: string; count: number }[] {
    const stringCounts: { [key: string]: number } = {};

    // Count the occurrences of each string in the array
    for (const str of strings) {
      if (stringCounts[str]) {
        stringCounts[str]++;
      } else {
        stringCounts[str] = 1;
      }
    }

    // Find the most repeated items and their counts
    const mostCommon = Object.entries(stringCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([articleNumber, count]) => ({ articleNumber, count }));

    return mostCommon;
  }

  async getProductByArticleNumber(articleNumber: string) {
    const product = await this.productRepositoru.find({
      where: { ean: this.addLeadingZeros(articleNumber) },
    });
    return product;
  }

  async getMostPopularProducts(
    dateFrom: string,
    limit: number = 10,
  ): Promise<PopularProduct[]> {
    const mostPopularProducts: PopularProduct[] = [];

    const queryParams = {
      orderCreatedTimeFrom: dateFrom,
    };
    const orders = await this.queryOrders(queryParams);
    if (orders.length) {
      const articleNumbers = this.extractArticlesFromOrders(orders);
      const mostRepeatedArticles = this.countMostRepeatedItems(
        articleNumbers as string[],
      );
      if (mostRepeatedArticles) {
        const mostPopularArticles = mostRepeatedArticles.filter(
          (item) => item.count > limit,
        );

        for (const article of mostPopularArticles) {
          const products = await this.getProductByArticleNumber(
            article.articleNumber,
          );
          if (products.length) {
            for (const product of products) {
              mostPopularProducts.push({
                ...product,
                numberOfTimeOrdered: article.count,
              });
            }
          }
        }
      }

      return mostPopularProducts;
    }

    return [];
  }

  async getAllArticlesWithStockInformation() {
    const articles = await axios.get(
      `${this.wmsBaseUrl}/articles?goodsOwnerId=${this.wmsGoodsOwnerId}&onlyArticlesInStock=true`,
      { headers: this.headers },
    );
    return articles.data.map((article: any) => ({
      articleNumber: article.articleNumber,
      ean: article.barCodeInfo?.barCode,
      currentStock: article.inventoryInfo.sellableNumberOfItems,
    }));
  }
}
