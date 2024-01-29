import * as XLSX from 'xlsx/xlsx';

export const ExcelUpload = (file, response) => {
  const reader = new FileReader();
  reader.addEventListener('load', (event_) => {
    const bstr = event_.target.result;
    const wb = XLSX.read(bstr, { type: 'binary' });
    const dataArray = [];
    // eslint-disable-next-line unicorn/no-array-for-each
    wb.SheetNames.forEach((s) => {
      const ws = wb.Sheets[s];
      const data = XLSX.utils.sheet_to_json(ws, {
        header: 2,
        defval: '',
      });
      dataArray.push(data);
    });
    response(dataArray, file);
  });
  reader.readAsBinaryString(file);
};

export const ExcelDownload = (tableData, fileName) => {
  const columnkeys = Object.keys(tableData[0]);
  const ws = XLSX.utils.json_to_sheet(tableData, { header: columnkeys });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  const arrayBuffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default ExcelDownload;
