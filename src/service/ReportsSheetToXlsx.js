import ExcelJS from 'exceljs';

import { dateToMonthPeriodStr, dateToMonthStr } from '@/service/DataFilters';

const calculateRowHeight = (text, columnWidth, fontSize = 14) => {
  const charactersPerLine = columnWidth * 1.2;
  const lineCount = Math.ceil(text.length / charactersPerLine);
  const lineHeight = fontSize * 1.5;
  return (lineCount * lineHeight) / 14;
};

export const servicesReport = async (worksheets, datetime) => {
  const workbook = new ExcelJS.Workbook();

  for (const { records } of worksheets) {
    const worksheet = workbook.addWorksheet('SERVICES');

    worksheet.mergeCells('A1:C1');
    worksheet.getCell('A1').value = 'Перелік робіт';
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell('A1').font = { name: 'Times New Roman', size: 14 };

    const headers = [
      { header: '№ п/п', key: 'index', width: 10 },
      { header: 'Код роботи', key: 'code', width: 20 },
      { header: 'Вартість робочого місця (роботи), грн.', key: 'price', width: 25 },
      { header: 'Назва системи', key: 'name', width: 100 }
    ];

    worksheet.getRow(3).values = headers.map(h => h.header);

    worksheet.getRow(3).height = 125;

    worksheet.getRow(3).eachCell(cell => {
      cell.font = { name: 'Times New Roman', size: 12, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    headers.forEach((h, index) => {
      const column = worksheet.getColumn(index + 1);

      if (h.key === 'name') {
        const maxContentLength = Math.max(
          h.header.length,
          ...records.map(item => item[h.key]?.toString().length || 0)
        );

        column.width = Math.min(maxContentLength + 2, 80);
      } else {
        column.width = h.width;
      }
    });

    const rowStyles = [
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      }
    ];

    records.forEach((item, index) => {
      const row = worksheet.getRow(4 + index);
      Object.values(item).forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;
        cell.font = rowStyles[colIndex].font;
        cell.alignment = rowStyles[colIndex].alignment;
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    records.forEach((item, index) => {
      const rowIndex = 4 + index;
      const row = worksheet.getRow(rowIndex);

      let maxLines = 1;
      headers.forEach((header, colIndex) => {
        const value = item[header.key];
        if (value) {
          const text = value.toString();
          const columnWidth = worksheet.getColumn(colIndex + 1).width || 10;
          const estimatedLines = Math.ceil(text.length / columnWidth);
          maxLines = Math.max(maxLines, estimatedLines);
        }
      });

      row.height = maxLines * 15;
    });
  }

  return await workbook.xlsx.writeBuffer();
};

export const departmentJobsReport = async (worksheets, datetime) => {
  const workbook = new ExcelJS.Workbook();

  for (const {
    records,
    department,
    previousJobCount,
    changesJobCount,
    currentJobCount
  } of worksheets) {
    const worksheet = workbook.addWorksheet(department.name);

    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = 'Додаток 1 до розпорядження';
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell('A1').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A2:G2');
    worksheet.getCell('A2').value = 'ЗВІТ';
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A2').font = { name: 'Times New Roman', size: 14, bold: true };

    worksheet.mergeCells('A3:G3');
    worksheet.getCell('A3').value = 'про надання послуг з програмно-технологічного супроводу';
    worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A3').font = { name: 'Times New Roman', size: 14, bold: true };

    worksheet.mergeCells('A4:G4');
    worksheet.getCell('A4').value =
      'інформаційних систем та АРМів для регіональної філії  "Донецька залізниця" та інших філій';
    worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A4').font = { name: 'Times New Roman', size: 14, bold: true };

    worksheet.mergeCells('A5:G5');
    worksheet.getCell('A5').value = `відділом ${department.name} за ${dateToMonthStr(datetime)}`;
    worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A5').font = { name: 'Times New Roman', size: 14, bold: true };

    const headers = [
      { header: '№ роботи', key: 'code', width: 10 },
      { header: 'Назва системи', key: 'name', width: 45 },
      { header: 'Служба (філія)', key: 'branch', width: 20 },
      { header: 'Структурний підрозділ', key: 'subdivision', width: 25 },
      {
        header: 'Кількість робочих місць (робіт) - попередній місяць',
        key: 'previousJobCount',
        width: 15
      },
      {
        header: 'Кількість нових робочих місць (робіт) за теперешній місяць',
        key: 'changesJobCount',
        width: 15
      },
      { header: 'Кількість робочих місць (робіт) всього', key: 'currentJobCount', width: 15 }
    ];

    const hearedRow = worksheet.getRow(7);

    hearedRow.values = headers.map(h => h.header);

    hearedRow.height = 125;

    hearedRow.eachCell(cell => {
      cell.font = { name: 'Times New Roman', size: 12, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    headers.forEach((h, index) => {
      worksheet.getColumn(index + 1).width = h.width;
    });

    const recordsRowStyles = [
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 14 },
        alignment: { vertical: 'middle', horizontal: 'center' }
      },
      {
        font: { name: 'Times New Roman', size: 14 },
        alignment: { vertical: 'middle', horizontal: 'center' }
      },
      {
        font: { name: 'Times New Roman', size: 14 },
        alignment: { vertical: 'middle', horizontal: 'center' }
      }
    ];

    records.forEach((item, index) => {
      const row = worksheet.getRow(8 + index);
      Object.values(item).forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;
        cell.font = recordsRowStyles[colIndex].font;
        cell.alignment = recordsRowStyles[colIndex].alignment;
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    records.forEach((item, index) => {
      const rowIndex = 8 + index;
      const row = worksheet.getRow(rowIndex);

      let maxLines = 1;
      headers.forEach((header, colIndex) => {
        const value = item[header.key];
        if (value) {
          const text = value.toString();
          const columnWidth = worksheet.getColumn(colIndex + 1).width || 10;
          const estimatedLines = Math.ceil(text.length / columnWidth);
          maxLines = Math.max(maxLines, estimatedLines);
        }
      });

      row.height = maxLines * 15;
    });

    worksheet.mergeCells(`A${records.length + 8}:D${records.length + 8}`);
    const titleJobCountCell = worksheet.getCell(`A${records.length + 8}`);
    titleJobCountCell.value = 'Кількість робочих місць:';
    titleJobCountCell.alignment = { vertical: 'middle', horizontal: 'right' };
    titleJobCountCell.font = { name: 'Times New Roman', size: 14 };

    const previousJobCountCell = worksheet.getCell(`E${records.length + 8}`);
    previousJobCountCell.value = previousJobCount;
    previousJobCountCell.alignment = { vertical: 'middle', horizontal: 'center' };
    previousJobCountCell.font = { name: 'Times New Roman', size: 16 };

    const changesJobCountCell = worksheet.getCell(`F${records.length + 8}`);
    changesJobCountCell.value = changesJobCount;
    changesJobCountCell.alignment = { vertical: 'middle', horizontal: 'center' };
    changesJobCountCell.font = { name: 'Times New Roman', size: 16 };

    const currentJobCountCell = worksheet.getCell(`G${records.length + 8}`);
    currentJobCountCell.value = currentJobCount;
    currentJobCountCell.alignment = { vertical: 'middle', horizontal: 'center' };
    currentJobCountCell.font = { name: 'Times New Roman', size: 16 };

    worksheet.mergeCells(`A${records.length + 12}:G${records.length + 12}`);
    const footerCell = worksheet.getCell(`A${records.length + 12}`);
    footerCell.value = `Начальник відділу  ${department.name}________________${department.manager}`;
    footerCell.alignment = { vertical: 'middle', horizontal: 'center' };
    footerCell.font = { name: 'Times New Roman', size: 14 };
  }

  return await workbook.xlsx.writeBuffer();
};

export const subdivisionJobsReport = async (reports, datetime) => {
  const workbook = new ExcelJS.Workbook();

  for (const { subdivision, data } of reports) {
    const worksheet = workbook.addWorksheet(subdivision.name);

    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = 'Перелік';
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A1').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value =
      'здавання-приймання послуг, які надаються виробничим підрозділом "Східне відділення" філії "ГІОЦ" АТ "Укрзалізниця"';
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A2').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A3:E3');
    worksheet.getCell('A3').value = `для ${subdivision.description}`;
    worksheet.getCell('A3').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    worksheet.getCell('A3').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A4:E4');
    worksheet.getCell('A4').value = '';
    worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A4').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A5:E5');
    worksheet.getCell('A5').value = `за період ${dateToMonthPeriodStr(datetime)}`;
    worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A5').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A6:E6');
    worksheet.getCell('A6').value = '';
    worksheet.getCell('A6').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A6').font = { name: 'Times New Roman', size: 14 };

    const headers = [
      { header: '№ роботи', key: 'code', width: 15 },
      { header: 'Назва системи', key: 'name', width: 70 },
      { header: 'Структурний підрозділ', key: 'subdivision', width: 25 },
      { header: 'Кількість робочих місць (робіт)', key: 'totalJobCount', width: 15 },
      { header: 'Відповідальна особа', key: 'department.name', width: 40 }
    ];

    const hearedRow = worksheet.getRow(8);
    hearedRow.values = headers.map(h => h.header);
    hearedRow.height = 100;
    hearedRow.eachCell(cell => {
      cell.font = { name: 'Times New Roman', size: 12, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    headers.forEach((h, index) => {
      worksheet.getColumn(index + 1).width = h.width;
    });

    const recordsRowStyles = [
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center' }
      }
    ];

    data.forEach((item, index) => {
      const row = worksheet.getRow(9 + index);
      Object.values(item).forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;
        cell.font = recordsRowStyles[colIndex].font;
        cell.alignment = recordsRowStyles[colIndex].alignment;
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    data.forEach((item, index) => {
      const rowIndex = 9 + index;
      const row = worksheet.getRow(rowIndex);

      let maxLines = 1;
      headers.forEach((header, colIndex) => {
        const value = item[header.key];
        if (value) {
          const text = value.toString();
          const columnWidth = worksheet.getColumn(colIndex + 1).width || 10;
          const estimatedLines = Math.ceil(text.length / columnWidth);
          maxLines = Math.max(maxLines, estimatedLines);
        }
      });

      row.height = maxLines * 15;
    });

    worksheet.mergeCells(`A${data.length + 12}:B${data.length + 12}`);
    worksheet.getCell(`A${data.length + 12}`).value = 'Від виконавця:';
    worksheet.getCell(`A${data.length + 12}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 12}`).font = {
      name: 'Times New Roman',
      size: 12,
      bold: true
    };

    worksheet.mergeCells(`A${data.length + 14}:B${data.length + 14}`);
    worksheet.getCell(`A${data.length + 14}`).value =
      'Начальник виробничого підрозділу «Східне відділення»';
    worksheet.getCell(`A${data.length + 14}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 14}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 15}:B${data.length + 15}`);
    worksheet.getCell(`A${data.length + 15}`).value =
      'філії «Головний інформаційно-обчислювальний центр»';
    worksheet.getCell(`A${data.length + 15}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 15}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 16}:B${data.length + 16}`);
    worksheet.getCell(`A${data.length + 16}`).value =
      'Акціонерного товариства «Українська залізниця»';
    worksheet.getCell(`A${data.length + 16}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 16}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 18}:B${data.length + 18}`);
    worksheet.getCell(`A${data.length + 18}`).value =
      '______________________________' + 'Михайло ІВЛЕВ';
    worksheet.getCell(`A${data.length + 18}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 18}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`A${data.length + 19}:B${data.length + 19}`).value = 'м.п.';
    worksheet.getCell(`A${data.length + 19}:B${data.length + 19}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`A${data.length + 19}:B${data.length + 19}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.mergeCells(`A${data.length + 21}:B${data.length + 21}`);
    worksheet.getCell(`A${data.length + 21}`).value =
      'Голоний інженер виробничого підрозділу «Східне відділення»';
    worksheet.getCell(`A${data.length + 21}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 21}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 22}:B${data.length + 22}`);
    worksheet.getCell(`A${data.length + 22}`).value =
      'філії «Головний інформаційно-обчислювальний центр»';
    worksheet.getCell(`A${data.length + 22}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 22}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 23}:B${data.length + 23}`);
    worksheet.getCell(`A${data.length + 23}`).value =
      'Акціонерного товариства «Українська залізниця»';
    worksheet.getCell(`A${data.length + 23}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 23}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 25}:B${data.length + 25}`);
    worksheet.getCell(`A${data.length + 25}`).value =
      '______________________________' + 'Дмитро ВЕРЕМКОВИЧ';
    worksheet.getCell(`A${data.length + 25}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 25}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`A${data.length + 26}:B${data.length + 26}`).value = 'м.п.';
    worksheet.getCell(`A${data.length + 26}:B${data.length + 26}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`A${data.length + 26}:B${data.length + 26}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.mergeCells(`D${data.length + 12}:E${data.length + 12}`);
    worksheet.getCell(`D${data.length + 12}`).value = 'Від замовника:';
    worksheet.getCell(`D${data.length + 12}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`D${data.length + 12}`).font = {
      name: 'Times New Roman',
      size: 12,
      bold: true
    };

    worksheet.mergeCells(`D${data.length + 18}:E${data.length + 18}`);
    worksheet.getCell(`D${data.length + 18}`).value = '______________________________';
    worksheet.getCell(`D${data.length + 18}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 18}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`D${data.length + 19}`).value = 'м.п.';
    worksheet.getCell(`D${data.length + 19}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`D${data.length + 19}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    const cellBranchName = worksheet.getCell('A3');
    const rowBranchName = worksheet.getRow(3);
    rowBranchName.height = calculateRowHeight(cellBranchName.value, 165) * 16;
  }

  return await workbook.xlsx.writeBuffer();
};

export const subdivisionJobsReportPrice = async (reports, datetime) => {
  const workbook = new ExcelJS.Workbook();

  for (const { subdivision, totalPrice, data } of reports) {
    const worksheet = workbook.addWorksheet(subdivision.name);

    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'АКТ';
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A1').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value =
      'здавання-приймання послуг, які надаються виробничим підрозділом "Східне відділення" філії "ГІОЦ" АТ "Укрзалізниця"';
    worksheet.getCell('A2').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    worksheet.getCell('A2').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A3:F3');
    worksheet.getCell('A3').value = `для ${subdivision.description}`;
    worksheet.getCell('A3').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    worksheet.getCell('A3').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A4:F4');
    worksheet.getCell('A4').value = '';
    worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A4').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A5:F5');
    worksheet.getCell('A5').value = `за період ${dateToMonthPeriodStr(datetime)}`;
    worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A5').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A6:F6');
    worksheet.getCell('A6').value = '';
    worksheet.getCell('A6').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A6').font = { name: 'Times New Roman', size: 14 };

    const headers = [
      { header: '№ роботи', key: 'code', width: 15 },
      { header: 'Назва системи', key: 'name', width: 70 },
      { header: 'Структурний підрозділ', key: 'subdivision', width: 25 },
      {
        header: 'Кількість робочих місць (робіт)',
        key: 'totalJobCount',
        width: 15
      },
      {
        header: 'Вартість робочого місця (роботи), грн.',
        key: 'price',
        width: 15
      },
      {
        header: 'Сума по підрозділах, грн.',
        key: 'totalPrice',
        width: 15
      }
    ];

    worksheet.getRow(8).values = headers.map(h => h.header);

    worksheet.getRow(8).height = 100;

    worksheet.getRow(8).eachCell(cell => {
      cell.font = { name: 'Times New Roman', size: 12, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    headers.forEach((h, index) => {
      worksheet.getColumn(index + 1).width = h.width;
    });

    const rowStyles = [
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center' }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center' }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center' }
      }
    ];

    data.forEach((item, index) => {
      const row = worksheet.getRow(9 + index);
      Object.values(item).forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;
        cell.font = rowStyles[colIndex].font;
        cell.alignment = rowStyles[colIndex].alignment;
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    data.forEach((item, index) => {
      const rowIndex = 9 + index;
      const row = worksheet.getRow(rowIndex);

      let maxLines = 1;
      headers.forEach((header, colIndex) => {
        const value = item[header.key];
        if (value) {
          const text = value.toString();
          const columnWidth = worksheet.getColumn(colIndex + 1).width || 10;
          const estimatedLines = Math.ceil(text.length / columnWidth);
          maxLines = Math.max(maxLines, estimatedLines);
        }
      });

      row.height = maxLines * 15;
    });

    worksheet.getCell(`F${data.length + 9}`).value = totalPrice;
    worksheet.getCell(`F${data.length + 9}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`F${data.length + 9}`).font = {
      name: 'Times New Roman',
      size: 14,
      bold: true
    };

    worksheet.getCell(`B${data.length + 10}`).value = 'Вартість послуг';
    worksheet.getCell(`B${data.length + 10}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`B${data.length + 10}`).font = {
      name: 'Times New Roman',
      size: 14,
      bold: true
    };

    worksheet.getCell(`C${data.length + 10}`).value = `${totalPrice} - грн.`;
    worksheet.getCell(`C${data.length + 10}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`C${data.length + 10}`).font = {
      name: 'Times New Roman',
      size: 12,
      bold: true
    };

    worksheet.mergeCells(`A${data.length + 12}:B${data.length + 12}`);
    worksheet.getCell(`A${data.length + 12}`).value = 'Від виконавця:';
    worksheet.getCell(`A${data.length + 12}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 12}`).font = {
      name: 'Times New Roman',
      size: 12,
      bold: true
    };

    worksheet.mergeCells(`A${data.length + 14}:B${data.length + 14}`);
    worksheet.getCell(`A${data.length + 14}`).value =
      'Начальник виробничого підрозділу «Східне відділення»';
    worksheet.getCell(`A${data.length + 14}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 14}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 15}:B${data.length + 15}`);
    worksheet.getCell(`A${data.length + 15}`).value =
      'філії «Головний інформаційно-обчислювальний центр»';
    worksheet.getCell(`A${data.length + 15}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 15}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 16}:B${data.length + 16}`);
    worksheet.getCell(`A${data.length + 16}`).value =
      'Акціонерного товариства «Українська залізниця»';
    worksheet.getCell(`A${data.length + 16}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 16}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 18}:B${data.length + 18}`);
    worksheet.getCell(`A${data.length + 18}`).value =
      '______________________________' + 'Михайло ІВЛЕВ';
    worksheet.getCell(`A${data.length + 18}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 18}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`A${data.length + 19}:B${data.length + 19}`).value = 'м.п.';
    worksheet.getCell(`A${data.length + 19}:B${data.length + 19}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`A${data.length + 19}:B${data.length + 19}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.mergeCells(`A${data.length + 21}:B${data.length + 21}`);
    worksheet.getCell(`A${data.length + 21}`).value =
      'Голоний інженер виробничого підрозділу «Східне відділення»';
    worksheet.getCell(`A${data.length + 21}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 21}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 22}:B${data.length + 22}`);
    worksheet.getCell(`A${data.length + 22}`).value =
      'філії «Головний інформаційно-обчислювальний центр»';
    worksheet.getCell(`A${data.length + 22}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 22}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 23}:B${data.length + 23}`);
    worksheet.getCell(`A${data.length + 23}`).value =
      'Акціонерного товариства «Українська залізниця»';
    worksheet.getCell(`A${data.length + 23}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 23}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 25}:B${data.length + 25}`);
    worksheet.getCell(`A${data.length + 25}`).value =
      '______________________________' + 'Дмитро ВЕРЕМКОВИЧ';
    worksheet.getCell(`A${data.length + 25}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 25}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`A${data.length + 26}:B${data.length + 26}`).value = 'м.п.';
    worksheet.getCell(`A${data.length + 26}:B${data.length + 26}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`A${data.length + 26}:B${data.length + 26}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.mergeCells(`D${data.length + 12}:F${data.length + 12}`);
    worksheet.getCell(`D${data.length + 12}`).value = 'Від замовника:';
    worksheet.getCell(`D${data.length + 12}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`D${data.length + 12}`).font = {
      name: 'Times New Roman',
      size: 12,
      bold: true
    };

    worksheet.mergeCells(`D${data.length + 18}:F${data.length + 18}`);
    worksheet.getCell(`D${data.length + 18}`).value = '______________________________';
    worksheet.getCell(`D${data.length + 18}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 18}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`D${data.length + 19}`).value = 'м.п.';
    worksheet.getCell(`D${data.length + 19}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`D${data.length + 19}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    const cellBranchName = worksheet.getCell('A3');
    const rowBranchName = worksheet.getRow(3);
    rowBranchName.height = calculateRowHeight(cellBranchName.value, 155) * 16;
  }

  return await workbook.xlsx.writeBuffer();
};

export const branchJobsReport = async (reports, datetime) => {
  const workbook = new ExcelJS.Workbook();

  for (const { branch, data } of reports) {
    const worksheet = workbook.addWorksheet(branch.name);

    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = 'Перелік';
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A1').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value =
      'здавання-приймання послуг, які надаються виробничим підрозділом "Східне відділення" філії "ГІОЦ" АТ "Укрзалізниця"';
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A2').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A3:E3');
    worksheet.getCell('A3').value = `для ${branch.description}`;
    worksheet.getCell('A3').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    worksheet.getCell('A3').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A4:E4');
    worksheet.getCell('A4').value = '';
    worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A4').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A5:E5');
    worksheet.getCell('A5').value = `за період ${dateToMonthPeriodStr(datetime)}`;
    worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A5').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A6:E6');
    worksheet.getCell('A6').value = '';
    worksheet.getCell('A6').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A6').font = { name: 'Times New Roman', size: 14 };

    const headers = [
      { header: '№ роботи', key: 'code', width: 15 },
      { header: 'Назва системи', key: 'name', width: 70 },
      { header: 'Структурний підрозділ', key: 'subdivision', width: 25 },
      {
        header: 'Кількість робочих місць (робіт)',
        key: 'totalJobCount',
        width: 15
      },
      {
        header: 'Відповідальна особа',
        key: 'department.name',
        width: 40
      }
    ];

    worksheet.getRow(8).values = headers.map(h => h.header);

    worksheet.getRow(8).height = 100;

    worksheet.getRow(8).eachCell(cell => {
      cell.font = { name: 'Times New Roman', size: 12, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    headers.forEach((h, index) => {
      worksheet.getColumn(index + 1).width = h.width;
    });

    const rowStyles = [
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center' }
      }
    ];

    data.forEach((item, index) => {
      const row = worksheet.getRow(9 + index);
      Object.values(item).forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;
        cell.font = rowStyles[colIndex].font;
        cell.alignment = rowStyles[colIndex].alignment;
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    data.forEach((item, index) => {
      const rowIndex = 9 + index;
      const row = worksheet.getRow(rowIndex);

      let maxLines = 1;
      headers.forEach((header, colIndex) => {
        const value = item[header.key];
        if (value) {
          const text = value.toString();
          const columnWidth = worksheet.getColumn(colIndex + 1).width || 10;
          const estimatedLines = Math.ceil(text.length / columnWidth);
          maxLines = Math.max(maxLines, estimatedLines);
        }
      });

      row.height = maxLines * 15;
    });

    worksheet.mergeCells(`A${data.length + 12}:B${data.length + 12}`);
    worksheet.getCell(`A${data.length + 12}`).value = 'Від виконавця:';
    worksheet.getCell(`A${data.length + 12}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 12}`).font = {
      name: 'Times New Roman',
      size: 12,
      bold: true
    };

    worksheet.mergeCells(`A${data.length + 14}:B${data.length + 14}`);
    worksheet.getCell(`A${data.length + 14}`).value =
      'Начальник виробничого підрозділу «Східне відділення»';
    worksheet.getCell(`A${data.length + 14}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 14}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 15}:B${data.length + 15}`);
    worksheet.getCell(`A${data.length + 15}`).value =
      'філії «Головний інформаційно-обчислювальний центр»';
    worksheet.getCell(`A${data.length + 15}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 15}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 16}:B${data.length + 16}`);
    worksheet.getCell(`A${data.length + 16}`).value =
      'Акціонерного товариства «Українська залізниця»';
    worksheet.getCell(`A${data.length + 16}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 16}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 18}:B${data.length + 18}`);
    worksheet.getCell(`A${data.length + 18}`).value =
      '______________________________' + 'Михайло ІВЛЕВ';
    worksheet.getCell(`A${data.length + 18}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 18}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`A${data.length + 19}:B${data.length + 19}`).value = 'м.п.';
    worksheet.getCell(`A${data.length + 19}:B${data.length + 19}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`A${data.length + 19}:B${data.length + 19}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.mergeCells(`A${data.length + 21}:B${data.length + 21}`);
    worksheet.getCell(`A${data.length + 21}`).value =
      'Голоний інженер виробничого підрозділу «Східне відділення»';
    worksheet.getCell(`A${data.length + 21}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 21}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 22}:B${data.length + 22}`);
    worksheet.getCell(`A${data.length + 22}`).value =
      'філії «Головний інформаційно-обчислювальний центр»';
    worksheet.getCell(`A${data.length + 22}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 22}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 23}:B${data.length + 23}`);
    worksheet.getCell(`A${data.length + 23}`).value =
      'Акціонерного товариства «Українська залізниця»';
    worksheet.getCell(`A${data.length + 23}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 23}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 25}:B${data.length + 25}`);
    worksheet.getCell(`A${data.length + 25}`).value =
      '______________________________' + 'Дмитро ВЕРЕМКОВИЧ';
    worksheet.getCell(`A${data.length + 25}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 25}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`A${data.length + 26}:B${data.length + 26}`).value = 'м.п.';
    worksheet.getCell(`A${data.length + 26}:B${data.length + 26}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`A${data.length + 26}:B${data.length + 26}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.mergeCells(`D${data.length + 12}:E${data.length + 12}`);
    worksheet.getCell(`D${data.length + 12}`).value = 'Від замовника:';
    worksheet.getCell(`D${data.length + 12}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`D${data.length + 12}`).font = {
      name: 'Times New Roman',
      size: 12,
      bold: true
    };

    worksheet.mergeCells(`D${data.length + 18}:E${data.length + 18}`);
    worksheet.getCell(`D${data.length + 18}`).value = '______________________________';
    worksheet.getCell(`D${data.length + 18}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 18}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`D${data.length + 19}`).value = 'м.п.';
    worksheet.getCell(`D${data.length + 19}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`D${data.length + 19}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    const cellBranchName = worksheet.getCell('A3');
    const rowBranchName = worksheet.getRow(3);
    rowBranchName.height = calculateRowHeight(cellBranchName.value, 165) * 16;
  }

  return await workbook.xlsx.writeBuffer();
};

export const branchJobsReportPrice = async (reports, datetime) => {
  const workbook = new ExcelJS.Workbook();

  for (const { branch, totalPrice, data } of reports) {
    const worksheet = workbook.addWorksheet(branch.name);

    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = '  АКТ';
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A1').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value =
      'здавання-приймання послуг, які надаються виробничим підрозділом "Східне відділення" філії "ГІОЦ" АТ "Укрзалізниця"';
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A2').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A3:F3');
    worksheet.getCell('A3').value = `для ${branch.description}`;
    worksheet.getCell('A3').alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    worksheet.getCell('A3').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A4:F4');
    worksheet.getCell('A4').value = '';
    worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A4').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A5:F5');
    worksheet.getCell('A5').value = `за період ${dateToMonthPeriodStr(datetime)}`;
    worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A5').font = { name: 'Times New Roman', size: 14 };

    worksheet.mergeCells('A6:F6');
    worksheet.getCell('A6').value = '';
    worksheet.getCell('A6').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A6').font = { name: 'Times New Roman', size: 14 };

    const headers = [
      { header: '№ роботи', key: 'code', width: 15 },
      { header: 'Назва системи', key: 'name', width: 70 },
      { header: 'Структурний підрозділ', key: 'subdivision', width: 25 },
      {
        header: 'Кількість робочих місць (робіт)',
        key: 'totalJobCount',
        width: 15
      },
      {
        header: 'Вартість робочого місця (роботи), грн.',
        key: 'price',
        width: 15
      },
      {
        header: 'Сума по підрозділах, грн.',
        key: 'totalPrice',
        width: 15
      }
    ];

    worksheet.getRow(8).values = headers.map(h => h.header);

    worksheet.getRow(8).height = 100;

    worksheet.getRow(8).eachCell(cell => {
      cell.font = { name: 'Times New Roman', size: 12, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    headers.forEach((h, index) => {
      worksheet.getColumn(index + 1).width = h.width;
    });

    const rowStyles = [
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center' }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center' }
      },
      {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center' }
      }
    ];

    data.forEach((item, index) => {
      const row = worksheet.getRow(9 + index);
      Object.values(item).forEach((value, colIndex) => {
        const cell = row.getCell(colIndex + 1);
        cell.value = value;
        cell.font = rowStyles[colIndex].font;
        cell.alignment = rowStyles[colIndex].alignment;
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    data.forEach((item, index) => {
      const rowIndex = 9 + index;
      const row = worksheet.getRow(rowIndex);

      let maxLines = 1;
      headers.forEach((header, colIndex) => {
        const value = item[header.key];
        if (value) {
          const text = value.toString();
          const columnWidth = worksheet.getColumn(colIndex + 1).width || 10;
          const estimatedLines = Math.ceil(text.length / columnWidth);
          maxLines = Math.max(maxLines, estimatedLines);
        }
      });

      row.height = maxLines * 15;
    });

    worksheet.getCell(`F${data.length + 9}`).value = totalPrice;
    worksheet.getCell(`F${data.length + 9}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`F${data.length + 9}`).font = {
      name: 'Times New Roman',
      size: 14,
      bold: true
    };

    worksheet.getCell(`B${data.length + 10}`).value = 'Вартість послуг';
    worksheet.getCell(`B${data.length + 10}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`B${data.length + 10}`).font = {
      name: 'Times New Roman',
      size: 14,
      bold: true
    };

    worksheet.getCell(`C${data.length + 10}`).value = `${totalPrice} - грн.`;
    worksheet.getCell(`C${data.length + 10}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`C${data.length + 10}`).font = {
      name: 'Times New Roman',
      size: 12,
      bold: true
    };

    worksheet.mergeCells(`A${data.length + 12}:B${data.length + 12}`);
    worksheet.getCell(`A${data.length + 12}`).value = 'Від виконавця:';
    worksheet.getCell(`A${data.length + 12}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 12}`).font = {
      name: 'Times New Roman',
      size: 12,
      bold: true
    };

    worksheet.mergeCells(`A${data.length + 14}:B${data.length + 14}`);
    worksheet.getCell(`A${data.length + 14}`).value =
      'Начальник виробничого підрозділу «Східне відділення»';
    worksheet.getCell(`A${data.length + 14}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 14}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 15}:B${data.length + 15}`);
    worksheet.getCell(`A${data.length + 15}`).value =
      'філії «Головний інформаційно-обчислювальний центр»';
    worksheet.getCell(`A${data.length + 15}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 15}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 16}:B${data.length + 16}`);
    worksheet.getCell(`A${data.length + 16}`).value =
      'Акціонерного товариства «Українська залізниця»';
    worksheet.getCell(`A${data.length + 16}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 16}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 18}:B${data.length + 18}`);
    worksheet.getCell(`A${data.length + 18}`).value =
      '______________________________' + 'Михайло ІВЛЕВ';
    worksheet.getCell(`A${data.length + 18}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 18}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`A${data.length + 19}:B${data.length + 19}`).value = 'м.п.';
    worksheet.getCell(`A${data.length + 19}:B${data.length + 19}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`A${data.length + 19}:B${data.length + 19}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.mergeCells(`A${data.length + 21}:B${data.length + 21}`);
    worksheet.getCell(`A${data.length + 21}`).value =
      'Голоний інженер виробничого підрозділу «Східне відділення»';
    worksheet.getCell(`A${data.length + 21}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 21}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 22}:B${data.length + 22}`);
    worksheet.getCell(`A${data.length + 22}`).value =
      'філії «Головний інформаційно-обчислювальний центр»';
    worksheet.getCell(`A${data.length + 22}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 22}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 23}:B${data.length + 23}`);
    worksheet.getCell(`A${data.length + 23}`).value =
      'Акціонерного товариства «Українська залізниця»';
    worksheet.getCell(`A${data.length + 23}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 23}`).font = { name: 'Times New Roman', size: 12 };

    worksheet.mergeCells(`A${data.length + 25}:B${data.length + 25}`);
    worksheet.getCell(`A${data.length + 25}`).value =
      '______________________________' + 'Дмитро ВЕРЕМКОВИЧ';
    worksheet.getCell(`A${data.length + 25}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 25}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`A${data.length + 26}:B${data.length + 26}`).value = 'м.п.';
    worksheet.getCell(`A${data.length + 26}:B${data.length + 26}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`A${data.length + 26}:B${data.length + 26}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.mergeCells(`D${data.length + 12}:F${data.length + 12}`);
    worksheet.getCell(`D${data.length + 12}`).value = 'Від замовника:';
    worksheet.getCell(`D${data.length + 12}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`D${data.length + 12}`).font = {
      name: 'Times New Roman',
      size: 12,
      bold: true
    };

    worksheet.mergeCells(`D${data.length + 18}:F${data.length + 18}`);
    worksheet.getCell(`D${data.length + 18}`).value = '______________________________';
    worksheet.getCell(`D${data.length + 18}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 18}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`D${data.length + 19}`).value = 'м.п.';
    worksheet.getCell(`D${data.length + 19}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`D${data.length + 19}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    const cellBranchName = worksheet.getCell('A3');
    const rowBranchName = worksheet.getRow(3);
    rowBranchName.height = calculateRowHeight(cellBranchName.value, 155) * 16;
  }

  return await workbook.xlsx.writeBuffer();
};
