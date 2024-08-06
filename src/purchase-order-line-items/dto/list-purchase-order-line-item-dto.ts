export class ListPurchaseOrderLineItemDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  quantity: number;
  brand: string;
  productName: string;
  productId: number;
  sku: string;
  ean: string;
  imageUrl: string;
}
