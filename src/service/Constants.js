export const MONTHS_OF_YEAR = [
  { key: 1, label: 'Січень' },
  { key: 2, label: 'Лютий' },
  { key: 3, label: 'Березень' },
  { key: 4, label: 'Квітень' },
  { key: 5, label: 'Травень' },
  { key: 6, label: 'Червень' },
  { key: 7, label: 'Липень' },
  { key: 8, label: 'Серпень' },
  { key: 9, label: 'Вересень' },
  { key: 10, label: 'Жовтень' },
  { key: 11, label: 'Листопад' },
  { key: 12, label: 'Грудень' }
];

export const DAYS_OF_WEEK = [
  { key: 1, label: 'Понеділок' },
  { key: 2, label: 'Вівторок' },
  { key: 3, label: 'Середа' },
  { key: 4, label: 'Четвер' },
  { key: 5, label: "П'ятниця" },
  { key: 6, label: 'Субота' },
  { key: 7, label: 'Неділя' }
];

export const monthOfNumber = value => {
  return MONTHS_OF_YEAR[value];
};

export const dayOfNumber = value => {
  return DAYS_OF_WEEK[value];
};
