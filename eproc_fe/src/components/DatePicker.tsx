import { useState, useEffect } from "react";
import clsx from "clsx";

const Datepicker = ({ value, onChange }) => {
  const today = new Date();
  const [date, setDate] = useState(value || today);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(date.getMonth() + 1); // Mulai dari 1
  const [selectedYear, setSelectedYear] = useState(date.getFullYear());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 50 },
    (_, i) => today.getFullYear() - 25 + i
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMonth = localStorage.getItem("selectedMonth");
      const savedYear = localStorage.getItem("selectedYear");

      if (savedMonth !== null && savedYear !== null) {
        const monthValue = parseInt(savedMonth, 10);
        const yearValue = parseInt(savedYear, 10);

        setSelectedMonth(monthValue);
        setSelectedYear(yearValue);
        setDate(new Date(yearValue, monthValue - 1, 1));
      }
    }

    // Hapus localStorage saat halaman di-refresh
    const handleBeforeUnload = () => {
      localStorage.removeItem("selectedMonth");
      localStorage.removeItem("selectedYear");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleDateChange = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1, 1); // Sesuai JS
    setDate(newDate);
    setIsOpen(false);

    if (typeof window !== "undefined") {
      localStorage.setItem("selectedMonth", selectedMonth.toString()); // Simpan sebagai 1-12
      localStorage.setItem("selectedYear", selectedYear.toString());

      window.dispatchEvent(new Event("localStorageUpdated"));
    }

    if (onChange) onChange(newDate);
  };

  return (
    <div className="relative inline-block">
      <div className="input-group flex items-center">
        <input
          id="filterDate"
          className="input border rounded px-3 py-2"
          placeholder="Select Month and Year"
          type="text"
          value={`${months[selectedMonth - 1]} ${selectedYear}`} // Ambil dari 1-12
          readOnly
        />
        <span
          className="btn text-white btn-icon bg-blue-500 transition-transform hover:scale-105 active:scale-100 hover:bg-blue-600 p-2 rounded cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className="ki-duotone ki-calendar"></i>
        </span>
      </div>

      {isOpen && (
        <div className="z-10 left-0 bg-gray-200 shadow-lg rounded p-2 flex space-x-1 w-full">
          {/* Dropdown Bulan */}
          <div
            className="dropdown relative w-full"
            data-dropdown="true"
            data-dropdown-trigger="click"
          >
            <button className="dropdown-toggle btn btn-light w-full text-left px-3 py-2">
              {months[selectedMonth - 1]} {/* Indeks dikurangi 1 */}
              <i className="ki-duotone ki-down !text-sm dropdown-open:hidden float-right"></i>
              <i className="ki-duotone ki-up !text-sm hidden dropdown-open:block float-right"></i>
            </button>
            <div
              className="dropdown-content absolute left-0 mt-1 w-auto min-w-max py-2 max-h-60 overflow-y-auto border border-gray-300 shadow-lg bg-white rounded-md"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 transparent",
              }}
            >
              {months.map((month, index) => (
                <div
                  key={index}
                  className={clsx(
                    "cursor-pointer px-3 py-1 hover:bg-gray-200 whitespace-nowrap",
                    selectedMonth === index + 1 && "bg-gray-300" // 🔥 Highlight bulan yang dipilih
                  )}
                  onClick={() => setSelectedMonth(index + 1)} // Simpan 1-12
                >
                  {month}
                </div>
              ))}
            </div>
          </div>

          {/* Dropdown Tahun */}
          <div
            className="dropdown relative w-full"
            data-dropdown="true"
            data-dropdown-trigger="click"
          >
            <button className="dropdown-toggle btn btn-light w-full text-left px-3 py-2">
              {selectedYear}
              <i className="ki-duotone ki-down !text-sm dropdown-open:hidden float-right"></i>
              <i className="ki-duotone ki-up !text-sm hidden dropdown-open:block float-right"></i>
            </button>
            <div
              className="dropdown-content absolute left-0 mt-1 w-auto min-w-max py-2 max-h-60 overflow-y-auto border border-gray-300 shadow-lg bg-white rounded-md"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 transparent",
              }}
            >
              {years.map((year) => (
                <div
                  key={year}
                  className={clsx(
                    "cursor-pointer px-3 py-1 hover:bg-gray-200 whitespace-nowrap",
                    selectedYear === year && "bg-gray-300" // 🔥 Highlight tahun yang dipilih
                  )}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </div>
              ))}
            </div>
          </div>

          {/* Tombol Pilih */}
          <button
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 hover:scale-105 active:scale-100"
            onClick={handleDateChange}
          >
            <i className="ki-solid ki-check-circle"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Datepicker;
