import React, { useState } from "react";
import "./App.css";
import * as XLSX from "xlsx";

function CalculationPage({ result }) {
  if (!Array.isArray(result)) {
    return null; // Return null if the result is not an array
  }

  const columnNames = {
    0: "№",
    1: "Показатели",
    2: "Ед.изм.",
    3: "Итого",
    4: "2023",
    5: "2024",
    6: "2025",
  };

  const rowNames = {
    0: "Срок отработки",
    1: "Товарная руда",
    2: "Медь содержание",
    3: "Медь в руде",
    4: "Серебро содержание",
    5: "Серебро в руде",
  };

  const Unit = {
    0: "год",
    1: "тыс.т",
    2: "%",
    3: "т",
    4: "г/т",
    5: "кг",
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = [
      Object.values(columnNames),
      ...result.map((row, index) => [
        row.number,
        rowNames[index],
        Unit[index],
        row.multiplication,
        row.division,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Calculation Result");
    const wbout = XLSX.write(wb, { type: "binary", bookType: "xlsx" });

    const fileName = "calculation_result.xlsx";
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(
      new Blob([s2ab(wbout)], { type: "application/octet-stream" })
    );
    downloadLink.download = fileName;
    downloadLink.click();
  };

  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  return (
    <div>
      <h2>Calculation Result:</h2>
      {result.length > 0 ? (
        <div>
          <table>
            <thead>
              <tr>
                {Object.values(columnNames).map((name) => (
                  <th key={name}>{name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.map((row, index) => (
                <tr key={index}>
                  <td>{row.number}</td>
                  <td>{rowNames[index]}</td>
                  <td>{Unit[index]}</td>
                  <td>{row.multiplication}</td>
                  <td>{row.multiplication}</td>
                  <td>{row.multiplication}</td>
                  <td>{row.division}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={exportToExcel}>Download Excel</button>
        </div>
      ) : (
        <p>No calculations to display.</p>
      )}
    </div>
  );
}

function App() {
  const [items, setItems] = useState([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [sheetNames, setSheetNames] = useState([]);
  const [result, setResult] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);

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
    setSelectedTab(index);
    setActiveSheet(index);
  };

  const handleCalculation = () => {
    const numRows = Math.min(items[0]?.length || 0, items[1]?.length || 0); 

    const calculationResult = [];

    for (let i = 0; i < numRows; i++) {
      const firstTabValue = items[0]?.[1]?.г2023;
      const secondTabValue = items[1]?.[1]?.г2023;

      if (firstTabValue !== undefined && secondTabValue !== undefined) {
        const rowResult = {
          number: ` ${i + 1}`,
          addition: firstTabValue + secondTabValue,
          multiplication: firstTabValue * secondTabValue,
          division: firstTabValue / secondTabValue,
        };

        calculationResult.push(rowResult);
      } else {
        console.log("Invalid items array or properties");
      }
    }

    setResult(calculationResult);

    setActiveSheet(2);
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
        <button
          key={name}
          onClick={() => handleSheetButtonClick(index)}
          className={index === selectedTab ? "active" : ""}
        >
          {name}
        </button>
      ))}
      <table className="table container">
        <thead>
          <tr>
            {items[activeSheet] &&
              items[activeSheet].length > 0 && // Check if items[activeSheet] is defined
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
              {Object.keys(items[activeSheet][0]).map((key, index) => {
                const cellValue = d[key] !== undefined ? d[key] : "";
                return (
                  <td key={index}>
                    {typeof cellValue === "number"
                      ? Number.isInteger(cellValue)
                        ? cellValue
                        : cellValue.toFixed(2)
                      : cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleCalculation}>Perform Calculation</button>
      {activeSheet === 2 && <CalculationPage result={result} />}
    </div>
  );
}

export default App;
