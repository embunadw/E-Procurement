import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { Squares2X2Icon, ArchiveBoxIcon, IdentificationIcon } from "@heroicons/react/24/outline";

// Form type
type MaterialGroupFormInputs = {
  material_type: string;
  material_group: string;
  material_group_description?: string;
};

// Validation Schema
const schema: yup.ObjectSchema<MaterialGroupFormInputs> = yup.object({
  material_type: yup.string().required("Material type is required"),
  material_group: yup.string().required("Material group is required"),
  material_group_description: yup.string().required("Material group description is required"),
});

// Input fields definition
const inputFields = [
  {
    name: "material_type",
    label: "Material Type",
    placeholder: "Enter Material Type",
    icon: IdentificationIcon,
  },
  {
    name: "material_group",
    label: "Material Group",
    placeholder: "Enter Material Group",
    icon: Squares2X2Icon,
  },
  {
    name: "material_group_description",
    label: "Group Description",
    placeholder: "Enter Group Description",
    icon: ArchiveBoxIcon,
  },
];

const CreateModal = ({ isModalOpen, onClose, setRefetch, isRefetch }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MaterialGroupFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      material_type: "",
      material_group: "",
      material_group_description: "",
    },
  });

  useEffect(() => {
    if (isModalOpen) {
      reset(); // Reset the form when modal opens
    }
  }, [isModalOpen, reset]);

const onSubmit = async (data: MaterialGroupFormInputs) => {
  try {
    const token = Cookies.get("token");
    const user_id = Cookies.get("user_id");

    if (!token || !user_id) {
      Swal.fire({
        text: "No authorization token or user ID found.",
        icon: "error",
      });
      return;
    }

    const requestData = {
      ...data,
      user_id,
    };

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/material-groups`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 201) {
      Swal.fire({
        text: "Material Group added successfully",
        icon: "success",
        timer: 1500,
      });
      setRefetch(!isRefetch);
      onClose();
      reset();
    }
  } catch (error: any) {
    const errMsg =
      error?.response?.data?.message ||
      "Failed to add Material Group";

    if (
      error?.response?.status === 400 &&
      errMsg.includes("material_type") &&
      errMsg.includes("material_group")
    ) {
      Swal.fire({
        text: "The combination of Material Type and Material Group has been used.",
        icon: "error",
      });
    } else {
      Swal.fire({
        text: errMsg,
        icon: "error",
      });
    }

    console.error("Error during saving material group:", error);
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
        <h3 className="modal-title">Add Material Group</h3>
        <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
          <i className="ki-outline ki-cross" />
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body scrollable-y py-0 my-5 px-6 max-h-[65vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inputFields.map(({ name, label, placeholder, icon: Icon }) => (
              <div className="form-group mb-2" key={name}>
                <label className="form-label mb-1">
                  {label}
                  
                    <span className="text-red-500"> *</span>
                  
                </label>
                <div className="flex items-center border rounded-lg shadow-sm bg-white">
                  <div className="pl-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <Controller
                    name={name as keyof MaterialGroupFormInputs}
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder={placeholder}
                        className="w-full px-3 py-2 focus:outline-none rounded-r-lg"
                      />
                    )}
                  />
                </div>
                {errors[name as keyof MaterialGroupFormInputs] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[name as keyof MaterialGroupFormInputs]?.message}
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

export default CreateModal;
