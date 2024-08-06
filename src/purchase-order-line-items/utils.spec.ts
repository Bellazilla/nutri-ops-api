import { calculatePurchaseOrderQuantity } from './utils';

describe.skip('functions', () => {
  it('test 1: returns a number if expected stock is less than stock limit', () => {
    const mockArticle = {
      stockLimit: 2,
      inventoryInfo: {
        numberOfItems: 10,
        numberOfBookedItems: 20,
        toReceiveNumberOfItems: 5,
      },
    };
    expect(calculatePurchaseOrderQuantity(mockArticle)).toBe(7);
  });

  it('test 2: returns 0 if expected stock is greater than stock limit', () => {
    const mockArticle = {
      stockLimit: 15,
      inventoryInfo: {
        numberOfItems: 0,
        numberOfBookedItems: 12,
        toReceiveNumberOfItems: 60,
      },
    };
    expect(calculatePurchaseOrderQuantity(mockArticle)).toBe(0);
  });

  it('test 3: returns a number of items', () => {
    const mockArticle = {
      stockLimit: 25,
      inventoryInfo: {
        numberOfItems: 24,
        numberOfBookedItems: 11,
        toReceiveNumberOfItems: 10,
      },
    };
    expect(calculatePurchaseOrderQuantity(mockArticle)).toBe(2);
  });
});
