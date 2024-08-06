import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ErrorLogType } from 'error-logs/error-logs.entity';
import { ErrorLogsService } from 'error-logs/error-logs.service';
import { PrestaProductService } from 'presta_product/presta-product.service';

@Injectable()
export class TrustpilotService {
  constructor(
    private readonly prestaProductsService: PrestaProductService,
    private errorLogService: ErrorLogsService,
  ) {}

  private baseUrl = process.env.TRUSTPILOT_API_BASE_URL;
  private apiKey = process.env.TRUSTPILOT_API_KEY;
  private apiSecret = process.env.TRUSTPILOT_API_SECRET;
  private username = process.env.TRUSTPILOT_API_USERNAME;
  private password = process.env.TRUSTPILOT_API_PASSWORD;
  private businessUnitId = process.env.TRUSTPILOT_API_BUSINESS_UNIT_ID;
  private access_token = undefined;

  async getAccessToken() {
    const body = {
      grant_type: 'password',
      username: this.username,
      password: this.password,
    };

    const authorization = `Basic ${btoa(`${this.apiKey}:${this.apiSecret}`)}`;

    await axios
      .post(
        `${this.baseUrl}/oauth/oauth-business-users-for-applications/accesstoken`,
        body,
        {
          headers: {
            Authorization: authorization,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((response) => {
        this.access_token = response.data.access_token;
      })
      .catch((e) => {
        console.error(e);
      });
  }

  async getProducts(skus: string[]) {
    let productsRespose = null;
    await axios
      .get(
        `${this.baseUrl}/private/business-units/${
          this.businessUnitId
        }/products?skus=${skus.join(',')}`,
        { headers: { Authorization: `Bearer ${this.access_token}` } },
      )
      .then((response) => {
        productsRespose = {
          status: 200,
          data: response.data?.products,
        };
      });

    return productsRespose;
  }

  async generateServiceReviewLink(
    email: string,
    name: string,
    referenceId: string,
  ) {
    let serviceReviewLinkResponse = null;

    const body = {
      locationId: 'nutri',
      referenceId: referenceId,
      email: email,
      name: name,
      locale: 'sv-SE',
      redirectUri: 'https://www.nutri.se',
    };
    await axios
      .post(
        `https://invitations-api.trustpilot.com/v1/private/business-units/62e635d7bce119780b99571f/invitation-links`,
        body,
        { headers: { Authorization: `Bearer ${this.access_token}` } },
      )
      .then((response) => {
        serviceReviewLinkResponse = response.data;
      })
      .catch((e) => {
        console.error(e);
      });
    return serviceReviewLinkResponse;
  }

  async generateProductsReviewLink(
    productIds: string[],
    email: string,
    name: string,
    referenceId: string,
  ) {
    let productReviewLinkResponse = null;
    const body = {
      consumer: {
        email: email,
        name: name,
      },
      referenceId: referenceId,
      locale: 'sv-SE',
      redirectUri: 'https://www.nutri.se',
      productIds: productIds,
    };

    await axios
      .post(
        `${this.baseUrl}/private/product-reviews/business-units/${this.businessUnitId}/invitation-links`,
        body,
        { headers: { Authorization: `Bearer ${this.access_token}` } },
      )
      .then((response) => {
        productReviewLinkResponse = response.data;
      });
    return productReviewLinkResponse;
  }

  generateProductImageUrl(imageId: number, link: string) {
    // if (imageId) {
    //     const formattedImageId = imageId.toString().split('').join('/')
    //     return `https://nutri.se/img/p/${formattedImageId}/${imageId.toString()}.jpg`
    // }

    if (imageId) {
      return `https://nutri.se/${imageId}/${link}.jpg`;
    }
  }

  generateProductLink(link: string, productId: number) {
    if (link) {
      return `https://nutri.se/${productId.toString()}-${link}.html`;
    }
  }

  generateCombinationProductLink(
    link: string,
    productId: number,
    productAttributeId: number,
  ) {
    if (link) {
      return `https://nutri.se/${productId.toString()}-${productAttributeId}-${link}.html`;
    }
  }

  getPrice(price: number) {
    // Return tax calculated (12%) price
    return Math.ceil(price + price * 0.12);
  }

  async retrievePrestaSimpleProducts() {
    const ps_products = await this.prestaProductsService.getPrestaProducts();
    const products = [];
    for (const product of ps_products) {
      // This is it to take only simple products since combination products come with no price
      if (product.ean13 && product.price > 0) {
        const newProduct = {
          sku: product.ean13,
          googleMerchantCenterProductId: product.ean13,
          title: product.information[0]?.name,
          link: this.generateProductLink(
            product.information[0]?.link_rewrite,
            product.id_product,
          ),
          imageLink: this.generateProductImageUrl(
            product.images[0]?.id_image,
            product.information[0]?.link_rewrite,
          ),
          price: this.getPrice(product.price).toString(),
          currency: 'SEK',
          gtin: product.ean13,
          mpn: product.ean13,
          brand: product.manufacturer?.name,
          description: product.information[0].meta_description,
          productCategoryGoogleId: '5b7d41d30390dd0199bcf8bd',
        };

        products.push(newProduct);
      }
    }
    return products;
  }

  async retrievePrestaCombinationProducts() {
    const results =
      await this.prestaProductsService.getPrestaCombinationProducts();
    const products = [];
    for (const result of results) {
      if (result.product && result.ean13) {
        const imageId = result.images.length
          ? result.images[0]?.id_image
          : result.product?.images[0]?.id_image;
        const newProduct = {
          sku: result.ean13,
          googleMerchantCenterProductId: result.ean13,
          title: result.product?.information
            ? result.product?.information[0]?.name
            : '',
          link: this.generateCombinationProductLink(
            result.product.information[0]?.link_rewrite,
            result.product.id_product,
            result.id_product_attribute,
          ),
          imageLink: this.generateProductImageUrl(
            imageId,
            result.product.information[0]?.link_rewrite,
          ),
          price: this.getPrice(result.price).toString(),
          currency: 'SEK',
          gtin: result.ean13,
          mpn: result.ean13,
          brand: result.product?.manufacturer?.name,
          description: result.product.information[0].meta_description,
          productCategoryGoogleId: '5b7d41d30390dd0199bcf8bd',
        };
        products.push(newProduct);
      }
    }
    return products;
  }

  async syncProducts() {
    try {
      const simpleProducts = await this.retrievePrestaSimpleProducts();
      const combinationProducts =
        await this.retrievePrestaCombinationProducts();

      const allProducts: any[] = [...simpleProducts, ...combinationProducts];

      await this.getAccessToken();
      const url = `https://api.trustpilot.com/v1/private/business-units/${this.businessUnitId}/products`;

      const batchSize = 1000;
      const responses = [];

      for (let i = 0; i < allProducts.length; i += batchSize) {
        const batch = allProducts.slice(i, i + batchSize);
        const body = {
          products: batch,
          skuSameAsGoogleMerchantCenterProductId: true,
        };

        try {
          const response = await axios.post(url, JSON.stringify(body), {
            headers: {
              Authorization: `Bearer ${this.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          responses.push({
            status: response.status,
            data: response.data,
          });
        } catch (error) {
          console.error(error);
          responses.push({
            status: 400,
            error: 'Error in batch request',
            requestBody: JSON.stringify(body),
          });
        }
      }

      // Check responses and handle as needed
      const successfulResponses = responses.filter((res) => res.status === 200);
      const failedResponses = responses.filter((res) => res.status !== 200);

      if (failedResponses.length > 0) {
        console.error(failedResponses);
        await this.errorLogService.create({
          type: ErrorLogType.TrustpilotProductSync,
          description: `Something went wrong while syncing products in Trustpilot, timestamp: ${new Date()}`,
        });
        return {
          status: 400,
          message: 'Sync Trustpilot products not successful',
          failedResponses,
        };
      }

      return {
        status: 200,
        successfulResponses,
      };
    } catch (error) {
      console.error(error);
      return {
        status: 400,
        message: 'Sync Trustpilot products not successful',
      };
    }
  }
}
