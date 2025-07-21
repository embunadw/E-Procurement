import React, { useEffect, useState } from "react";
import Main from "../../../main-layouts/main";
import DataTable from "../../../components/Datatables";
import clsx from "clsx";
import axios from "axios";
import Swal from "sweetalert2";
import { ColumnDef } from "@tanstack/react-table";
import CreateModal from "./CreateModal";
import DetailModal from "./DetailModal";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

export type IRfq = {
  rfq_id: number;
  rfq_number: string;
  rfq_title: string;
  is_approved: string; // "Pending" | "Approved" | "Rejected"
};

export default function RFQIndex() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailData, setSelectedDetailData] = useState<any>(null);
  const [isRefetch, setIsRefetch] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // Function to open and close modals
  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDetailData(null);
  };

  // Fetch RFQ detail
  const handleOpenDetailModal = async (data: IRfq) => {
    const numericId = Number(data.rfq_id);
    if (isNaN(numericId)) {
      console.error("Invalid RFQ ID:", data.rfq_id);
      Swal.fire("Error", "RFQ ID tidak valid.", "error");
      return;
    }

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/rfq/${numericId}`);
      setSelectedDetailData(res.data.data);
      setIsDetailModalOpen(true);
    } catch (error: any) {
      console.error("Failed to fetch RFQ detail:", error);
      Swal.fire("Error", error.response?.data?.message || "Gagal mengambil detail RFQ", "error");
    }
  };

  // Approve RFQ
  const handleApprove = async (id: number) => {
    const result = await Swal.fire({
      title: "Approve Confirmation",
      text: "Are you sure you want to approve this RFQ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/rfq/${id}/approve`);
        Swal.fire("Approved", "RFQ approved successfully", "success");
        setIsRefetch(prev => !prev);
      } catch (err) {
        Swal.fire("Error", "Failed to approve RFQ", "error");
      }
    }
  };

  // Reject RFQ
  const handleReject = async (id: number) => {
    const result = await Swal.fire({
      title: "Reject Confirmation",
      text: "Are you sure you want to reject this RFQ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/rfq/${id}/reject`);
        Swal.fire("Rejected", "RFQ rejected successfully", "success");
        setIsRefetch(prev => !prev);
      } catch (err) {
        Swal.fire("Error", "Failed to reject RFQ", "error");
      }
    }
  };

  // Archive RFQ
  const handleArchive = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: "Archive Confirmation",
      text: `Are you sure you want to archive RFQ "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, archive it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/rfq/${id}`);
        Swal.fire("Archived!", "The RFQ has been archived.", "success");
        setIsRefetch(prev => !prev);
      } catch (error: any) {
        Swal.fire("Error!", error.response?.data?.message || "Failed to archive the RFQ.", "error");
      }
    }
  };

  // Fetch user role from token
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setRole(decoded?.role || null);
    }
  }, []);

  // Define columns for DataTable
  const columns: ColumnDef<IRfq>[] = [
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
      accessorKey: "rfq_number",
      header: "RFQ Number",
      id: "rfq_number",
      enableSorting: true,
    },
    { accessorKey: "rfq_title", header: "RFQ Title" },
    {
      header: "Approval",
      accessorKey: "is_approved",
      cell: ({ row }) => {
        const rawStatus = row.original.is_approved;
        const id = row.original.rfq_id;
        const status = rawStatus === null || rawStatus === "0" || rawStatus === "" ? "Pending" : rawStatus;

        const statusColorMap = {
          Approved: "bg-green-100 text-green-700 border border-green-200",
          Rejected: "bg-red-100 text-red-700 border border-red-200",
          Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
        };

        if (role === "manager" && status === "Pending") {
          return (
            <div className="flex gap-2">
              <button
                className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                onClick={() => handleApprove(id)}
              >
                Approve
              </button>
              <button
                className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                onClick={() => handleReject(id)}
              >
                Reject
              </button>
            </div>
          );
        }

        return (
          <span className={clsx("px-3 py-1 rounded-full text-sm font-semibold", statusColorMap[status as keyof typeof statusColorMap])}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const data = row.original;
        const isManager = role === "manager";
        const isPending = data.is_approved === "Pending";

        return (
          <div className="flex gap-2 items-center justify-center">
            <button
              title="Detail"
              className={clsx("btn btn-icon bg-blue-400 btn-sm text-white", "hover:scale-105 active:scale-100 rounded")}
              onClick={() => handleOpenDetailModal(data)}
            >
              <i className="ki-outline ki-eye" />
            </button>

            <button
              title="Archive"
              className={clsx("btn btn-icon bg-red-300 btn-sm text-white", "hover:scale-105 active:scale-100 rounded")}
              onClick={() => handleArchive(data.rfq_id, data.rfq_title)}
            >
              <i className="ki-outline ki-archive" />
            </button>

            {isManager && isPending && (
              <>
                <button
                  title="Approve"
                  className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700 border border-green-200"
                  onClick={() => handleApprove(data.rfq_id)}
                >
                  <i className="ki-outline ki-check-square mr-1" />
                  Approve
                </button>

                <button
                  title="Reject"
                  className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200"
                  onClick={() => handleReject(data.rfq_id)}
                >
                  <i className="ki-outline ki-x-square mr-1" />
                  Reject
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Main>
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 md:px-6 mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">RFQ List</h1>
          {role !== "manager" && (
            <button
              onClick={handleOpenCreateModal}
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
            >
              <i className="ki-outline ki-plus-squared" />
              <span>Add RFQ</span>
            </button>
          )}
        </div>

        <DataTable
          columns={columns}
          url={`${process.env.NEXT_PUBLIC_API_URL}/api/rfq`}
          isRefetch={isRefetch}
          additionalTransform={undefined}
        />
      </div>

      {isDetailModalOpen && (
        <DetailModal
          onClose={handleCloseDetailModal}
          rfqData={selectedDetailData}
          role={role} // Menambahkan prop role di sini
        />
      )}

      {isCreateModalOpen && (
        <CreateModal
          onClose={handleCloseCreateModal}
          onSuccess={() => {
            handleCloseCreateModal();
            setIsRefetch(prev => !prev);
          }}
        />
      )}
    </Main>
  );
}
