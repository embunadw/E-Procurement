import Cookies from "js-cookie";
import { useRouter } from "next/router";
import DataTable from "@/components/Datatables";
import { ColumnDef } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import clsx from "clsx";
import MainVendor from "@/vendor-layouts/main";

type IVendorQuotation = {
  rfq_detail_id: number;
  rfq_number: string;
  rfq_title: string;
  rfq_duedate: string;
  is_submitted: boolean;
};

function VendorQuotationPage() {
  const router = useRouter();
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    const storedVendorId = Cookies.get("vendor_id");
    if (!storedVendorId) {
      alert("Vendor ID is required. Please log in again.");
      router.push("/auth/login-vendor");
    } else {
      setVendorId(storedVendorId);
    }
  }, [router]);

  if (!vendorId) {
    return <div>Loading...</div>;
  }

  const params = new URLSearchParams({
    vendor_id: vendorId,
    page: "1",
    limit: "10",
    search: "",
    sort: "",
    order: "",
  }).toString();

  const columns: ColumnDef<IVendorQuotation>[] = [
    {
      accessorKey: "number",
      header: "#",
      cell: (info) => {
        const rowIndex = info.row.index;
        const pageIndex = info.table.options.state.pagination?.pageIndex || 0;
        const pageSize = info.table.options.state.pagination?.pageSize || 10;
        return pageIndex * pageSize + rowIndex + 1;
      },
      enableSorting: false,
      size: 50,
    },
    { accessorKey: "rfq_number", header: "RFQ Number" },
    {
      accessorKey: "rfq_title",
      header: "RFQ Title",
      cell: (info) => info.getValue() || "-",
    },
    {
      accessorKey: "rfq_duedate",
      header: "RFQ Due Date",
      cell: (info) => {
        const dueDate = new Date(info.getValue() as string);
        const now = new Date();
        // Set the time to midnight for comparison
        now.setHours(0, 0, 0, 0);
        const isExpired = dueDate < now;
        return (
          <div className="flex flex-col gap-1">
            <span>{dueDate.toLocaleDateString("en-GB")}</span>
            {isExpired && <span className="text-red-600">Expired</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "is_submitted",
      header: "Is Submitted?",
      cell: (info) =>
        info.getValue() ? (
          <span className="inline-block bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full w-fit font-medium">
            Yes
          </span>
        ) : (
          <span className="inline-block bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full w-fit font-medium">
            No
          </span>
        ),
    },
    {
      accessorKey: "actions",
      header: "Action",
      cell: ({ row }) => {
        const data = row.original;
        const dueDate = new Date(data.rfq_duedate);
        const now = new Date();
        // Set the time to midnight for comparison
        now.setHours(0, 0, 0, 0);
        const isExpired = dueDate < now;

        return (
          <div className="flex flex-col items-center gap-1">
            <div className="flex justify-center items-center space-x-2">
              {data.is_submitted && !isExpired && (
                <button
                  title="Edit Quotation"
                  className={clsx(
                    "btn btn-icon bg-yellow-500 btn-sm text-white",
                    "hover:scale-105 transition duration-200 rounded"
                  )}
                  onClick={() =>
                    router.push(
                      `/vendorquotation/UpdateModal?rfq_detail_id=${data.rfq_detail_id}`
                    )
                  }
                >
                  <i className="ki-outline ki-pencil" />
                </button>
              )}

              {!data.is_submitted && !isExpired && (
                <button
                  title="Submit Quotation"
                  className={clsx(
                    "btn btn-icon bg-blue-500 btn-sm text-white",
                    "hover:scale-105 transition duration-200 rounded"
                  )}
                  onClick={() =>
                    router.push(
                      `/vendorquotation/CreateModal?rfq_detail_id=${data.rfq_detail_id}`
                    )
                  }
                >
                  <i className="ki-outline ki-plus" />
                </button>
              )}
            </div>

            {isExpired && (
              <button
                title="Submit Quotation (Expired)"
                className="inline-block bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium mt-1 cursor-pointer hover:bg-red-200 transition"
                onClick={() =>
                  router.push(  
                    `/vendorquotation/UpdateModal?rfq_detail_id=${data.rfq_detail_id}`
                  )
                }
              >
                Expired
              </button>
            )}
          </div>
        );
      },
    }


  ];

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        RFQ Quotation Submission
      </h1>
      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/vendor-quotation?${params}`}
        isRefetch={undefined}
        additionalTransform={undefined}
      />
    </div>
  );
}

VendorQuotationPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainVendor>{page}</MainVendor>;
};

export default VendorQuotationPage;
