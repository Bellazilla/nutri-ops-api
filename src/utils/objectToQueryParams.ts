export const objectToQueryParams = (obj: any) => {
  const queryParams = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (Array.isArray(value)) {
        // Handle arrays by repeating the parameter for each value
        value.forEach((item) => {
          queryParams.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(item)}`,
          );
        });
      } else {
        // Handle single values
        queryParams.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        );
      }
    }
  }

  return queryParams.join('&');
};
