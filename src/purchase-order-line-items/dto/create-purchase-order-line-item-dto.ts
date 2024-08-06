export class PurchaseOrderLineItemDto {
  productId: number;
  quantity: number;
}

export class CreatePurchaseOrderLineItemDto {
  purchaseOrderId: number;
  productId: number;
  quantity: number;
}

export class GeneratePurchaseOrderLineItemsDto {
  purchaseOrderId: number;
}
