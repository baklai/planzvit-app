export const dateToStr = value => {
  return value ? new Date(value).toLocaleDateString() : value;
};

export const dateToMonthStr = value => {
  if (!value) return;
  const date = new Date(value);
  const formatter = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' });
  return formatter.format(date);
};

export const dateToMonthPeriodStr = value => {
  if (!value) return;

  const currentDate = new Date(value);
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');

  return `з 01.${month}.${year} по ${new Date(year, month, 0).toISOString().slice(8, 10)}.${month}.${year} р.`;
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
