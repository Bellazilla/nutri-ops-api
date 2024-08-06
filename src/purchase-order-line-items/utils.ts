export const calculatePurchaseOrderQuantity = (article: any) => {
  const { stockLimit, inventoryInfo } = article;
  const { numberOfItems, numberOfBookedItems, toReceiveNumberOfItems } =
    inventoryInfo;

  const availableStock = numberOfItems + toReceiveNumberOfItems;

  if (availableStock - numberOfBookedItems <= stockLimit) {
    return Math.max(stockLimit - availableStock + numberOfBookedItems, 0);
  } else {
    return 0;
  }
};
