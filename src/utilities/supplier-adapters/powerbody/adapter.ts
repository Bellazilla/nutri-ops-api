import * as XLSX from 'xlsx';
import * as path from 'path';

const columnNameMapping = {
  Brand: 'brand',
  Product: 'product',
  rrp: 'rrp',
  QTY: 'quantity',
  'Wholesale Price': 'wholesalePrice',
  'Wholesale Price With Your Discount': 'wholeSalePriceWithYourDiscount',
  Promo: 'promo',
  SKU: 'sku',
  EAN: 'ean',
  'Product Url': 'productUrl',
  'Image Url': 'imageUrl',
};

function modifyFile(filename: string) {
  const workbook = XLSX.readFile(filename);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (sheet['!ref']) {
    // Skip the first 11 rows
    const range = XLSX.utils.decode_range(sheet['!ref']);
    range.s.r = 11;
    sheet['!ref'] = XLSX.utils.encode_range(range);

    // Get the content of row 9
    const row10 = XLSX.utils.sheet_to_json(sheet, { range: 9, header: 1 })[0];

    // Delete row 9
    XLSX.utils.sheet_add_aoa(sheet, [], { origin: 8 });

    // Insert row 9 data at the top
    XLSX.utils.sheet_add_aoa(sheet, [row10 as any], { origin: 0 });

    return sheet;
  }
}

export const processExcelFile = async () => {
  const rootFolder = process.cwd();

  const productDownloadsFolder = 'test-folder';
  const fileName = 'powerbody.xls';
  const filePath = path.join(rootFolder, productDownloadsFolder, fileName);

  const modifiedSheet = modifyFile(filePath);

  // Convert the sheet to JSON
  const rawData = XLSX.utils.sheet_to_json(modifiedSheet as unknown as any);

  // Extract and map the data using columnNameMapping
  const mappedData = rawData.slice(9, rawData.length).map((row: any) => {
    const mappedRow: any = {};
    for (const [sourceColumnName, targetColumnName] of Object.entries(
      columnNameMapping,
    )) {
      mappedRow[targetColumnName] = row[sourceColumnName] || null;
    }
    return mappedRow;
  });

  return mappedData;
};
