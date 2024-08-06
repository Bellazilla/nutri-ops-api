export const addLeadingZeros = (str: string): string => {
  if (str) {
    const targetLength = 13;
    if (str.length < targetLength) {
      const numberOfZerosToAdd = targetLength - str.length;
      const zeros = '0'.repeat(numberOfZerosToAdd);
      return zeros + str;
    } else {
      return str;
    }
  }

  return str;
};
