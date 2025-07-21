import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";
import Select from "react-select";
import { FaMinus, FaPlus } from "react-icons/fa";
import { ArchiveBoxIcon } from "@heroicons/react/24/solid";

interface RFQFormData {
  rfqTitle: string;
  category: string;
  rfqFrom: string;
  prFilter: string;
  rfqSpecification: string;
  rfqDueDate: string;
  rfqType: string;
  rfqPicture?: FileList;
  rfqAttachment?: FileList;
  vendor?: string;
}

interface Material {
  material_number: string;
  material_description: string;
  material_group: string;
  material_group_description: string;
  base_unit: string;
}
type CreateModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};



interface SubcontractorMaterial {
  id: string;
  Material: string;
  Description: string;
  material_group: string;
  uom: string;
}

function isMaterial(mat: any): mat is Material {
  return 'material_number' in mat;
}

function isSubcontractorMaterial(mat: any): mat is SubcontractorMaterial {
  return 'id' in mat && 'Description' in mat;
}


export default function CreateModal({ onClose, onSuccess }: CreateModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<RFQFormData>();
  const [loading, setLoading] = useState(false);
  const [submitLabel, setSubmitLabel] = useState("Submit");
  const [category, setCategory] = useState<string | null>(null);
  const [rfqFrom, setRfqFrom] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subcontractorMaterials, setSubcontractorMaterials] = useState<SubcontractorMaterial[]>([]);
  const [materialSelections, setMaterialSelections] = useState([{ selectedMaterial: null }]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [vendorSelections, setVendorSelections] = useState([{ selectedVendor: null }]);
  const [rfqType, setRfqType] = useState<string>("general");

  const addMaterialRow = () => setMaterialSelections(prev => [...prev, { selectedMaterial: null }]);
  const removeMaterialRow = (index: number) => {
    setMaterialSelections(prev => prev.filter((_, i) => i !== index));
  };

  const addVendorRow = () => setVendorSelections(prev => [...prev, { selectedVendor: null }]);
  const removeVendorRow = (index: number) => {
    setVendorSelections(prev => prev.filter((_, i) => i !== index));
  };

  const handleVendorChange = (selectedOption: any, index: number) => {
    const updated = [...vendorSelections];
    updated[index].selectedVendor = selectedOption; // jangan diubah
    setVendorSelections(updated);
  };


  const materialOptions = materials.map((mat) => ({
    value: mat.material_number,
    label: `${mat.material_number} - ${mat.material_description}`,
    fullData: mat,
  }));

  const subcontractorMaterialOptions = subcontractorMaterials.map((mat) => ({
    value: mat.id,
    label: `${mat.Material} - ${mat.Description}`,
    fullData: mat,
  }));

  const optionsToUse = category === "subcontractor" ? subcontractorMaterialOptions : materialOptions;
  const materialsToUse = category === "subcontractor" ? subcontractorMaterials : materials;

  useEffect(() => {
    if (!category) return;

    setMaterialSelections([{ selectedMaterial: null }]);
    setRfqFrom(null);

    const fetchData = async () => {
      try {
        if (category === "vendor") {
          const res = await axios.get("http://localhost:3000/api/materials");
          const data = res.data?.data?.data || res.data?.data || res.data;
          if (Array.isArray(data)) setMaterials(data);
        } else if (category === "subcontractor") {
          const res = await axios.get("http://localhost:3000/api/subcontractor");
          const data = res.data?.data?.data || res.data?.data || res.data;
          if (Array.isArray(data)) setSubcontractorMaterials(data);
        }
      } catch (err) {
        console.error("Fetching material failed:", err);
      }
    };

    fetchData();
  }, [category]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/vendors");
        const data = res.data?.data?.data || res.data?.data || res.data;
        if (Array.isArray(data)) {
          const vendorData = data.map((v: any) => ({
            value: v.vendor_id,
            label: v.name,
            email: v.email,
            vendor_code: v.vendor_code,
            vendor_type: v.vendor_type, // Pastikan vendor_type ada di data
          }));
          setVendors(vendorData);
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  // Update vendor selection based on category
  const filteredVendors = vendorSelections.map((entry) => {
    return entry.selectedVendor
      ? vendors.filter((v) =>
        category === "vendor"
          ? v.vendor_type !== "Vendor SubCont"
          : v.vendor_type === "Vendor SubCont"
      )
      : [];
  });


  const onSubmit = async (data: RFQFormData) => {
    setLoading(true);
    setSubmitLabel("Submitting...");
    try {
      const formData = new FormData();
      formData.append("user_id", "1");
      formData.append("rfq_title", data.rfqTitle);
      formData.append("rfq_category", category || "");
      formData.append("rfq_type", rfqType);
      formData.append("rfq_specification", data.rfqSpecification);
      formData.append("rfq_duedate", data.rfqDueDate);
      formData.append("is_active", "1");
      formData.append("is_release", "0");
      formData.append("is_locked", "0");
      formData.append("status", "0");

      const detailItems = materialSelections.map((entry) => {
        const mat = entry.selectedMaterial;

        const part_number = isMaterial(mat) ? mat.material_number : mat?.id || "";
        const description = isMaterial(mat)
          ? mat.material_description
          : mat?.Description || "";
        const uom = isMaterial(mat) ? mat.base_unit : mat?.uom || "";
        const matgroup = mat?.material_group || "";

        return {
          pr_number: "",
          pr_item: "",
          part_number: mat?.material_number || mat?.id || "",
          description: mat?.material_description || mat?.Description || "",
          pr_qty: 1,
          pr_uom: mat?.base_unit || mat?.uom || "",
          matgroup: mat?.material_group || "",
          source_type: category === "subcontractor" ? "subcontractor" : "vendor",
        };
      });
      formData.append("details", JSON.stringify(detailItems));

      if (data.rfqPicture?.length) {
        formData.append("rfqPicture", data.rfqPicture[0]);
      }
      if (data.rfqAttachment?.length) {
        formData.append("rfqAttachment", data.rfqAttachment[0]);
      }

      if (rfqType === "invitation") {
        const vendorIds = vendorSelections
          .map((v) => v.selectedVendor?.value)
          .filter((id) => id !== null && id !== undefined);

        if (vendorIds.length === 0) {
          Swal.fire("Warning", "Please select at least one vendor!", "warning");
          setLoading(false);
          setSubmitLabel("Submit");
          return;
        }

        formData.append("vendor", JSON.stringify(vendorIds));
        console.log("vendorSelections", vendorSelections);
        console.log("vendorIds", vendorSelections.map((v) => v.selectedVendor?.value));

      }


      await axios.post("http://localhost:3000/api/rfq", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({ icon: "success", title: "Success", text: "RFQ submitted successfully!" });
      reset();
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting RFQ:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.message || "Something went wrong while submitting the RFQ!",
      });
    } finally {
      setLoading(false);
      setSubmitLabel("Submit");
    }
  };

  const resetForm = () => {
    reset();
    setCategory(null);
    setRfqFrom(null);
    setMaterialSelections([{ selectedMaterial: null }]);
    setVendorSelections([{ selectedVendor: null }]);
    setRfqType("general");
    onClose();
  };
  const onInvalid = (errors: any) => {
  let errorMessages = "";
  for (const key in errors) {
    if (errors[key]?.message) {
      errorMessages += `• ${errors[key].message}\n`;
    }
  }

  Swal.fire({
    title: "Incomplete Form",
    text: errorMessages || "Please complete all required fields.",
    icon: "error",
    confirmButtonText: "OK",
  });
};



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full p-6 shadow-lg max-h-[90vh] overflow-auto">
        <div className="mb-4 border-b border-gray-300 pb-2 flex justify-between items-center">
          <h2 className="text-xl font-semibold">RFQ Submission</h2>
          <button
            onClick={resetForm}
            className="text-gray-600 hover:text-red-600 text-2xl font-bold"
            title="Close modal"
          >
            &times;
          </button>
        </div>


        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-6">
          {/* RFQ Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RFQ Title <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center border rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
              <div className="pl-3">
                <ArchiveBoxIcon className="w-5 h-5 text-gray-400" />
              </div>

              <input
                type="text"
                placeholder="Enter Title"
                className="w-full px-3 py-2 focus:outline-none rounded-r-lg"
                {...register("rfqTitle", { required: "RFQ Title is required." })}
              />
            </div>
            {errors.rfqTitle && (
              <p className="text-sm text-red-500 mt-1">{errors.rfqTitle.message}</p>
            )}
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <div className="text-center mb-4 relative">
              <h2 className="text-base text-gray-700 inline-block px-2 bg-white z-10 relative">
                Select Category <span className="text-red-600">*</span>
              </h2>

              <div className="absolute top-1/2 left-0 w-full border-t border-gray-200 z-0" />
            </div>

            <div className="flex justify-center gap-6 mb-6">
              {["vendor", "subcontractor"].map((type) => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="rfq_category"
                    value={type}
                    checked={category === type}
                    onChange={() => setCategory(type)}
                    className="hidden peer"
                  />
                  <span
                    className={`px-6 py-2 border rounded cursor-pointer transition ${category === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {type}
                  </span>
                </label>
              ))}
            </div>

            {category && (
              <div className="text-center mb-4 relative">
                <div className="text-sm text-gray-500 inline-block px-2 bg-white z-10 relative">
                  Choose From <span className="text-red-600">*</span>
                </div>

                <div className="absolute top-1/2 left-0 w-full border-t border-gray-200 z-0" />
              </div>
            )}

            {category && (
              <div className="flex justify-center gap-8">
                {[
                  { value: "forecast", label: "Forecast" },
                  //   { value: "pr_sap", label: "PR SAP" },
                ].map((item) => (
                  <label
                    key={item.value}
                    className="inline-flex items-center gap-2 text-gray-700 text-sm"
                  >
                    <input
                      type="radio"
                      name="radiofrom"
                      value={item.value}
                      checked={rfqFrom === item.value}
                      onChange={() => setRfqFrom(item.value)}
                      className="form-radio text-blue-600"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Forecast - Material Selection */}
          {rfqFrom === "forecast" && (
            <div className="border border-gray-300 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Forecast - Material Selection <span className="text-red-600">*</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border border-gray-200">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2 border">Part Number</th>
                      <th className="p-2 border">Material Group</th>
                      <th className="p-2 border">UoM</th>
                      <th className="p-2 border text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialSelections.map((entry, index) => (
                      <tr key={index} className="bg-white hover:bg-gray-50">
                        <td className="p-2 border">

                          <Select
                            options={optionsToUse}  // data material, subcont, atau vendor berdasarkan kategori
                            isClearable
                            placeholder="Select Item..."  // Sesuaikan placeholder
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}  // Pastikan dropdown muncul di luar kontainer
                            menuPosition="fixed"  // Pastikan dropdown tetap di posisi tetap di layar
                            styles={{
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999,  // Pastikan dropdown berada di atas elemen lain
                              }),
                              control: (provided) => ({
                                ...provided,
                                minHeight: '36px',  // Menyesuaikan tinggi kontrol dropdown jika diperlukan
                              })
                            }}
                            value={entry.selectedMaterial ? optionsToUse.find((opt) => opt.value === entry.selectedMaterial.material_number) : null}  // Sesuaikan dengan data yang dipilih
                            onChange={(selectedOption) => {
                              const fullMaterial = materialsToUse.find(
                                (mat) =>
                                  (isMaterial(mat) && mat.material_number === selectedOption?.value) ||
                                  (isSubcontractorMaterial(mat) && mat.id === selectedOption?.value)
                              );

                              // Update pilihan material/subcont/vendor
                              setMaterialSelections((prev) => {
                                const updated = [...prev];
                                updated[index] = {
                                  ...updated[index],
                                  selectedMaterial: fullMaterial || null,
                                };
                                return updated;
                              });
                            }}
                            className="w-full"
                            classNamePrefix="react-select"
                          />



                        </td>
                        <td className="p-2 border">
                          {entry.selectedMaterial?.material_group || "-"}
                        </td>
                        <td className="p-2 border">
                          {"base_unit" in (entry.selectedMaterial || {})
                            ? entry.selectedMaterial?.base_unit
                            : entry.selectedMaterial?.uom || "-"}
                        </td>


                        <td className="p-2 border text-center">
                          <div className="flex justify-center gap-2">
                            {/* Tombol tambah (+) hanya di baris terakhir */}
                            {index === materialSelections.length - 1 && (
                              <button
                                type="button"
                                onClick={addMaterialRow}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
                                aria-label="Add material row"
                              >
                                <FaPlus />
                              </button>
                            )}
                            {/* Tombol hapus (-) hanya di baris terakhir dan jika ada lebih dari satu baris */}
                            {materialSelections.length > 1 && index === materialSelections.length - 1 && (
                              <button
                                type="button"
                                onClick={() => removeMaterialRow(index)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1"
                                aria-label="Remove material row"
                              >
                                <FaMinus />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          )}

          {/* RFQ Picture Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              RFQ Picture <span className="text-xs text-gray-500">(Max 5MB)</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="w-full border rounded-lg p-2 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                {...register("rfqPicture", {
                  validate: fileList => {
                    const file = fileList?.[0];
                    if (!file) return true; // Boleh kosong, ganti pesan jika wajib
                    const allowed = ["image/jpeg", "image/png", "image/jpg"];
                    if (!allowed.includes(file.type)) return "Only JPG/JPEG/PNG are allowed";
                    if (file.size > 5 * 1024 * 1024) return "Maximum size 5MB";
                    return true;
                  }
                })}
              />
            </div>
            {errors.rfqPicture && (
              <p className="text-red-500 text-xs">{errors.rfqPicture.message as string}</p>
            )}
          </div>

          {/* RFQ Attachment Upload */}
          <div className="space-y-2 mt-4">
            <label className="block text-sm font-semibold text-gray-700">
              RFQ Attachment <span className="text-xs text-gray-500">(Max 5MB)</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                className="w-full border rounded-lg p-2 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                {...register("rfqAttachment", {
                  validate: fileList => {
                    const file = fileList?.[0];
                    if (!file) return true;
                    const allowed = [
                      "application/pdf",
                      "application/msword",
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    ];
                    if (!allowed.includes(file.type)) return "Only PDF/DOC/DOCX are allowed";
                    if (file.size > 5 * 1024 * 1024) return "Maximum size 5MB";
                    return true;
                  }
                })}
              />
            </div>
            {errors.rfqAttachment && (
              <p className="text-red-500 text-xs">{errors.rfqAttachment.message as string}</p>
            )}
          </div>


          {/* RFQ Specification */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              RFQ Specification
            </label>
            <textarea
              className="w-full border rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Provide detailed specifications..."
              {...register("rfqSpecification")}
            />
          </div>

          {/* Date & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                RFQ Due Date <span className="text-red-600">*</span>
              </label>

              <input
                type="date"
                className="w-full border rounded-lg p-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register("rfqDueDate", { required: "Due date is required." })}
                min={new Date().toISOString().split("T")[0]}  // Memastikan hanya tanggal hari ini atau lebih baru yang bisa dipilih
              />


              {errors.rfqDueDate && (
                <p className="text-sm text-red-500">{errors.rfqDueDate.message}</p>
              )}
            </div>
          </div>

          {/* RFQ Type (Radio Buttons) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              RFQ Type <span className="text-red-600">*</span>
            </label>

            <div className="flex items-center gap-4">
              <label>
                <input
                  type="radio"
                  value="general"
                  checked={rfqType === "general"}
                  onChange={() => setRfqType("general")}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2 text-sm">General</span>
              </label>
              <label>
                <input
                  type="radio"
                  value="invitation"
                  checked={rfqType === "invitation"}
                  onChange={() => setRfqType("invitation")}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2 text-sm">Invitation</span>
              </label>
            </div>
            {errors.rfqType && (
              <p className="text-sm text-red-500">{errors.rfqType.message}</p>
            )}
          </div>

          {/* Vendor Selection Table (only for Invitation) */}
          {rfqType === "invitation" && (
            <div className="border border-gray-300 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Selected Vendor <span className="text-red-600">*</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border border-gray-200">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Code</th>
                      <th className="p-2 border text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorSelections.map((entry, index) => (
                      <tr key={index} className="bg-white hover:bg-gray-50">
                        <td className="p-2 border">
                          <Select
                            options={vendors.filter(v =>
                              rfqType === "invitation" && category === "vendor"
                                ? v.vendor_type !== "Vendor SubCont"
                                : v.vendor_type === "Vendor SubCont"
                            )}
                            isClearable
                            placeholder="Select Vendor..."
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            menuPosition="fixed"
                            styles={{
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999,
                              }),
                              control: (provided) => ({
                                ...provided,
                                minHeight: '36px',
                              })
                            }}
                            value={entry.selectedVendor ? vendors.find((opt) => opt.value === entry.selectedVendor.vendor_id) : null}
                            onChange={(selectedOption) => {
                              const selectedVendor = vendors.find(
                                (v) => v.value === selectedOption?.value
                              );

                              setVendorSelections((prev) => {
                                const updated = [...prev];
                                updated[index] = {
                                  ...updated[index],
                                  selectedVendor: selectedVendor || null,
                                };
                                return updated;
                              });
                            }}
                            className="w-full"
                            classNamePrefix="react-select"
                          />
                        </td>
                        <td className="p-2 border">{entry.selectedVendor?.email || "-"}</td>
                        <td className="p-2 border">{entry.selectedVendor?.vendor_code || "-"}</td>
                        <td className="p-2 border text-center">
                          <div className="flex gap-2 justify-center">
                            {index === vendorSelections.length - 1 && (
                              <button
                                type="button"
                                onClick={addVendorRow}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
                              >
                                <FaPlus />
                              </button>
                            )}
                            {vendorSelections.length > 1 && index === vendorSelections.length - 1 && (
                              <button
                                type="button"
                                onClick={() => removeVendorRow(index)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1"
                              >
                                <FaMinus />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}



          {/* Submit Button */}
          <div className="modal-footer justify-end flex-shrink-0">
            <div className="flex gap-2">
              <button
                type="button"
                className="btn bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-block bg-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

