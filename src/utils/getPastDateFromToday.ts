export const getPastDateFromToday = ({
  numberOfDaysToGoBack,
}: {
  numberOfDaysToGoBack: number;
}) => {
  const today = new Date();

  today.setDate(today.getDate() - numberOfDaysToGoBack);

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
};
