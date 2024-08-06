import * as fs from 'fs';
import * as path from 'path';
import { PurchaseOrderLineItem } from 'purchase-order-line-items/purchase-ordier-line-items.entity';

export const exportPurchaseOrder = async (
  lineItems: PurchaseOrderLineItem[],
  fileName: string,
) => {
  let content = '';
  lineItems.forEach((item) => {
    content += `${item.product.ean};${item.quantity}\n`;
  });

  const rootFolder = process.cwd();
  const exportsFolder = 'exports';

  // Modify the fileName to ensure it has a .txt extension
  if (!fileName.endsWith('.txt')) {
    fileName += '.txt';
  }

  const filePath = path.join(rootFolder, exportsFolder, fileName);

  try {
    // Create the exports directory if it doesn't exist
    await fs.mkdir(path.join(rootFolder, exportsFolder), () => {});

    // Write the file
    await fs.writeFile(filePath, content, () => {});
    return filePath;
  } catch (e) {
    console.error(e);
  }
};
