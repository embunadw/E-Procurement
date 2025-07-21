import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import clsx from "clsx";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const DataTable = ({ columns, url, isRefetch, additionalTransform }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [order, setOrder] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const token = Cookies.get("token");

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
    const connector = url.includes("?") ? "&" : "?"; // tambahkan deteksi
const res = await axios.get(
  `${url}${connector}page=${page}&limit=${limit}&search=${search}&sort=${sort}&order=${order}`,

          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const rawData = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.data || [];
        setTotalPages(res.data.data?.totalPages || 1);
        setTotalItems(
          res.data.data?.totalItems ??
          (Array.isArray(res.data.data) ? res.data.data.length : 0)
        );

        const numberedData = rawData.map((item, index: number) => ({
          ...item,
          number: (page - 1) * limit + index + 1,
        }));

     const finalData = additionalTransform
  ? additionalTransform(numberedData, search)
  : numberedData;


        setData(finalData);
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    getData();
  }, [page, limit, search, sort, order, url, isRefetch, token, additionalTransform]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || i === page || i === page - 1 || i === page + 1) {
        pages.push(i);
      } else if (i === page - 2 || i === page + 2) {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="rounded-xl shadow-md p-6 bg-white">
      {/* Search & Limit */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Show:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setSort("");
              setOrder("");
              setPage(1);
            }}
            className="border rounded-md p-2 text-sm text-gray-700"
          >
            {[10, 25, 50, 100, 200].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Search:</label>
          <input
            type="text"
            className="border rounded-md p-2 text-sm text-gray-700"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-50 z-10 flex justify-center items-center">
            <div className="bg-white px-4 py-2 rounded flex items-center gap-2 text-gray-800">
              <i className="ki-outline ki-setting-2 animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        )}
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border p-3 text-sm text-left text-gray-700 font-medium cursor-pointer"
                    onClick={() => {
                      if (!header.column.getCanSort()) return;
                      const sortField = header.column.id === "rfq_number" ? "rfq_id" : header.column.id;
                      setSort(sortField);
                      setOrder(order === "asc" ? "desc" : "asc");
                    }}
                  >
                    <div className="flex items-center justify-between">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <i className={clsx(
                          "ki-outline text-xs",
                          header.column.getIsSorted() === "asc"
                            ? "ki-arrow-up"
                            : header.column.getIsSorted() === "desc"
                            ? "ki-arrow-down"
                            : "ki-arrow-up-down"
                        )}></i>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50 text-sm">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 text-gray-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
        </div>
        <div className="flex gap-1">
          <button disabled={page === 1} onClick={() => setPage(1)} className="btn btn-sm">
            <i className="ki-outline ki-double-left" />
          </button>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn btn-sm">
            <i className="ki-outline ki-left" />
          </button>
          {renderPagination().map((n, idx) => (
            <button
              key={idx}
              className={clsx("btn btn-sm", n === page && "bg-gray-300")}
              onClick={() => typeof n === "number" && setPage(n)}
              disabled={typeof n === "string"}
            >
              {n}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn btn-sm">
            <i className="ki-outline ki-right" />
          </button>
          <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="btn btn-sm">
            <i className="ki-outline ki-double-right" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
