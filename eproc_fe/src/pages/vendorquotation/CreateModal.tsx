import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { FaFileDownload } from "react-icons/fa";
import MainVendor from "@/vendor-layouts/main";
import Swal from 'sweetalert2';

export default function CreateModal() {
  const router = useRouter();
  const { rfq_detail_id } = router.query;

  const [rfqDetail, setRfqDetail] = useState<any>(null);
  const [form, setForm] = useState({
    price: "",
    moq: "",
    valid_until: "",
    attachment: null as File | null,
  });

  useEffect(() => {
    if (rfq_detail_id) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/rfq/details/${rfq_detail_id}`)
        .then((res) => setRfqDetail(res.data))
        .catch((err) => console.error("Failed to fetch RFQ detail", err));
    }
  }, [rfq_detail_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const vendorId = Cookies.get("vendor_id");
    if (!vendorId || !rfq_detail_id) return;

    const quotations = [
      {
        rfq_detail_id,
        price: form.price,
        moq: form.moq,
      },
    ];

    const formData = new FormData();
    formData.append("vendor_id", vendorId);
    formData.append("quotations", JSON.stringify(quotations));
    formData.append("valid_until", form.valid_until);
    if (form.attachment) formData.append("attachment", form.attachment);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor-quotation`,
        formData
      );
      await Swal.fire({
        icon: "success",
        title: "Quotation Submitted",
        text: "Your quotation has been submitted successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
      router.push("/vendorquotation");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Failed to submit quotation. Please try again.",
        confirmButtonText: "OK",
      });
      console.error("Submit error:", err);
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

  const isExpired = rfqDetail && new Date(rfqDetail.rfq_duedate) < new Date();

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Submit Quotation</h2>

      {rfqDetail && (
        <>
          <table className="w-full text-sm border border-gray-300 mb-6">
            <tbody>
              <tr>
                <td className="font-semibold p-2 border w-1/4 align-top">RFQ Number</td>
                <td className="p-2 border">{rfqDetail.rfq_number}</td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border align-top">RFQ Title</td>
                <td className="p-2 border">{rfqDetail.rfq_title}</td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border align-top">Part No.</td>
                <td className="p-2 border">{rfqDetail.part_number}</td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border align-top">Part Name</td>
                <td className="p-2 border">{rfqDetail.description}</td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border align-top">Qty</td>
                <td className="p-2 border">
                  {rfqDetail.pr_qty} {rfqDetail.pr_uom}
                </td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border align-top">Specification</td>
                <td className="p-2 border">{rfqDetail.rfq_specification}</td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border align-top">Due Date</td>
                <td className="p-2 border">
                  {new Date(rfqDetail.rfq_duedate).toLocaleDateString("en-GB")}
                </td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border align-top">Images</td>
                <td className="p-2 border">
                  <ul className="space-y-1">
                    {rfqDetail.pictures?.map((pic: any, i: number) => (
                      <li key={i} className="flex justify-between items-center">
                        <span>{pic.filename}</span>
                        <button
                          onClick={() => downloadFile(pic.id, "picture", pic.filename)}
                          className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                        >
                          <FaFileDownload /> Download
                        </button>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
              <tr>
                <td className="font-semibold p-2 border align-top">Attachment</td>
                <td className="p-2 border">
                  <ul className="space-y-1">
                    {rfqDetail.files?.map((file: any, i: number) => (
                      <li key={i} className="flex justify-between items-center">
                        <span>{file.filename}</span>
                        <button
                          onClick={() => downloadFile(file.id, "attachment", file.filename)}
                          className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                        >
                          <FaFileDownload /> Download
                        </button>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>

          {isExpired && (
            <div className="bg-yellow-100 text-yellow-800 border border-yellow-400 p-3 rounded mb-4">
              Quotation cannot be edited because the due date has expired.
            </div>
          )}

          <div className="bg-blue-100 border border-gray-300 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Quotation Form
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block font-medium mb-1">Price (IDR)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full border p-2"
                    required
                    disabled={isExpired}
                  />
                </div>
                <div className="font-semibold">/ {rfqDetail?.pr_uom}</div>
              </div>

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
                <input
                  type="file"
                  name="attachment"
                  accept=".pdf"
                  onChange={handleChange}
                  className="w-full"
                  disabled={isExpired}
                />
              </div>

              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold disabled:opacity-50"
                disabled={isExpired}
              >
                SUBMIT QUOTATION
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

CreateModal.getLayout = function getLayout(page: React.ReactElement) {
  return <MainVendor>{page}</MainVendor>;
};
