export const removeLeadingZeros = (inputString: string) => {
  if (inputString && inputString.length) {
    let i = 0;

    // Find the index of the first non-zero character
    while (i < inputString.length && inputString[i] === '0') {
      i++;
    }

    // Return the substring starting from the first non-zero character
    return inputString.substring(i);
  }
};
