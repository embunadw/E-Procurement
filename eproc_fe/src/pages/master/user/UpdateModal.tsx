import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import {
  UserIcon,
  KeyIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

// Define input types
type UserFormInputs = {
  username: string;
  password?: string;
  role: string;
  personal_number: string;
  dept: string;
  department: string;
  division: string;
  email_sf: string;
};

// Props type for UpdateModal
type Props = {
  isModalOpen: boolean;
  onClose: () => void;
  setRefetch: (val: boolean) => void;
  isRefetch: boolean;
  selectedUser: any;
};

const schema: yup.ObjectSchema<UserFormInputs> = yup.object({
  username: yup.string().required("Username is required"),
password: yup
  .string()
  .nullable()
  .transform((curr, orig) => (orig === "" ? null : curr))
  .min(6, "Password must be at least 6 characters")
  .max(12, "Password must be at most 12 characters"),

  role: yup.string().required("Role is required"),
  personal_number: yup
    .string()
    .required("Personal Number is required")
    .matches(/^\d+$/, "Personal Number must contain only digits")
    .max(15, "Personal Number must be at most 15 digits"),
  dept: yup.string().required("Dept is required"),
  department: yup.string().required("Department is required"),
  division: yup.string().required("Division is required"),
  email_sf: yup.string().email("Invalid email").required("Email is required"),
});

const roleOptions = [
  { label: "Patria", value: "patria" },
  { label: "Manager", value: "manager" },
];

const UpdateModal = ({
  isModalOpen,
  onClose,
  setRefetch,
  isRefetch,
  selectedUser,
}: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UserFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      role: "",
      personal_number: "",
      dept: "",
      department: "",
      division: "",
      email_sf: "",
    },
  });

  useEffect(() => {
    if (selectedUser && isModalOpen) {
      setValue("username", selectedUser.username || "");
      setValue("role", selectedUser.role || "");
      setValue("personal_number", selectedUser.personal_number || "");
      setValue("dept", selectedUser.dept || "");
      setValue("department", selectedUser.department || "");
      setValue("division", selectedUser.division || "");
      setValue("email_sf", selectedUser.email_sf || "");
      setValue("password", "");
    }

    if (!isModalOpen) reset();
  }, [selectedUser, isModalOpen, setValue, reset]);

  const onSubmit = async (data: UserFormInputs) => {
    try {
      const token = Cookies.get("token");

      const payload = { ...data };
      if (!data.password) delete payload.password;

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${selectedUser.user_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          text: "User updated successfully",
          icon: "success",
          timer: 1500,
        });
        setRefetch(!isRefetch);
        onClose();
        reset();
      }
    } catch (error: any) {
      console.error("Update user failed:", error?.response?.data || error.message);
      Swal.fire({
        text: error?.response?.data?.message || "Failed to update user",
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

const [showPassword, setShowPassword] = useState(false);
useEffect(() => {
  if (isModalOpen) {
    setShowPassword(false); // reset toggle
    if (selectedUser) {
      setValue("password", selectedUser.password || ""); // ini yang penting
    }
  }
}, [isModalOpen, selectedUser, setValue]);

  return (
    <Modal isModalOpen={isModalOpen}>
      <div className="modal-header">
        <h3 className="modal-title">Update User</h3>
        <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
          <i className="ki-outline ki-cross" />
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body scrollable-y py-0 my-5 px-6 max-h-[50vh]">
          <div className="grid grid-cols-2 gap-4">
            {/* Username */}
            <div className="form-group mb-2">
              <label className="form-label mb-1">
                Username<span className="text-red-500"> *</span>
              </label>
              <div className="flex items-center border rounded-lg shadow-sm bg-gray-100 cursor-not-allowed">
                <div className="pl-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                </div>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Enter username"
                      className="w-full px-3 py-2 focus:outline-none rounded-r-lg bg-gray-100"
                      readOnly
                    />
                  )}
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

<div className="form-group mb-2">
  <label className="form-label mb-1">Password</label>
  <div className="flex items-center border rounded-lg shadow-sm bg-white relative">
    <div className="pl-3">
      <KeyIcon className="w-5 h-5 text-gray-400" />
    </div>
    <Controller
      name="password"
      control={control}
      render={({ field }) => (
        <input
          {...field}
          type={showPassword ? "text" : "password"}
          placeholder="Enter new password"
          className="w-full px-3 py-2 focus:outline-none rounded-r-lg"
        />
      )}
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-2 text-gray-400"
    >
      {showPassword ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 013.174-4.375M6.694 6.694A9.957 9.957 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.955 9.955 0 01-1.227 2.592M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
        </svg>
      )}
    </button>
  </div>
  {errors.password && (
    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
  )}
</div>



            {/* Personal Number */}
            <div className="form-group mb-2">
              <label className="form-label mb-1">
                Personal Number<span className="text-red-500"> *</span>
              </label>
            <Controller
  name="personal_number"
  control={control}
  render={({ field }) => (
    <input
      {...field}
      type="text"
      maxLength={15}
      onInput={(e) => {
        const digitsOnly = e.currentTarget.value.replace(/\D/g, "");
        e.currentTarget.value = digitsOnly.slice(0, 13);
        field.onChange(e);
      }}
      placeholder="Enter personal number"
      className="w-full px-3 py-2 border rounded-lg"
    />
  )}

              />
              {errors.personal_number && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.personal_number.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="form-group mb-2">
              <label className="form-label mb-1">
                Email<span className="text-red-500"> *</span>
              </label>
              <Controller
                name="email_sf"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    placeholder="Enter email"
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                    readOnly
                  />
                )}
              />
              {errors.email_sf && (
                <p className="text-red-500 text-sm mt-1">{errors.email_sf.message}</p>
              )}
            </div>

            {/* Role */}
            <div className="form-group mb-2 col-span-2">
              <label className="form-label mb-1">
                Role<span className="text-red-500"> *</span>
              </label>
              <div className="flex items-center border rounded-lg shadow-sm bg-white">
                <div className="pl-3">
                  <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                </div>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 bg-white focus:outline-none rounded-r-lg"
                    >
                      <option value="">Select Role</option>
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
              )}
            </div>
{[
  {
    name: "dept",
    label: "Dept Code",
    options: [
      { value: "", label: "Select Dept Code" },
      { value: "VM", label: "VM" },
      { value: "SD", label: "SD" },
    ],
  },
  {
    name: "department",
    label: "Department",
    options: [
      { value: "", label: "Select Department" },
      { value: "Vendor Management", label: "Vendor Management" },
      { value: "Subcont Development", label: "Subcont Development" },
    ],
  },
  {
    name: "division",
    label: "Division",
    options: [
      { value: "", label: "Select Division" },
      { value: "Supply Chain Management", label: "Supply Chain Management" },
    ],
  },
].map(({ name, label, options }) => (
  <div className="form-group mb-2 col-span-2" key={name}>
    <label className="form-label mb-1">
      {label}
      <span className="text-red-500"> *</span>
    </label>
    <Controller
      name={name as keyof UserFormInputs}
      control={control}
      render={({ field }) => (
        <select
          {...field}
          className="w-full px-3 py-2 border rounded-lg"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    />
    {errors[name as keyof UserFormInputs] && (
      <p className="text-red-500 text-sm mt-1">
        {errors[name as keyof UserFormInputs]?.message}
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

export default UpdateModal;
