import axios from 'axios';
import * as xml2js from 'xml2js';

export const processVitamin360File = async () => {
  // URL of the webpage with the XML data
  const url =
    'http://universaleximp.dyndns.biz/mdb/xml/b2b_feed.php?lang=eng&price=1014&code=135265284';

  // Make an HTTP GET request to the webpage
  try {
    // Make an HTTP GET request to the webpage
    const response = await axios.get(url);

    // Check if the response status is successful (e.g., 200 OK)
    if (response.status === 200) {
      // XML data is in response.data
      const xmlData = response.data;

      // Parse the XML data into a JavaScript object
      const result = await xml2js.parseStringPromise(xmlData);

      // Process the parsed XML data and return the mapped result
      return result.products.product.map((item: any) => ({
        product: item.name[0],
        brand: item.brand[0],
        ean: item.ean[0],
        sku: item.id[0],
        rrp: item.net_price[0],
        quantity: item.stock[0],
        imageUrl: item.pictures[0].main_picture[0],
        price: item.net_price[0],
      }));
    } else {
      console.error(
        `Error: Unable to fetch data from ${url}. Status code: ${response.status}`,
      );
    }
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
  }
  // Return an empty array if there's an error or no data
  return [];
};
