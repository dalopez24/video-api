export const isFiveMinuteRange = (startDate, endDate): boolean => {
  return endDate - startDate <= 300;
};
