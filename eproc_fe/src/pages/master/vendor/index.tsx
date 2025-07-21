import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import axios from "axios";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

import CreateModal from "./CreateModal";
import UpdateModal from "./UpdateModal";
import DetailModal from "./DetailModal";

// Tipe data vendor sesuai database schema
export type IVendor = {
  vendor_id: number;
  name: string;
  email: string;
  password: string;
  phone_no: string;
  vendor_type: string;
  address: string;
  vendor_code: string;
  country_code: string;
  postal_code: string;
  email_po: string;
};

function VendorPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<IVendor | null>(null);
  const [isRefetch, setIsRefetch] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailData, setSelectedDetailData] = useState<IVendor | null>(null);

  useEffect(() => {
    const token = Cookies.get("token"); // Ganti sesuai nama cookie auth kamu
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserRole(decoded?.role || null);
      } catch (err) {
        console.error("Invalid token");
      }
    }
  }, []);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleOpenUpdateModal = (data: IVendor) => {
    setSelectedData(data);
    setIsUpdateModalOpen(true);
  };
  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedData(null);
  };

  const handleOpenDetailModal = (data: IVendor) => {
    setSelectedDetailData(data);
    setIsDetailModalOpen(true);
  };
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDetailData(null);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this vendor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors/${id}`);
        Swal.fire("Deleted!", "The vendor has been deleted.", "success");
        setIsRefetch((prev) => !prev);
      } catch (error: any) {
        Swal.fire(
          "Error!",
          error.response?.data?.message || "Failed to delete the vendor.",
          "error"
        );
      }
    }
  };

  const columns: ColumnDef<IVendor>[] = [
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
    { accessorKey: "vendor_code", header: "Vendor Code" },
    { accessorKey: "name", header: "Vendor Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone_no", header: "Phone" },
    { accessorKey: "vendor_type", header: "Type" },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex space-x-2 justify-center items-center">
            <button
              title="Detail"
              className={clsx(
                "btn btn-icon bg-blue-400 btn-sm text-white",
                "hover:scale-105 active:scale-100 rounded"
              )}
              onClick={() => handleOpenDetailModal(data)}
            >
              <i className="ki-outline ki-eye" />
            </button>
            <button
              title="Edit"
              className={clsx(
                "btn btn-icon bg-yellow-500 btn-sm text-white",
                "hover:scale-105 transition duration-200 rounded"
              )}
              onClick={() => handleOpenUpdateModal(data)}
            >
              <i className="ki-outline ki-pencil" />
            </button>
            <button
              title="Delete"
              className={clsx(
                "btn btn-icon bg-red-500 btn-sm text-white",
                "hover:scale-105 transition duration-200 rounded"
              )}
              onClick={() => handleDelete(data.vendor_id)}
            >
              <i className="ki-outline ki-trash" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">Vendor List</h1>

          {/* Hanya tampil untuk vendor */}
          {userRole === "patria" && (
            <button
              onClick={handleOpenCreateModal}
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
            >
              <i className="ki-outline ki-plus-squared" />
              <span>Add Vendor</span>
            </button>
          )}
        </div>

      <DataTable
          columns={columns}
          url={`${process.env.NEXT_PUBLIC_API_URL}/api/vendors?sort=vendor_id&order=asc`}
          isRefetch={isRefetch} additionalTransform={undefined}/>


      </div>

      <DetailModal
        isModalOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        vendor={selectedDetailData}
      />

      <CreateModal
        isModalOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        setRefetch={setIsRefetch}
        isRefetch={isRefetch}
      />

      <UpdateModal
        isModalOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        selectedVendor={selectedData}
        setRefetch={setIsRefetch}
        isRefetch={isRefetch}
      />
    </>
  );
}

// Tambahkan wrapper layout
VendorPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Main>{page}</Main>;
};

export default VendorPage;
