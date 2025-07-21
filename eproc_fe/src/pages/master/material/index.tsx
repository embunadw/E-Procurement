import { FaPen, FaTrashAlt } from "react-icons/fa";
import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import axios from "axios";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import CreateModal from "./CreateModal";
import UpdateModal from "./UpdateModal";

type IMaterial = {
  material_id: number;
  material_number: string;
  material_description: string;
  material_group: string;
  material_group_description?: string;
  material_type: string;
  base_unit: string;
  plant: string;
};

function MaterialPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<IMaterial | null>(null);
  const [isRefetch, setIsRefetch] = useState(false);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleOpenUpdateModal = (data: IMaterial) => {
    setSelectedData(data);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setSelectedData(null);
    setIsUpdateModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this material?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/materials/${id}`);
        Swal.fire("Deleted!", "The material has been deleted.", "success");
        setIsRefetch((prev) => !prev);
      } catch (error) {
        console.error(error);
        Swal.fire("Error!", "Failed to delete the material.", "error");
      }
    }
  };

  const columns: ColumnDef<IMaterial>[] = [
    {
      accessorKey: "rowIndex",
      header: "#",
      cell: ({ row, table }) =>
        table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1,
    },
    {
      accessorKey: "material_number",
      header: "Material Number",
    },
    {
      accessorKey: "material_description",
      header: "Material Description",
    },
    {
      accessorKey: "material_group",
      header: "Material Group",
    },
    {
      accessorKey: "material_group_description",
      header: "Group Description",
    },
    {
      accessorKey: "material_type",
      header: "Material Type",
    },
    {
      accessorKey: "base_unit",
      header: "Base Unit",
    },
    {
      accessorKey: "plant",
      header: "Plant",
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex space-x-2 justify-center items-center">
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
                "transition duration-200 ease-in-out transform hover:scale-105 rounded"
              )}
              onClick={() => handleDelete(data.material_id)}
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
        <h1 className="text-2xl font-semibold text-gray-800">Master Material</h1>
        <button
          onClick={handleOpenCreateModal}
          className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 shadow-md transition duration-200 ease-in-out hover:scale-105"
        >
          <i className="ki-outline ki-plus-squared" />
          <span>Add Material</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/materials`}
        isRefetch={isRefetch} additionalTransform={undefined}      />

      <CreateModal
        isModalOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        setRefetch={setIsRefetch}
        isRefetch={isRefetch}
      />

      <UpdateModal
        isModalOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        selectedMaterial={selectedData}
        setRefetch={setIsRefetch}
        isRefetch={isRefetch}
      />
    </div>
  );
}

// Layout injection
MaterialPage.getLayout = function PageLayout(page: React.ReactElement) {
  return <Main>{page}</Main>;
};

export default MaterialPage;
