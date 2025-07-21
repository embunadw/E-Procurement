import React from "react";
import { IVendor } from "./index";

type Props = {
  isModalOpen: boolean;
  onClose: () => void;
  vendor: IVendor | null;
};

export default function DetailModal({ isModalOpen, onClose, vendor }: Props) {
  if (!isModalOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[70vh] overflow-auto relative shadow-lg">
        {/* Tombol close X pojok kanan atas */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 transition text-lg font-semibold"
          aria-label="Close"
          title="Close"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
          Vendor Details
        </h2>

        <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
          <tbody>
            {[
              ["Vendor Code", vendor.vendor_code],
              ["Name", vendor.name],
              ["Email", vendor.email],
              ["Phone", vendor.phone_no],
              ["Type", vendor.vendor_type],
              ["Address", vendor.address],
              ["Country Code", vendor.country_code],
              ["Postal Code", vendor.postal_code],
              ["Email PO", vendor.email_po],
            ].map(([label, value]) => (
              <tr key={label} className="border border-gray-300">
                <td className="px-3 py-2 font-semibold bg-gray-100 border border-gray-300 w-40">
                  {label}:
                </td>
                <td className="px-3 py-2 border border-gray-300">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
