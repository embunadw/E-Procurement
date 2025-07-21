import React, { useState } from "react";
import { FaFileDownload } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

interface RFQDetailModalProps {
  rfqData: any;
  onClose: () => void;
  role: string; // Pastikan untuk menerima role sebagai prop
}

export default function DetailModal({ rfqData, onClose, role }: RFQDetailModalProps) {
  const [dueDate, setDueDate] = useState<string>(rfqData?.rfq_duedate?.split("T")[0] || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [dueDateMessage, setDueDateMessage] = useState<string | null>(null);

  if (!rfqData) {
    return <div className="p-6 text-gray-500 italic">RFQ data not available.</div>; // ✅ safe conditional rendering
  }

const handleUpdateDueDate = async () => {
  try {
    setIsUpdating(true);
    await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/rfq/${rfqData.rfq_id}`, {
      rfq_duedate: dueDate,
    });

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "RFQ due date updated successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: "Failed to update RFQ due date. Please try again later.",
    });
  } finally {
    setIsUpdating(false);
  }
};


  const downloadFile = async (id: number, type: "picture" | "attachment", filename: string) => {
    try {
      const endpoint = type === "picture" ? `/api/rfq-picture/${id}` : `/api/rfq-attachment/${id}`;
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 overflow-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full p-6 shadow-lg max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Detail RFQ</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-red-600 text-2xl font-bold">&times;</button>
        </div>

        <table className="w-full text-sm border border-gray-300">
          <tbody>
            <tr>
              <td className="font-semibold p-2 border w-1/4 align-top">RFQ Number</td>
              <td className="p-2 border">{rfqData.rfq_number}</td>
            </tr>
            <tr>
              <td className="font-semibold p-2 border align-top">RFQ Title</td>
              <td className="p-2 border">{rfqData.rfq_title}</td>
            </tr>
            <tr>
              <td className="font-semibold p-2 border align-top">RFQ Creator</td>
              <td className="p-2 border">
                <div className="text-sm space-y-1 leading-tight">
                  <p className="font-semibold text-gray-800">{rfqData.user?.username ?? "-"}</p>
                  <p className="text-gray-700">{rfqData.user?.email_sf ?? "-"}</p>
                  <p className="text-gray-500 italic">{rfqData.user?.personal_number ?? "-"}</p>
                </div>
              </td>
            </tr>

            <tr>
              <td className="font-semibold p-2 border align-top">RFQ Item</td>
              <td className="p-2 border">
                <table className="w-full table-fixed border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border w-[12%]">Part Number</th>
                      <th className="p-2 border">Description</th>
                      <th className="p-2 border">Qty</th>
                      <th className="p-2 border">UoM</th>
                      <th className="p-2 border">Group</th>
                      <th className="p-2 border w-[12%]">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfqData.details?.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2 border" style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {item.part_number}
                        </td>
                        <td className="p-2 border">{item.description}</td>
                        <td className="p-2 border">{item.pr_qty}</td>
                        <td className="p-2 border">{item.pr_uom}</td>
                        <td className="p-2 border">{item.matgroup}</td>
                        <td className="p-2 border">{item.source_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td className="font-semibold p-2 border align-top">RFQ Images</td>
              <td className="p-2 border">
                <table className="w-full table-fixed border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 w-[12%]">No.</th>
                      <th className="border p-2">File Name</th>
                      <th className="border p-2 w-[12%]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfqData.pictures?.map((pic: any, i: number) => (
                      <tr key={i}>
                        <td className="border p-2 text-center">{i + 1}</td>
                        <td className="border p-2">{pic.filename}</td>
                        <td className="border p-2">
                          <button
                            onClick={() => downloadFile(pic.id, "picture", pic.filename)}
                            className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                          >
                            <FaFileDownload /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td className="font-semibold p-2 border align-top">RFQ File/Attachment</td>
              <td className="p-2 border">
                <table className="w-full table-fixed border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 w-[12%]">No.</th>
                      <th className="border p-2">File Name</th>
                      <th className="border p-2 w-[12%]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfqData.files?.map((file: any, i: number) => (
                      <tr key={i}>
                        <td className="border p-2 text-center">{i + 1}</td>
                        <td className="border p-2">{file.filename}</td>
                        <td className="border p-2">
                          <button
                            onClick={() => downloadFile(file.id, "attachment", file.filename)}
                            className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                          >
                            <FaFileDownload /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
              <td className="font-semibold p-2 border align-top">RFQ Specification</td>
              <td className="p-2 border">{rfqData.rfq_specification}</td>
            </tr>
            <tr>
              <td className="font-semibold p-2 border align-top">RFQ Due Date</td>
              <td className="p-2 border">
                <div className="flex flex-col items-start space-y-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      className="border border-gray-300 rounded px-2 py-1"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />

                    {role === "patria" && (
                      <button
                        onClick={handleUpdateDueDate}
                        disabled={isUpdating}
                        className="bg-yellow-100 text-yellow-700 border border-yellow-200 font-semibold px-4 py-1 rounded-full text-sm hover:bg-yellow-200 transition"
                      >
                        {isUpdating ? "Saving..." : "Update"}
                      </button>
                    )}
                  </div>
                
                </div>
              </td>
            </tr>

            {rfqData.rfq_type === "invitation" && (
              <tr>
                <td className="font-semibold p-2 border align-top">Vendors</td>
                <td className="p-2 border">
                  <table className="w-full table-fixed border text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">Vendor Name</th>
                        <th className="border p-2">Vendor Code</th>
                        <th className="border p-2">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfqData.vendors?.map((v: any, i: number) => (
                        <tr key={i}>
                          <td className="border p-2">{v.vendor?.name ?? "-"}</td>
                          <td className="border p-2">{v.vendor?.vendor_code ?? "-"}</td>
                          <td className="border p-2">{v.vendor?.email ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
