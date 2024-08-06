import axios from 'axios';

export const getSwedishSupplementsSupplierProducts = async () => {
  const wmsBaseUrl = process.env.WMS_BASE_API;
  const wmsGoodsOwnerId = process.env.WMS_GOODS_OWNER_ID;
  const headers = {
    Authorization: process.env.WMS_AUTHENTICATION,
  };

  const response = await axios.get(
    `${wmsBaseUrl}/articles?goodsOwnerId=${wmsGoodsOwnerId}&articleNameContains=['Swedish Supplements']`,
    { headers: headers },
  );

  const filteredData = response?.data?.filter((article: any) =>
    article.articleName.includes('Swedish Supplements'),
  );

  return filteredData;
};
