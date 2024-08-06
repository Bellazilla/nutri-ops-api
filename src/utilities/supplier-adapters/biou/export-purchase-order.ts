import * as fs from 'fs';
import * as path from 'path';
import * as converter from 'json-2-csv';
import { PurchaseOrderLineItem } from 'purchase-order-line-items/purchase-ordier-line-items.entity';

const keys = [
  { field: 'product.ean_original', title: 'EAN' },
  { field: 'quantity', title: 'Quatity' },
];

export const exportPurchaseOrder = async (
  lineItems: PurchaseOrderLineItem[],
  fileName: string,
) => {
  const mappedLineItems = lineItems.map((lineItem) => {
    const mappedProduct = {
      ...lineItem.product,
      ean: lineItem.product.ean_original,
    };
    const mappedLineItem = { ...lineItem, product: mappedProduct };
    return mappedLineItem;
  });
  const csv = await converter.json2csv(mappedLineItems, { keys: keys });

  const csvWithoutHeaders = csv.split('\n').slice(1).join('\n');

  const rootFolder = process.cwd();
  const exportsFolder = 'exports';

  const filePath = path.join(rootFolder, exportsFolder, fileName);

  try {
    // Create the exports directory if it doesn't exist
    await fs.mkdir(path.join(rootFolder, exportsFolder), () => {});

    // Write the file
    await fs.writeFile(filePath, csvWithoutHeaders, () => {});
    return filePath;
  } catch (e) {
    console.error(e);
  }
};
