import * as XLSX from 'xlsx';

export const exportExcelFile = (listData: any[], fileName: string) => {
  const listColumn = getWorkSheetColumn(listData);
  listData = remakeData(listData, listColumn);
  // const filePath = join(process.cwd(), '/export/');

  const workBook = XLSX.utils.book_new();
  const workSheet = XLSX.utils.json_to_sheet(listData);
  XLSX.utils.book_append_sheet(workBook, workSheet, fileName);
  const buffer = XLSX.write(workBook, {
    bookType: 'xlsx',
    type: 'buffer',
  });

  return buffer;
};

function getWorkSheetColumn(listData: any[]) {
  const listColumn = [];
  for (const data of listData) {
    Object.keys(data).forEach((key) => {
      if (!listColumn.includes(key)) listColumn.push(key);
    });
  }
  return listColumn;
}

function remakeData(listData: any[], listColumn: string[]) {
  return listData.map((data) => {
    const object = {};
    const oldKeys = Object.keys(data);
    for (const key of listColumn) {
      if (oldKeys.includes(key)) object[key] = data[key];
      else object[key] = null;
    }
    return object;
  });
}
