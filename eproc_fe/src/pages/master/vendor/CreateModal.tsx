import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export type VendorFormInputs = {
  name: string;
  email: string;
  password: string;
  countryCode?: string;
  postalCode?: string;
  address: string;
  vendorCode: string;
  phoneNo: string;
  vendorType: string;
  emailPO?: string;
};

const schema: yup.ObjectSchema<VendorFormInputs> = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email().required("Email is required"),
  password: yup.string().required("Password is required"),
  countryCode: yup.string().optional(),
  postalCode: yup.string().optional(),
  address: yup.string().required("Address is required"),
  vendorCode: yup.string().required("Vendor Code is required"),
  phoneNo: yup.string().required("Phone Number is required"),
  vendorType: yup.string().required("Vendor Type is required"),
  emailPO: yup.string().email("Invalid Email PO").optional(),
});

const CreateVendorModal = ({ isModalOpen, onClose, setRefetch, isRefetch }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VendorFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      countryCode: "",
      postalCode: "",
      address: "",
      vendorCode: "",
      phoneNo: "",
      vendorType: "",
      emailPO: "",
    },
  });

  useEffect(() => {
    if (!isModalOpen) reset();
  }, [isModalOpen, reset]);

  const onSubmit = async (data: VendorFormInputs) => {
    try {
      const token = Cookies.get("token");
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        country_code: data.countryCode,
        postal_code: data.postalCode,
        address: data.address,
        vendor_code: data.vendorCode,
        phone_no: data.phoneNo,
        vendor_type: data.vendorType,
        email_po: data.emailPO,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "",
        last_modified_by: "",
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/vendors`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        text: "Vendor created successfully",
        icon: "success",
        timer: 1500,
      });

      setRefetch(!isRefetch);
      onClose();
      reset();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error Creating Vendor",
        text: error?.response?.data?.message || "Something went wrong",
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
  const inputFields = [
    { name: "name", label: "Vendor Name" },
    { name: "email", label: "Email" },
    { name: "password", label: "Password" },
    { name: "phoneNo", label: "Phone Number" },
    { name: "vendorType", label: "Vendor Type" },
    { name: "address", label: "Address" },
    { name: "vendorCode", label: "Vendor Code" },
    { name: "countryCode", label: "Country Code" },
    { name: "postalCode", label: "Postal Code" },
    { name: "emailPO", label: "Email PO" },
  ];

  return (
    <Modal isModalOpen={isModalOpen}>
      <div className="modal-header">
        <h3 className="modal-title">Add Vendor</h3>
        <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
          <i className="ki-outline ki-cross" />
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body scrollable-y py-0 my-4 px-7 max-h-[50vh]">
          <div className="grid grid-cols-2 gap-4">
            {inputFields.map(({ name, label }) => (
              <div className="form-group mb-2" key={name}>
                <label className="form-label mb-1">
                  {label}
                  {(name !== "countryCode" && name !== "postalCode" && name !== "emailPO") && (
                    <span className="text-red-500"> *</span>
                  )}
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
                            placeholder={`Enter ${label}`}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-2 text-gray-400 hover:text-gray-700"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <span role="img" aria-label="Hide password"><FaEye /></span>
                            ) : (
                              <span role="img" aria-label="Show password"><FaEyeSlash /></span>
                            )}
                          </button>
                        </div>
                      );
                    } else if (name === "vendorType") {
                      return (
                        <select
                          {...field}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white"
                        >
                          <option value="">Select Category</option>
                          <option value="Vendor Local">Vendor Local</option>
                          <option value="Vendor SubCont">Vendor SubCont</option>
                          <option value="Vendor Import">Vendor Import</option>
                          <option value="Vendor Catering">Vendor Catering</option>
                          <option value="Vendor Manpower">Vendor Manpower</option>
                          <option value="Vendor B3EHS">Vendor B3 (Waste or EHS)</option>
                        </select>
                      );
                    }
                    return (
                      <input
                        {...field}
                        type="text"
                        placeholder={`Enter ${label}`}
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
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateVendorModal;
