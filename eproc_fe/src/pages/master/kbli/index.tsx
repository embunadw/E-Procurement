import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import clsx from "clsx";
import { ColumnDef } from "@tanstack/react-table";

import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import CreateModal from "./CreateModal";
import UpdateModal from "./UpdateModal";

interface IKbli {
  id: number;
  year: string;
  code: string;
  title: string;
  description: string;
  number: number;
}

function KbliPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<IKbli | null>(null);
  const [isRefetch, setIsRefetch] = useState(false);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleOpenUpdateModal = (data: IKbli) => {
    setSelectedData(data);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedData(null);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this KBLI?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/kblis/${id}`);
        Swal.fire("Deleted!", "The KBLI has been deleted.", "success");
        setIsRefetch(!isRefetch);
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the KBLI.", "error");
      }
    }
  };

const columns: ColumnDef<IKbli>[] = [
  {
    accessorKey: "number",
    header: "#",
    cell: (info) => info.getValue(),
    enableSorting: false,
    size: 50,
  },
  {
    accessorKey: "code",
    header: "KBLI Code",
  },
  {
    accessorKey: "title",
    header: "KBLI Title",
  },
  {
    accessorKey: "year",
    header: "Year",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ getValue }) => (
      <div className="text-justify whitespace-pre-line">{getValue() as string}</div>
    ),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex space-x-1 justify-center items-center">
          <button
            title="Edit"
            className={clsx(
              "btn btn-icon bg-yellow-500 btn-sm text-white",
              "hover:scale-105 active:scale-100 rounded"
            )}
            onClick={() => handleOpenUpdateModal(data)}
          >
            <i className="ki-outline ki-pencil" />
          </button>
          <button
            title="Delete"
            className={clsx(
              "btn btn-icon bg-red-500 btn-sm text-white",
              "hover:scale-105 active:scale-100 rounded"
            )}
            onClick={() => handleDelete(data.id)}
          >
            <i className="ki-outline ki-trash" />
          </button>
        </div>
      );
    },
  },
];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">KBLI List</h1>
        <button
          onClick={handleOpenCreateModal}
          className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <i className="ki-outline ki-plus-squared" />
          <span>Add KBLI</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/kblis`}
        isRefetch={isRefetch}
        additionalTransform={undefined}
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
        selectedKbli={selectedData}
        setRefetch={setIsRefetch}
        isRefetch={isRefetch}
      />
    </div>
  );
}

KbliPage.getLayout = function PageLayout(page: React.ReactElement) {
  return <Main>{page}</Main>;
};

export default KbliPage;
