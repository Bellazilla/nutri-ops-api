export const findLargestNumber = (numbers: number[]) => {
  if (numbers.length === 0) {
    return undefined;
  }

  return Math.max.apply(null, numbers);
};
