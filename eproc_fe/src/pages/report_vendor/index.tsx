import { useEffect, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import moment from "moment";
import * as XLSX from "xlsx";
import MainVendor from "@/vendor-layouts/main";
import DataTable from "@/components/Datatables";
import { ColumnDef } from "@tanstack/react-table";

export type IVendorRFQReport = {
  number: number;
  part_number: string;
  part_name: string;
  price: number;
  moq: number;
  valid_until: string | null;
  status?: string;
};

export default function ReportVendorRFQPage() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [tableData, setTableData] = useState<IVendorRFQReport[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");

  useEffect(() => {
    const id = Cookies.get("vendor_id");
    console.log("Vendor ID from cookie:", id); // debug
    setVendorId(id || null);
  }, []);

  // Function to transform and filter data
  const transformData = (data: IVendorRFQReport[], search: string) => {
    const now = moment();
    const searchLower = search.toLowerCase();

    const filtered = data
      .map((item) => {
        const status =
          item.valid_until && moment(item.valid_until).isAfter(now)
            ? "Valid"
            : "Expired";
        return { ...item, status };
      })
      .filter((item) =>
        (statusFilter === "all" ? true : item.status === statusFilter) &&
        (
          item.part_number?.toLowerCase().includes(searchLower) ||
          item.part_name?.toLowerCase().includes(searchLower)
        )
      );

    return filtered;
  };

  // Memoized transform function to prevent unnecessary re-renders
  const additionalTransform = useCallback((data: IVendorRFQReport[], search: string) => {
    const filtered = transformData(data, search);

    // Update tableData for Excel export (this won't cause re-render of DataTable)
    setTableData(filtered);

    console.log("🔍 Final data to display:", filtered); // debug
    return filtered;
  }, [statusFilter]); // Only recreate when statusFilter changes

  const columns: ColumnDef<IVendorRFQReport>[] = [
    { accessorKey: "number", header: "#", cell: (info) => info.getValue() },
    { accessorKey: "part_number", header: "Part Number" },
    { accessorKey: "part_name", header: "Description" },
    {
      accessorKey: "price",
      header: "Price",
      cell: (info) =>
        `Rp ${Number(info.getValue()).toLocaleString("id-ID", {
          maximumFractionDigits: 0,
        })}`,
    },
    { accessorKey: "moq", header: "MOQ" },
    {
      accessorKey: "valid_until",
      header: "Valid Until",
      cell: (info) =>
        info.getValue()
          ? moment(info.getValue() as string).format("YYYY-MM-DD")
          : "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as string;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${status === "Valid"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  const downloadExcel = async () => {
    try {
      setIsExporting(true);

      // Use the current filtered data for export
      if (tableData.length === 0) {
        alert("No data available to export");
        return;
      }

      // Prepare data for Excel export with formatted price
      const excelData = tableData.map((item, index) => ({
        "#": index + 1,
        "Part Number": item.part_number,
        "Description": item.part_name,
        "Price (IDR)": `Rp ${Number(item.price).toLocaleString("id-ID", {
          maximumFractionDigits: 0,
        })}`,
        "MOQ": item.moq,
        "Valid Until": item.valid_until
          ? moment(item.valid_until).format("YYYY-MM-DD")
          : "-",
        "Status": item.status || "N/A"
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 5 },   // #
        { wch: 15 },  // Part Number
        { wch: 30 },  // Description
        { wch: 18 },  // Price (wider for Rp format)
        { wch: 10 },  // MOQ
        { wch: 12 },  // Valid Until
        { wch: 10 }   // Status
      ];
      ws['!cols'] = colWidths;

      // Style headers with bold formatting
      const headers = ["#", "Part Number", "Description", "Price (IDR)", "MOQ", "Valid Until", "Status"];
      const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'];

      // Apply bold styling to headers
      headerCells.forEach((cellAddress, index) => {
        if (!ws[cellAddress]) ws[cellAddress] = {}; // Ensure the cell exists
        if (!ws[cellAddress].s) ws[cellAddress].s = {}; // Ensure the style object exists
        ws[cellAddress].s.font = { bold: true }; // Apply bold font style to the header
      });


      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "RFQ Report");

      // Generate filename with current date
      const currentDate = moment().format("YYYY-MM-DD");
      const filename = `Vendor_RFQ_Report_${currentDate}.xlsx`;

      // Write and download file
      XLSX.writeFile(wb, filename);

      console.log(`Excel file downloaded: ${filename}`);
    } catch (error) {
      console.error("Error downloading Excel file:", error);
      alert("Failed to download Excel file. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!vendorId) return <div className="p-6">Loading vendor data...</div>;

  return (
    <MainVendor>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">My Submitted Quotations</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Status:</label>
              <select
                className="border p-2 rounded-md text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="Valid">Valid</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <button
              onClick={downloadExcel}
              disabled={isExporting || tableData.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Excel
                </>
              )}
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          url={`${process.env.NEXT_PUBLIC_API_URL}/api/report/vendor?vendor_id=${vendorId}`}
          isRefetch={false}
          additionalTransform={additionalTransform}
        />
      </div>
    </MainVendor>
  );
}