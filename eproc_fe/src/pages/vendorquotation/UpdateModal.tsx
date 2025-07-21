import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { FaFileDownload } from "react-icons/fa";
import MainVendor from "@/vendor-layouts/main";
import Swal from "sweetalert2";

export default function UpdateModal() {
  const router = useRouter();
  const { rfq_detail_id } = router.query;

  const [rfqDetail, setRfqDetail] = useState<any>(null);
  const [form, setForm] = useState({
    price: "",
    moq: "",
    valid_until: "",
    attachment: null as File | null,
  });
  const [quotationId, setQuotationId] = useState<string | null>(null);
  const [existingAttachment, setExistingAttachment] = useState<string | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null); // base64

  useEffect(() => {
    if (!router.isReady || !rfq_detail_id) return;

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/rfq/details/${rfq_detail_id}`)
      .then((res) => {
        console.log("RFQ Detail Response:", res.data); // Debug log
        setRfqDetail(res.data);
      })
      .catch((err) => console.error("Failed to fetch RFQ detail", err));

    const vendorId = Cookies.get("vendor_id");
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor-detail`, {
        params: { vendor_id: vendorId, rfq_detail_id },
      })
      .then((res) => {
        const q = res.data;
        console.log("Vendor Quotation Response:", q); // Debug log
        setQuotationId(q.id);
        setForm({
          price: q.price ? formatPrice(q.price.toString()) : "",
          moq: q.moq || "",
          valid_until: q.valid_until?.slice(0, 10) || "",
          attachment: null,
        });
        setExistingAttachment(q.attachment || null);
        setAttachmentUrl(q.attachmentUrl || null); // base64 link (optional)
      })
      .catch((err) => {
        console.error("Failed to fetch vendor quotation", err.response?.data || err.message);
      });
  }, [router.isReady, rfq_detail_id]);

  // Function to format price with thousand separator
  const formatPrice = (value: string): string => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, "");

    // Add thousand separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Function to get numeric value without separators
  const getNumericPrice = (value: string): string => {
    return value.replace(/\./g, "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else if (name === "price") {
      // Format price with thousand separator
      const formattedValue = formatPrice(value);
      setForm((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vendorId = Cookies.get("vendor_id");
    if (!vendorId || !rfq_detail_id || !quotationId) return;

    const quotations = [
      {
        id: quotationId,
        rfq_detail_id,
        price: getNumericPrice(form.price), // Send numeric value without separators
        moq: form.moq,
      },
    ];

    const formData = new FormData();
    formData.append("vendor_id", vendorId);
    formData.append("quotations", JSON.stringify(quotations));
    formData.append("valid_until", form.valid_until);
    if (form.attachment) formData.append("attachment", form.attachment);

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor-quotation`, formData);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Quotation updated successfully!",
      }).then(() => {
        router.push("/vendorquotation");
      });
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to update quotation. Please try again.",
      });
    }
  };

  const downloadFile = async (
    id: number,
    type: "picture" | "attachment" | "vendor",
    filename: string
  ) => {
    try {
      let endpoint = "";
      if (type === "picture") endpoint = `/api/rfq-picture/${id}`;
      else if (type === "attachment") endpoint = `/api/rfq-attachment/${id}`;
      else if (type === "vendor") endpoint = `/api/vendor-quotation/${id}/download`;

      console.log("Download endpoint:", `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);
      console.log("Download ID:", id, "Type:", type);

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
      console.error("Error response:", error.response?.data);

      // Show user-friendly error message
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "Failed to download attachment. Please try again later.",
      });
    }
  };

  // Helper function untuk safely render string dari objek
  const safeRenderString = (value: any): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    if (typeof value === "object") {
      // Jika objek, coba akses property yang mungkin ada
      return value.filename || value.name || JSON.stringify(value);
    }
    return String(value);
  };

  const isExpired = rfqDetail && new Date(rfqDetail.rfq_duedate) < new Date();

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Update Quotation</h2>

      {rfqDetail && (
        <>
          <table className="w-full text-sm border border-gray-300 mb-6">
            <tbody>
              <tr>
                <td className="font-semibold p-2 border w-1/4">RFQ Number</td>
                <td className="p-2 border">{safeRenderString(rfqDetail.rfq_number)}</td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border">Part No.</td>
                <td className="p-2 border">{safeRenderString(rfqDetail.part_number)}</td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border">Part Name</td>
                <td className="p-2 border">{safeRenderString(rfqDetail.description)}</td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border">Qty</td>
                <td className="p-2 border">
                  {safeRenderString(rfqDetail.pr_qty)} {safeRenderString(rfqDetail.pr_uom)}
                </td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border">Specification</td>
                <td className="p-2 border">{safeRenderString(rfqDetail.rfq_specification)}</td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border">Due Date</td>
                <td className="p-2 border">
                  {rfqDetail.rfq_duedate
                    ? new Date(rfqDetail.rfq_duedate).toLocaleDateString("en-GB")
                    : "N/A"
                  }
                </td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border">Attachment</td>
                <td className="p-2 border">
                  {rfqDetail.files && Array.isArray(rfqDetail.files) && rfqDetail.files.length > 0 ? (
                    <ul>
                      {rfqDetail.files.map((file: any, i: number) => {
                        console.log("File object:", file); // Debug log
                        const fileName = safeRenderString(file.filename || file.name || `file_${i + 1}`);
                        const fileId = file.id || i;

                        return (
                          <li key={i} className="flex justify-between items-center">
                            <span>{fileName}</span>
                            <button
                              onClick={() =>
                                downloadFile(fileId, "attachment", fileName)
                              }
                              className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                            >
                              <FaFileDownload /> Download
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <span className="text-gray-500">No attachments</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {isExpired && (
            <div className="bg-yellow-100 text-yellow-800 border border-yellow-400 p-3 rounded mb-4">
              Quotation cannot be updated because the due date has expired.
            </div>
          )}

          <div className="bg-yellow-100 border border-gray-300 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Quotation Form
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block font-medium mb-1">Price (IDR)</label>
                  <input
                    type="text"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full border p-2"
                    required
                    disabled={isExpired}
                  />

                </div>
                <div className="font-semibold">/ {safeRenderString(rfqDetail?.pr_uom)}</div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block font-medium mb-1">MOQ</label>
                  <input
                    type="number"
                    name="moq"
                    value={form.moq}
                    onChange={handleChange}
                    className="w-full border p-2"
                    required
                    disabled={isExpired}
                  />
                </div>
                <div className="font-semibold">/ {safeRenderString(rfqDetail?.pr_uom)}</div>
              </div>

              <div>
                <label className="block font-medium mb-1">Valid Until</label>
                <input
                  type="date"
                  name="valid_until"
                  value={form.valid_until}
                  onChange={handleChange}
                  className="w-full border p-2"
                  required
                  disabled={isExpired}
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Attachment (.pdf, max 10MB)
                </label>

                {/* Display existing attachment */}
                {existingAttachment && (
                  <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaFileDownload className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Previous Attachment
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          downloadFile(Number(quotationId), "vendor", `quotation_${quotationId}.pdf`)
                        }
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Click download to view previously uploaded files.
                    </p>
                  </div>
                )}

                {/* Display base64 (data URL) attachment */}
                {attachmentUrl && (
                  <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaFileDownload className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Attachment (Base64)
                        </span>
                      </div>
                      <a
                        href={attachmentUrl}
                        download="quotation.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                )}

                {/* Input File Baru */}
                <div className="space-y-2">
                  <input
                    type="file"
                    name="attachment"
                    accept=".pdf"
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-2"
                    disabled={isExpired}
                  />
                  <p className="text-xs text-gray-500">
                    Upload a new file to replace the previous attachment (optional)
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold disabled:opacity-50"
                disabled={isExpired}
              >
                UPDATE QUOTATION
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

UpdateModal.getLayout = function getLayout(page: React.ReactElement) {
  return <MainVendor>{page}</MainVendor>;
};