import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import { version } from '@@/package.json';

import ErrorPlugin from '@/plugins/error.plugin';
import AuthPlugin from '@/plugins/auth.plugin';
import AxiosPlugin from '@/plugins/axios.plugin';
import PlanzvitPlugin from '@/plugins/planzvit.plugin';

import PrimeVue from 'primevue/config';
import Lara from '@primevue/themes/lara';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';
import ToastService from 'primevue/toastservice';
import FocusTrap from 'primevue/focustrap';
import Tooltip from 'primevue/tooltip';

import 'primeicons/primeicons.css';
import '@/assets/tailwind.css';
import '@/assets/main.css';

const app = createApp(App);

app.use(router);
app.use(createPinia());

app.use(PrimeVue, {
  theme: {
    preset: Lara,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark',
      cssLayer: false
    }
  },
  locale: {
    startsWith: 'Починається з',
    contains: 'Містить',
    notContains: 'Не містить',
    endsWith: 'Закінчується на',
    equals: 'Рівно',
    notEquals: 'Не рівно',
    noFilter: 'Без фільтра',
    lt: 'Менше ніж',
    lte: 'Менше або дорівнює',
    gt: 'Більше ніж',
    gte: 'Більше або дорівнює',
    dateIs: 'Дата є',
    dateIsNot: 'Дата не є',
    dateBefore: 'Дата до',
    dateAfter: 'Дата після',
    clear: 'Очистити',
    apply: 'Застосувати',
    matchAll: 'Співпадає з усіма',
    matchAny: 'Співпадає з будь-яким',
    addRule: 'Додати правило',
    removeRule: 'Видалити правило',
    accept: 'Так',
    reject: 'Ні',
    choose: 'Вибрати',
    upload: 'Завантажити',
    cancel: 'Скасувати',
    completed: 'Завершено',
    pending: 'В очікуванні',
    fileSizeTypes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    dayNames: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота'],
    dayNamesShort: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    dayNamesMin: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    monthNames: [
      'Січень',
      'Лютий',
      'Березень',
      'Квітень',
      'Травень',
      'Червень',
      'Липень',
      'Серпень',
      'Вересень',
      'Жовтень',
      'Листопад',
      'Грудень'
    ],
    monthNamesShort: [
      'Січ',
      'Лют',
      'Бер',
      'Квіт',
      'Трав',
      'Чер',
      'Лип',
      'Сер',
      'Вер',
      'Жов',
      'Лис',
      'Груд'
    ],
    chooseYear: 'Вибрати рік',
    chooseMonth: 'Вибрати місяць',
    chooseDate: 'Вибрати дату',
    prevDecade: 'Попереднє десятиліття',
    nextDecade: 'Наступне десятиліття',
    prevYear: 'Попередній рік',
    nextYear: 'Наступний рік',
    prevMonth: 'Попередній місяць',
    nextMonth: 'Наступний місяць',
    prevHour: 'Попередня година',
    nextHour: 'Наступна година',
    prevMinute: 'Попередня хвилина',
    nextMinute: 'Наступна хвилина',
    prevSecond: 'Попередня секунда',
    nextSecond: 'Наступна секунда',
    am: 'дп',
    pm: 'пп',
    today: 'Сьогодні',
    weekHeader: 'Тиждень',
    firstDayOfWeek: 0,
    showMonthAfterYear: false,
    dateFormat: 'dd/mm/yy',
    weak: 'Слабкий',
    medium: 'Середній',
    strong: 'Сильний',
    passwordPrompt: 'Введіть пароль',
    searchMessage: 'Доступно {0} результатів',
    selectionMessage: 'Вибрано {0} елементів',
    emptySelectionMessage: 'Немає вибраних елементів',
    emptySearchMessage: 'Не знайдено результатів',
    fileChosenMessage: '{0} файлів',
    noFileChosenMessage: 'Файл не вибрано',
    emptyMessage: 'Немає доступних опцій',
    aria: {
      trueLabel: 'Так',
      falseLabel: 'Ні',
      nullLabel: 'Не вибрано',
      star: '1 зірка',
      stars: '{star} зірки',
      selectAll: 'Вибрано всі елементи',
      unselectAll: 'Вибрано всі елементи',
      close: 'Закрити',
      previous: 'Попередній',
      next: 'Наступний',
      navigation: 'Навігація',
      scrollTop: 'Прокрутка вгору',
      moveTop: 'Перемістити вгору',
      moveUp: 'Перемістити вгору',
      moveDown: 'Перемістити вниз',
      moveBottom: 'Перемістити вниз',
      moveToTarget: 'Перемістити до цілі',
      moveToSource: 'Перемістити до джерела',
      moveAllToTarget: 'Перемістити все до цілі',
      moveAllToSource: 'Перемістити все до джерела',
      pageLabel: 'Сторінка {page}',
      firstPageLabel: 'Перша сторінка',
      lastPageLabel: 'Остання сторінка',
      nextPageLabel: 'Наступна сторінка',
      prevPageLabel: 'Попередня сторінка',
      rowsPerPageLabel: 'Рядків на сторінку',
      jumpToPageDropdownLabel: 'Перейти до сторінки',
      jumpToPageInputLabel: 'Перейти до сторінки',
      selectRow: 'Рядок вибрано',
      unselectRow: 'Рядок не вибрано',
      expandRow: 'Рядок розгорнуто',
      collapseRow: 'Рядок згруповано',
      showFilterMenu: 'Показати меню фільтрації',
      hideFilterMenu: 'Сховати меню фільтрації',
      filterOperator: 'Оператор фільтра',
      filterConstraint: 'Умова фільтра',
      editRow: 'Редагувати рядок',
      saveEdit: 'Зберегти редагування',
      cancelEdit: 'Скасувати редагування',
      listView: 'Список',
      gridView: 'Сітка',
      slide: 'Слайд',
      slideNumber: '{slideNumber}',
      zoomImage: 'Збільшити зображення',
      zoomIn: 'Збільшити',
      zoomOut: 'Зменшити',
      rotateRight: 'Повернути вправо',
      rotateLeft: 'Повернути вліво'
    }
  }
});

app.use(ToastService);
app.use(DialogService);
app.use(ConfirmationService);

app.directive('tooltip', Tooltip);
app.directive('focustrap', FocusTrap);

app.use(ErrorPlugin, { life: 5000 });

app.use(AxiosPlugin, {
  baseURL:
    import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.host}`,
  prefixAPI: '/api',
  options: {
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
  },
  refresh: { url: '/auth/refresh', method: 'get' }
});

app.use(AuthPlugin, {
  endpoints: {
    profile: { url: '/auth/me', method: 'get' },
    signin: { url: '/auth/signin', method: 'post' },
    signup: { url: '/auth/signup', method: 'post' },
    signout: { url: '/auth/signout', method: 'get' },
    reset: { url: '/auth/reset', method: 'post' },
    refresh: { url: '/auth/refresh', method: 'get' }
  }
});

app.use(PlanzvitPlugin, {
  version: version,
  copyright: `Copyright © 2022-${new Date().getFullYear()}. Всі права захищені.`
});

app.config.errorHandler = function (err, vm, info) {
  console.error('errorHandler', err);
};

app.config.warnHandler = (msg, instance, trace) => {
  console.error('warnHandler', msg);
};

app.mount('#app');
