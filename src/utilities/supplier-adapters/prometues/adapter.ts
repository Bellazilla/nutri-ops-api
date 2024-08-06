import * as XLSX from 'xlsx';
import * as path from 'path';

const columnNameMapping = {
  Brand: 'brand',
  Description: 'product',
  Stock: 'quantity',
  'Weight (Nett)': 'weight',
  SKU: 'sku',
  'Barcode 1': 'ean',
  'Exp. Date': 'expiryDate',
  COO: 'countryOfOrigin',
  'Price Ex.': 'price',
};

export const processExcelFile = async () => {
  const rootFolder = process.cwd(); // Replace this with your actual root folder path if needed
  const productDownloadsFolder = 'test-folder/prometeus';
  const fileName = 'products.xls'; // Replace with your actual file name
  const filePath = path.join(rootFolder, productDownloadsFolder, fileName);

  const workbook = XLSX.readFile(filePath);

  // Choose a specific sheet by name
  const sheet = workbook.Sheets['Sheet1'];

  // Parse the sheet's data into a JSON object
  const jsonData = XLSX.utils.sheet_to_json(sheet);

  // Extract and map the data using columnNameMapping
  const mappedData = jsonData.slice(9, jsonData.length).map((row: any) => {
    const mappedRow: any = {};
    for (const [sourceColumnName, targetColumnName] of Object.entries(
      columnNameMapping,
    )) {
      mappedRow[targetColumnName] = row[sourceColumnName] || '';
    }
    return mappedRow;
  });

  return mappedData;
};
