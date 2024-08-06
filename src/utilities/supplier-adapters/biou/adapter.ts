import axios from 'axios';
import * as xml2js from 'xml2js';

export const processBiouFile = async () => {
  // URL of the webpage with the XML data
  const url =
    'https://biou.pl/modules/pricewars2/service.php?alias=biou-se559127428601-2511-1';

  // Make an HTTP GET request to the webpage
  try {
    // Make an HTTP GET request to the webpage
    const response = await axios.get(url);

    // Check if the response status is successful (e.g., 200 OK)
    if (response.status === 200) {
      // XML data is in response.data
      const xmlData = response.data;

      // Parse the XML data into a JavaScript object
      const result = await xml2js.parseStringPromise(xmlData, {
        explicitArray: false,
      });

      // Process the parsed XML data and return the mapped result
      return result.nokaut.offers.offer.map((item: any) => ({
        product: item.name,
        brand: item.producer,
        ean: item.property['0']._,
        sku: item.id,
        rrp: item.property['2']._,
        quantity: item.instock,
        imageUrl: item.image,
        price: item.property['2']._,
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
