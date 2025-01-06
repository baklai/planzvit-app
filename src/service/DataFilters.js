export const dateToStr = value => {
  return value ? new Date(value).toLocaleDateString() : value;
};

export const dateToLocaleStr = (value, locale) => {
  return value
    ? new Date(value).toLocaleDateString(locale, {
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    : value;
};

export const dateTimeToStr = value => {
  return value ? new Date(value).toLocaleString() : value;
};

export const unixDateTimeToStr = value => {
  return value ? new Date(value * 1000).toLocaleString() : value;
};

export const strToDate = value => {
  if (!value?.length) return '-';
  return [value?.slice(0, 4), '/', value?.slice(4, 6), '/', value?.slice(6)].join('');
};

export const capitalizeFirstLetter = str => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};
