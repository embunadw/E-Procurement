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

type IMaterialGroup = {
  material_group_id: string;
  material_group: string;
  material_group_description: string;
  material_type?: string;
};

function MaterialGroupPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<IMaterialGroup | null>(null);
  const [isRefetch, setIsRefetch] = useState(false);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleOpenUpdateModal = (data: IMaterialGroup) => {
    setSelectedData(data);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setSelectedData(null);
    setIsUpdateModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this material group?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/material-groups/${id}`);
        Swal.fire("Deleted!", "The material group has been deleted.", "success");
        setIsRefetch((prev) => !prev);
      } catch (error) {
        console.error(error);
        Swal.fire("Error!", "Failed to delete the material group.", "error");
      }
    }
  };

  const columns: ColumnDef<IMaterialGroup>[] = [
    {
      accessorKey: "rowIndex",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "material_type",
      header: "Material Type",
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
                "hover:scale-105 active:scale-100 rounded"
              )}
              onClick={() => handleDelete(data.material_group_id)}
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
        <h1 className="text-2xl font-semibold text-gray-800">Material Group List</h1>
        <button
          onClick={handleOpenCreateModal}
          className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <i className="ki-outline ki-plus-squared" />
          <span>Add Material Group</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/material-groups`}
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
        selectedMaterialGroup={selectedData}
        setRefetch={setIsRefetch}
        isRefetch={isRefetch}
      />
    </div>
  );
}

MaterialGroupPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Main>{page}</Main>;
};

export default MaterialGroupPage;
