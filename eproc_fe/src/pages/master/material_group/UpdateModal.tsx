import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { Squares2X2Icon, ArchiveBoxIcon } from "@heroicons/react/24/outline";

// Tipe data untuk input form
type MaterialGroupFormInputs = {
  material_type: string;
  material_group: string;
  material_group_description: string;
};

// Validasi form dengan Yup
const schema: yup.ObjectSchema<MaterialGroupFormInputs> = yup.object({
  material_type: yup.string().required("Material type is required"),
  material_group: yup.string().required("Material group is required"),
  material_group_description: yup
    .string()
    .required("Group description is required"),
});

const UpdateModal = ({
  isModalOpen,
  onClose,
  setRefetch,
  isRefetch,
  selectedMaterialGroup,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MaterialGroupFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      material_type: "",
      material_group: "",
      material_group_description: "",
    },
  });

  useEffect(() => {
    if (isModalOpen && selectedMaterialGroup) {
      setValue("material_type", selectedMaterialGroup.material_type);
      setValue("material_group", selectedMaterialGroup.material_group);
      setValue("material_group_description", selectedMaterialGroup.material_group_description);
    }
    if (!isModalOpen) reset();
  }, [isModalOpen, selectedMaterialGroup, setValue, reset]);

  const onSubmit = async (data: MaterialGroupFormInputs) => {
    try {
      const token = Cookies.get("token");

      if (!token) {
        Swal.fire({
          text: "No authorization token found.",
          icon: "error",
        });
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/material-groups/${selectedMaterialGroup.material_group_id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          text: "Material group updated successfully",
          icon: "success",
          timer: 1500,
        });
        setRefetch(!isRefetch);
        onClose();
        reset();
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        text: "Failed to update material group",
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
        <h3 className="modal-title">Update Material Group</h3>
        <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
          <i className="ki-outline ki-cross" />
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body scrollable-y py-0 my-5 px-6 max-h-[65vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Material Type */}
            <div className="form-group mb-2">
              <label className="form-label mb-1">
                Material Type<span className="text-red-500"> *</span>
              </label>
              <div className="flex items-center border rounded-lg shadow-sm bg-gray-100 cursor-not-allowed">
                <div className="pl-3">
                  <Squares2X2Icon className="w-5 h-5 text-gray-400" />
                </div>
                <Controller
                  name="material_type"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      readOnly
                      className="w-full px-3 py-2 focus:outline-none rounded-r-lg bg-gray-100"
                    />
                  )}
                />
              </div>
              {errors.material_type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.material_type.message}
                </p>
              )}
            </div>

            {/* Material Group */}
            <div className="form-group mb-2">
              <label className="form-label mb-1">
                Material Group<span className="text-red-500"> *</span>
              </label>
              <div className="flex items-center border rounded-lg shadow-sm bg-gray-100 cursor-not-allowed">
                <div className="pl-3">
                  <Squares2X2Icon className="w-5 h-5 text-gray-400" />
                </div>
                <Controller
                  name="material_group"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      readOnly
                      className="w-full px-3 py-2 focus:outline-none rounded-r-lg bg-gray-100"
                    />
                  )}
                />
              </div>
              {errors.material_group && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.material_group.message}
                </p>
              )}
            </div>

            {/* Material Group Description */}
            <div className="form-group mb-2">
              <label className="form-label mb-1">
                Group Description<span className="text-red-500"> *</span>
              </label>
              <div className="flex items-center border rounded-lg shadow-sm bg-white">
                <div className="pl-3">
                  <ArchiveBoxIcon className="w-5 h-5 text-gray-400" />
                </div>
                <Controller
                  name="material_group_description"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full px-3 py-2 focus:outline-none rounded-r-lg"
                    />
                  )}
                />
              </div>
              {errors.material_group_description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.material_group_description.message}
                </p>
              )}
            </div>
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
