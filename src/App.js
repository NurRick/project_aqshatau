import React, { useState } from "react";
import "./App.css";
import * as XLSX from "xlsx";

function App() {
  const [items, setItems] = useState([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [sheetNames, setSheetNames] = useState([]);

  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: "buffer" });

        const wsNames = wb.SheetNames;

        const sheets = wsNames.map((name) => {
          const ws = wb.Sheets[name];
          return XLSX.utils.sheet_to_json(ws);
        });

        setSheetNames(wsNames);
        setItems(sheets);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then(() => {
      setActiveSheet(0);
    });
  };

  const handleSheetButtonClick = (index) => {
    setActiveSheet(index);
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files[0];
          readExcel(file);
        }}
      />
      {sheetNames.map((name, index) => (
        <button key={name} onClick={() => handleSheetButtonClick(index)}>
          {name}
        </button>
      ))}
      <table className="table container">
        <thead>
          <tr>
            {items[activeSheet]?.length > 0 &&
              Object.keys(items[activeSheet][0]).map((key, index) => (
                <th key={index} scope="col">
                  {key}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {items[activeSheet]?.map((d, index) => (
            <tr key={index}>
              {Object.values(d).map((value, index) => (
                <td key={index}>
                  {typeof value === "number" ? value.toFixed(3) : value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
