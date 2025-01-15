import ExcelJS from 'exceljs';

import { dateToMonthPeriodStr, dateToMonthStr } from '@/service/DataFilters';

export const monthlyReport = async reports => {
  const workbook = new ExcelJS.Workbook();

  for (const report of reports) {
    const { department, datetime, data } = report;

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

    worksheet.getRow(7).values = headers.map(h => h.header);

    worksheet.getRow(7).height = 125;

    worksheet.getRow(7).eachCell(cell => {
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

    data.forEach((item, index) => {
      const row = worksheet.getRow(8 + index);
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

    worksheet.mergeCells(`A${data.length + 10}:G${data.length + 10}`);
    worksheet.getCell(`A${data.length + 10}`).value =
      `Начальник відділу  ${department.name}________________${department.manager}`;
    worksheet.getCell(`A${data.length + 10}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`A${data.length + 10}`).font = { name: 'Times New Roman', size: 14 };
  }

  return await workbook.xlsx.writeBuffer();
};

export const monthlySubdivisionReport = async (reports, datetime) => {
  const workbook = new ExcelJS.Workbook();

  for (const report of reports) {
    const { branch, subdivision, data } = report;

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
    worksheet.getCell('A3').value =
      `для  структурних підрозділів ${branch.description} АТ "Укрзалізниця"`;
    worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };
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
        header: 'ПІБ Начальника відділу',
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

    worksheet.mergeCells(`A${data.length + 11}:B${data.length + 11}`);
    worksheet.getCell(`A${data.length + 11}`).value = 'Від виконавця:';
    worksheet.getCell(`A${data.length + 11}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 11}`).font = {
      name: 'Times New Roman',
      size: 12,
      bold: true
    };

    worksheet.mergeCells(`C${data.length + 11}:E${data.length + 11}`);
    worksheet.getCell(`C${data.length + 11}`).value = 'Від замовника:';
    worksheet.getCell(`C${data.length + 11}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`C${data.length + 11}`).font = {
      name: 'Times New Roman',
      size: 12,
      bold: true
    };

    worksheet.mergeCells(`A${data.length + 17}:B${data.length + 17}`);
    worksheet.getCell(`A${data.length + 17}`).value = '______________________________';
    worksheet.getCell(`A${data.length + 17}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 17}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`A${data.length + 18}`).value = 'м.п.';
    worksheet.getCell(`A${data.length + 18}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`A${data.length + 18}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.mergeCells(`D${data.length + 17}:E${data.length + 17}`);
    worksheet.getCell(`D${data.length + 17}`).value = '______________________________';
    worksheet.getCell(`D${data.length + 17}`).alignment = {
      vertical: 'middle',
      horizontal: 'left'
    };
    worksheet.getCell(`A${data.length + 17}`).font = {
      name: 'Times New Roman',
      size: 12
    };

    worksheet.getCell(`D${data.length + 18}`).value = 'м.п.';
    worksheet.getCell(`D${data.length + 18}`).alignment = {
      vertical: 'middle',
      horizontal: 'center'
    };
    worksheet.getCell(`D${data.length + 18}`).font = {
      name: 'Times New Roman',
      size: 12
    };
  }

  return await workbook.xlsx.writeBuffer();
};
