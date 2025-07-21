import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm, useWatch } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import {
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon,
  IdentificationIcon,
  HashtagIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

type MaterialFormInputs = {
  material_number: string;
  material_description: string;
  material_group_id: string;
  material_group_description: string;
  material_type: string;
  base_unit: string;
  plant_id: string;
};

type MaterialGroup = {
  material_group_id: number;
  material_group: string;
  material_group_description: string;
  material_type: string;
};

type Plant = {
  plant_id: number;
  plant: string;
};

type UpdateModalProps = {
  isModalOpen: boolean;
  onClose: () => void;
  setRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  isRefetch: boolean;
  selectedMaterial: any;
};

const schema: yup.ObjectSchema<MaterialFormInputs> = yup.object({
  material_number: yup.string().required("Material number is required"),
  material_description: yup.string().required("Material description is required"),
  material_group_id: yup.string().required("Material group is required"),
  material_group_description: yup.string().required("Group description is required"),
  material_type: yup.string().required("Material type is required"),
  base_unit: yup.string().required("Base unit is required"),
  plant_id: yup.string().required("Plant is required"),
});

const fieldIcons: Record<keyof MaterialFormInputs, React.ElementType> = {
  material_number: HashtagIcon,
  material_description: ClipboardDocumentListIcon,
  material_group_id: ArchiveBoxIcon,
  material_group_description: Squares2X2Icon,
  material_type: IdentificationIcon,
  base_unit: HashtagIcon,
  plant_id: MapPinIcon,
};

const UpdateModal = ({
  isModalOpen,
  onClose,
  setRefetch,
  isRefetch,
  selectedMaterial,
}: UpdateModalProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MaterialFormInputs>({
    resolver: yupResolver(schema),
  });

  const [materialGroups, setMaterialGroups] = useState<MaterialGroup[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);

  const selectedMaterialGroupId = useWatch({ control, name: "material_group_id" });

  const selectedMaterialGroup = materialGroups.find(
    (group) => String(group.material_group_id) === selectedMaterialGroupId
  );

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = Cookies.get("token");

        const [groupRes, plantRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/material-groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/plants`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setMaterialGroups(groupRes.data.data.data || []);
        setPlants(plantRes.data.data.data || []);
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
        Swal.fire({ icon: "error", text: "Failed to load dropdown data" });
      }
    };

    if (isModalOpen && selectedMaterial) {
      fetchOptions();
    } else {
      reset();
      setMaterialGroups([]);
      setPlants([]);
    }
  }, [isModalOpen, selectedMaterial, reset]);

  useEffect(() => {
    if (
      isModalOpen &&
      selectedMaterial &&
      materialGroups.length > 0 &&
      plants.length > 0
    ) {
      const matchedMaterialGroup = materialGroups.find(
        (g) => g.material_group === selectedMaterial.material_group
      );
      const matchedPlant = plants.find((p) => p.plant === selectedMaterial.plant);

      setValue("material_number", selectedMaterial.material_number || "");
      setValue("material_description", selectedMaterial.material_description || "");
      setValue("material_group_id", matchedMaterialGroup ? String(matchedMaterialGroup.material_group_id) : "");
      setValue("material_group_description", selectedMaterial.material_group_description || "");
      setValue("material_type", selectedMaterial.material_type || "");
      setValue("base_unit", selectedMaterial.base_unit || "");
      setValue("plant_id", matchedPlant ? String(matchedPlant.plant_id) : "");
    }
  }, [isModalOpen, selectedMaterial, materialGroups, plants, setValue]);

  useEffect(() => {
    if (selectedMaterialGroup) {
      setValue("material_group_description", selectedMaterialGroup.material_group_description || "");
      setValue("material_type", selectedMaterialGroup.material_type || "");
    }
  }, [selectedMaterialGroup, setValue]);

  const onSubmit = async (data: MaterialFormInputs) => {
    if (!selectedMaterial?.material_id) {
      Swal.fire({ text: "Material ID tidak ditemukan", icon: "error" });
      return;
    }

    try {
      const token = Cookies.get("token");

      const payload = {
        material_number: data.material_number,
        material_description: data.material_description,
        material_group_id: Number(data.material_group_id),
        base_unit: data.base_unit,
        plant_id: Number(data.plant_id),
        user_id: Number(Cookies.get("user_id")),
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/materials/${selectedMaterial.material_id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          text: "Material updated successfully.",
          icon: "success",
          timer: 1500,
        });
        setRefetch(!isRefetch);
        onClose();
        reset();
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ text: "Failed to update materials", icon: "error" });
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

  const fields: {
    name: keyof MaterialFormInputs;
    label: string;
    isSelect?: boolean;
    readOnly?: boolean;
    options?: { value: string; label: string }[];
  }[] = [
    {
      name: "material_number",
      label: "Material Number",
      readOnly: true,
    },
    {
      name: "material_description",
      label: "Material Description",
    },
    {
      name: "material_group_id",
      label: "Material Group",
      isSelect: true,
      options: materialGroups.map((g) => ({
        value: String(g.material_group_id),
        label: g.material_group,
      })),
    },
    {
      name: "material_group_description",
      label: "Group Description",
      readOnly: true,
    },
    {
      name: "material_type",
      label: "Material Type",
      readOnly: true,
    },
    {
      name: "base_unit",
      label: "Base Unit",
    },
    {
      name: "plant_id",
      label: "Plant",
      isSelect: true,
      options: plants.map((p) => ({
        value: String(p.plant_id),
        label: p.plant,
      })),
    },
  ];

  return (
    <Modal isModalOpen={isModalOpen}>
      <div className="modal-header">
        <h3 className="modal-title">Update Material</h3>
        <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
          <i className="ki-outline ki-cross" />
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body scrollable-y py-0 my-5 px-6 max-h-[65vh]">
          <div className="grid grid-cols-2 gap-4">
            {fields.map(({ name, label, isSelect, readOnly, options }) => {
              const Icon = fieldIcons[name];
              return (
                <div key={name} className="form-group mb-2">
                  <label className="form-label mb-1">
                    {label} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border rounded-lg shadow-sm bg-white">
                    <div className="pl-3">
                      <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <Controller
                      name={name}
                      control={control}
                      render={({ field }) =>
                        isSelect ? (
                          <select
                            {...field}
                            className="w-full px-3 py-2 focus:outline-none rounded-r-lg bg-white"
                          >
                            <option value="">Select...</option>
                            {options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            {...field}
                            type="text"
                            readOnly={readOnly}
                            className={`w-full px-3 py-2 focus:outline-none rounded-r-lg ${
                              readOnly ? "bg-gray-100" : "bg-white"
                            }`}
                          />
                        )
                      }
                    />
                  </div>
                  {errors[name] && (
                    <p className="text-red-500 text-sm mt-1">{errors[name]?.message}</p>
                  )}
                </div>
              );
            })}
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
