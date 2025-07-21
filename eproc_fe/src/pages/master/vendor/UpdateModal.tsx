import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type VendorFormInputs = {
  name: string;
  email: string;
  password: string;
  country_code?: string;
  postal_code?: string;
  address: string;
  vendor_code: string;
  phone_no: string;
  vendor_type: string;
  email_po?: string;
};

type Props = {
  isModalOpen: boolean;
  onClose: () => void;
  setRefetch: (val: boolean) => void;
  isRefetch: boolean;
  selectedVendor: {
    vendor_id: number;
    name: string;
    email: string;
    password: string;
    country_code: string;
    postal_code: string;
    address: string;
    vendor_code: string;
    phone_no: string;
    vendor_type: string;
    email_po: string;
  } | null;
};

const schema: yup.ObjectSchema<VendorFormInputs> = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().notRequired(),
  country_code: yup.string().notRequired(),
  postal_code: yup.string().notRequired(),
  address: yup.string().required("Address is required"),
  vendor_code: yup.string().required("Vendor code is required"),
  phone_no: yup.string().required("Phone number is required"),
  vendor_type: yup.string().required("Vendor type is required"),
  email_po: yup.string().email("Invalid email").notRequired(),
});

const vendorTypes = [
  "Vendor Local",
  "Vendor SubCont",
  "Vendor Import",
  "Vendor Catering",
  "Vendor Manpower",
  "Vendor B3 (Waste or EHS)",
];

const UpdateVendorModal = ({
  isModalOpen,
  onClose,
  setRefetch,
  isRefetch,
  selectedVendor,
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<VendorFormInputs>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isModalOpen && selectedVendor) {
      reset({
        name: selectedVendor.name,
        email: selectedVendor.email,
        password: "",
        country_code: selectedVendor.country_code || "",
        postal_code: selectedVendor.postal_code || "",
        address: selectedVendor.address,
        vendor_code: selectedVendor.vendor_code,
        phone_no: selectedVendor.phone_no,
        vendor_type: selectedVendor.vendor_type,
        email_po: selectedVendor.email_po || "",
      });
    }
  }, [isModalOpen, selectedVendor, reset]);

  const onSubmit = async (data: VendorFormInputs) => {
    try {
      const token = Cookies.get("token");

      const payload: any = {
        ...data,
        updated_at: new Date().toISOString(),
        last_modified_by: "",
      };
      if (!payload.password) delete payload.password;

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendors/${selectedVendor?.vendor_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        text: "Vendor updated successfully",
        icon: "success",
        timer: 1500,
      });
      setRefetch(!isRefetch);
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire({
        text: "Failed to update vendor",
        icon: "error",
      });
    }
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
    <Modal isModalOpen={isModalOpen}>
      <div className="modal-header">
        <h3 className="modal-title">Edit Vendor</h3>
        <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
          <i className="ki-outline ki-cross" />
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body scrollable-y py-0 my-5 px-6 max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "name", label: "Name", placeholder: "Enter name" },
              { name: "email", label: "Email", placeholder: "Enter email" },
              { name: "password", label: "New Password", placeholder: "Enter new password" },
              { name: "country_code", label: "Country Code", placeholder: "Enter country code" },
              { name: "postal_code", label: "Postal Code", placeholder: "Enter postal code" },
              { name: "address", label: "Address", placeholder: "Enter address" },
              { name: "vendor_code", label: "Vendor Code", placeholder: "Enter vendor code" },
              { name: "phone_no", label: "Phone Number", placeholder: "Enter phone number" },
              { name: "vendor_type", label: "Vendor Type", placeholder: "" },
              { name: "email_po", label: "Email PO", placeholder: "Enter email for PO" },
            ].map(({ name, label, placeholder }) => (
              <div className="form-group mb-2" key={name}>
                <label className="form-label mb-1">
                  {label}
                  {name !== "password" &&
                  name !== "country_code" &&
                  name !== "postal_code" &&
                  name !== "email_po" ? (
                    <span className="text-red-500"> *</span>
                  ) : null}
                </label>
                <Controller
                  name={name as keyof VendorFormInputs}
                  control={control}
                  render={({ field }) => {
                    if (name === "password") {
                      return (
                        <div className="relative flex items-center">
                          <input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder={placeholder}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none pr-10"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-2 text-gray-400 hover:text-gray-700"
                          >
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                          </button>
                        </div>
                      );
                    }

                    if (name === "vendor_type") {
                      return (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white"
                        >
                          <option value="">Select Category</option>
                          {vendorTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      );
                    }

                    return (
                      <input
                        {...field}
                        type="text"
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                      />
                    );
                  }}
                />
                {errors[name as keyof VendorFormInputs] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[name as keyof VendorFormInputs]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
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
              className="btn bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-md"
            >
              Update
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateVendorModal;
