import * as fs from 'fs';
import * as path from 'path';
import * as converter from 'json-2-csv';
import { PurchaseOrderLineItem } from 'purchase-order-line-items/purchase-ordier-line-items.entity';

const keys = [
  { field: 'product.sku', title: 'SKU' },
  { field: 'quantity', title: 'Quantity' },
  { field: 'product.product', title: 'Name' },
];

export const exportPurchaseOrder = async (
  lineItems: PurchaseOrderLineItem[],
  fileName: string,
) => {
  const csv = await converter.json2csv(lineItems, { keys: keys });

  const rootFolder = process.cwd();
  const exportsFolder = 'exports';

  const filePath = path.join(rootFolder, exportsFolder, fileName);

  try {
    // Create the exports directory if it doesn't exist
    await fs.mkdir(path.join(rootFolder, exportsFolder), () => {});

    // Write the file
    await fs.writeFile(filePath, csv, () => {});
    return filePath;
  } catch (e) {
    console.error(e);
  }
};
