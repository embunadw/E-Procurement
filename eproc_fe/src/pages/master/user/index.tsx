import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import axios from "axios";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import CreateModal from "./CreateModal";
import UpdateModal from "./UpdateModal";
import clsx from "clsx";

// Tipe data sesuai dengan ms_user
type IMUser = {
  user_id: number;
  username: string;
  role: string;
  personal_number: number;
  dept: string;
  department: string;
  division: string;
  email_sf: string;
};

function UserPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<IMUser | null>(null);
  const [isRefetch, setIsRefetch] = useState(false);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleOpenUpdateModal = (data: IMUser) => {
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
      text: "Are you sure you want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`);
        Swal.fire("Deleted!", "The user has been deleted.", "success");
        setIsRefetch(!isRefetch);
      } catch (error) {
        Swal.fire("Error!", "Failed to delete the user.", "error");
      }
    }
  };

  const columns: ColumnDef<IMUser>[] = [
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
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "personal_number",
      header: "Personal Number",
    },
    {
      accessorKey: "email_sf",
      header: "Email",
    },
    {
      accessorKey: "dept",
      header: "Dept",
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      accessorKey: "division",
      header: "Division",
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
                         onClick={() => handleDelete(data.user_id)}
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
        <h1 className="text-2xl font-semibold text-gray-800">User List</h1>
        <button
          onClick={handleOpenCreateModal}
          className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
        >
          <i className="ki-outline ki-plus-squared" />
          <span>Add User</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        url={`${process.env.NEXT_PUBLIC_API_URL}/api/users`}
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
        selectedUser={selectedData}
        setRefetch={setIsRefetch}
        isRefetch={isRefetch}
      />
    </div>
  );
}

// Inject layout
UserPage.getLayout = function getLayout(page: React.ReactElement) {
  return <Main>{page}</Main>;
};

export default UserPage;
