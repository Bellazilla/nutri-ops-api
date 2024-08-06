import { PurchaseOrderLineItemDto } from 'purchase-order-line-items/dto/create-purchase-order-line-item-dto';
import { PurchaseOrderStatus } from 'purchase-orders/purchase-orders.entity';

export class PurchaseOrderUpdateDTO {
  id: number;
  reference: string;
  lineItems: PurchaseOrderLineItemDto[] | null;
  status: PurchaseOrderStatus | null;
}
