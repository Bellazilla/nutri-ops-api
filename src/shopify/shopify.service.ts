import { Injectable } from '@nestjs/common';
import * as Shopify from 'shopify-api-node';
import { ProductsService } from 'products/products.service';
import { Product } from 'products/products.entity';
import { findLargestNumber } from 'utils/findLargestNumber';
import { WmsService } from 'wms/wms.service';

const shopify = new Shopify({
  shopName: '4bdabb-d9',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN ?? '',
  apiVersion: '2024-07',
});

@Injectable()
export class ShopifyService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly wmsService: WmsService,
  ) {}

  async initiateBulkOperation() {
    const mutation = `mutation {
            bulkOperationRunQuery(
                query: """
                {
                    productVariants{
                        edges {
                            node { 
                                id
                                title
                                sku
                                inventoryQuantity
                                inventoryItem {
                                    id
                                }
                            }
                        }
                    }
                }
                """
            ) {
                bulkOperation {
                    id
                    status
                }
                userErrors {
                    field
                    message
                }
            }
        }`;

    try {
      const response = await shopify.graphql(mutation);
      const operation = response.bulkOperationRunQuery.bulkOperation;
      if (operation.userErrors && operation.userErrors.length > 0) {
        throw new Error(
          `Error initiating bulk operation: ${operation.userErrors[0].message}`,
        );
      }
      return operation.id;
    } catch (error) {
      console.error('Error initiating bulk operation:', error);
      throw error;
    }
  }

  async cancelBulkOperation(operationId: string) {
    const mutation = `mutation {
            bulkOperationCancel(id: "gid://shopify/BulkOperation/${operationId}") {
              bulkOperation {
                status
              }
              userErrors {
                field
                message
              }
            }
          }
          `;
    const response = await shopify.graphql(mutation);
    return response;
  }

  async pollBulkOperationStatus(operationId: string) {
    const query = `query {
            node(id: "${operationId}") {
                ... on BulkOperation {
                    id
                    status
                    url
                    partialDataUrl
                }
            }
        }`;

    try {
      let status = 'RUNNING';
      let resultUrl = null;

      while (status === 'RUNNING') {
        const response = await shopify.graphql(query);
        const operation = response.node;

        status = operation.status;
        resultUrl = operation.url;

        if (status === 'RUNNING') {
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
        }
      }

      if (status !== 'COMPLETED') {
        throw new Error(`Bulk operation failed with status: ${status}`);
      }

      return resultUrl;
    } catch (error) {
      console.error('Error polling bulk operation status:', error);
      throw error;
    }
  }

  async fetchBulkOperationResults(resultUrl: string) {
    try {
      const response = await fetch(resultUrl);
      const resultText = await response.text();
      const jsonLines = resultText.trim().split('\n');
      const resultData = jsonLines.map((line) => JSON.parse(line));
      return resultData;
    } catch (error) {
      console.error('Error fetching bulk operation results:', error);
      throw error;
    }
  }

  async getAllProducts() {
    try {
      const operationId = await this.initiateBulkOperation();
      const resultUrl = await this.pollBulkOperationStatus(operationId);
      const products = await this.fetchBulkOperationResults(resultUrl);

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async inventorySetQuantities(quantities: any[]) {
    const mutation = `mutation inventorySetQuantities($input: InventorySetQuantitiesInput!) {
            inventorySetQuantities(input: $input) {
              inventoryAdjustmentGroup {
                reason
                referenceDocumentUri
                changes {
                  name
                  delta
                  quantityAfterChange
                }
              }
              userErrors {
                code
                field
                message
              }
            }
          }`;

    const variables = {
      input: {
        ignoreCompareQuantity: true,
        name: 'available',
        reason: 'correction',
        referenceDocumentUri:
          'logistics://some.warehouse/take/2023-01-23T13:14:15Z',
        quantities: quantities,
      },
    };

    try {
      const response = await shopify.graphql(mutation, { ...variables });
      return response;
    } catch (e) {
      console.error(e);
    }
  }

  async getProducts() {
    const query = `query {
            productVariants(first: 50){
            edges {
                node { 
                    id
                    title
                    sku
                    inventoryQuantity
                    inventoryQuantity
                    inventoryItem {
                        id
                    }
                }
            }
        }
    }`;

    try {
      const response = await shopify.graphql(query);
      return response.productVariants.edges.map((item: any) => {
        return { ...item.node };
      });
    } catch (e) {
      console.error(e);
    }
  }

  getQuantity(current: number, newQuantity: number) {
    return newQuantity - current;
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

  getQuantityFromSuppliers(supplierProducts: Product[], product: any) {
    const results = supplierProducts.filter((sp) => sp.ean === product.sku);
    return this.extractQuantityFromMultipleSupplierProducts(results);
  }

  getTotalInStock(supplierProducts: Product[]) {
    let totalStock = 0;
    for (const product of supplierProducts) {
      totalStock = totalStock + product.warehouse_stock;
    }

    return totalStock;
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

  getStockAdjustmentSuggestions(
    product: any,
    supplierProducts: Product[],
    wmsArticles: any[],
  ) {
    if (product.sku) {
      const quantityFromSuppliers =
        this.getQuantityFromSuppliers(supplierProducts, product) ?? 0;
      const quantityFromStock =
        this.getArticleCurrentStock(wmsArticles, product.sku) ?? 0;

      return quantityFromStock + quantityFromSuppliers;
    }
  }

  async syncInventory() {
    const allSupplierProducts = await this.productsService.findAll();
    const allWmsArticles =
      await this.wmsService.getAllArticlesWithStockInformation();
    const allProducts = await this.getAllProducts();
    const quantities = [];

    for (const product of allProducts) {
      if (product.sku === '6711500976640') {
        console.log(product);
      }
      const relevantSupplierProducts = await allSupplierProducts.filter(
        (p) => p.ean === product.sku,
      );
      const suggestedQuantity = this.getStockAdjustmentSuggestions(
        product,
        relevantSupplierProducts,
        allWmsArticles,
      );
      quantities.push({
        inventoryItemId: product.inventoryItem.id,
        locationId: 'gid://shopify/Location/95159746908',
        quantity: suggestedQuantity,
        compareQuantity: null,
      });
    }

    function chunkArray(array: any[], chunkSize: number) {
      const chunks = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
    }

    const chunkedQuantities = chunkArray(quantities, 250);

    for (const chunk of chunkedQuantities) {
      await this.inventorySetQuantities(chunk);
    }
  }
}
