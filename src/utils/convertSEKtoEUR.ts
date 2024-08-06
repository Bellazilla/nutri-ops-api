export const convertSEKtoEUR = (amountSEK: number, exchangeRate: number) => {
  // Check if the amountSEK is a valid number
  if (typeof amountSEK !== 'number' || isNaN(amountSEK) || amountSEK < 0) {
    throw new Error('Invalid amount in Swedish kronor (SEK)');
  }

  // Check if the exchangeRate is a valid number
  if (
    typeof exchangeRate !== 'number' ||
    isNaN(exchangeRate) ||
    exchangeRate <= 0
  ) {
    throw new Error('Invalid exchange rate');
  }

  // Perform the conversion
  const amountEUR = amountSEK * exchangeRate;

  // Round the amountEUR to two decimal places
  const roundedEUR = Math.round(amountEUR * 100) / 100;

  return roundedEUR;
};
