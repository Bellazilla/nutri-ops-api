import { PurchaseOrderLineItemDto } from 'purchase-order-line-items/dto/create-purchase-order-line-item-dto';

export class PurchaseOrderCreateDTO {
  reference: string;
  lineItems: PurchaseOrderLineItemDto[] | null;
  supplierId: number;
  autoGenerateLineItems: boolean;
}
