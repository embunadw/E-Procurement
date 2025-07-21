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
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";

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

type CreateModalProps = {
  isModalOpen: boolean;
  onClose: () => void;
  setRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  isRefetch: boolean;
};

const schema: yup.ObjectSchema<MaterialFormInputs> = yup.object({
  material_number: yup.string().required("Material number is required"),
  material_description: yup.string().required("Material description is required"),
  material_group_id: yup.string().required("Material group is required"),
  material_group_description: yup.string().required("Material group description is required"),
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

const CreateModal = ({ isModalOpen, onClose, setRefetch, isRefetch }: CreateModalProps) => {
  const [materialGroups, setMaterialGroups] = useState<MaterialGroup[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [queryGroup, setQueryGroup] = useState("");
  const [queryPlant, setQueryPlant] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<MaterialFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      material_number: "",
      material_description: "",
      material_group_id: "",
      material_group_description: "",
      material_type: "",
      base_unit: "",
      plant_id: "",
    },
  });

  const selectedMaterialGroupId = useWatch({ control, name: "material_group_id" });
  const selectedMaterialGroup = materialGroups.find(
    (group) => String(group.material_group_id) === selectedMaterialGroupId
  );

  const filteredMaterialGroups = materialGroups.filter((group) =>
    group.material_group.toLowerCase().includes(queryGroup.toLowerCase())
  );

  const filteredPlants = plants.filter((plant) =>
    plant.plant.toLowerCase().includes(queryPlant.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        const [groupRes, plantRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/material-groups?limit=5000&page=1`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/plants?limit=5000&page=1`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setMaterialGroups(groupRes.data.data.data || []);
        setPlants(plantRes.data.data.data || []);
      } catch (err: any) {
        Swal.fire({ icon: "error", title: "Failed to retrieve data", text: err.response?.data?.message || "Unknown error" });
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMaterialGroup) {
      setValue("material_group_description", selectedMaterialGroup.material_group_description);
      setValue("material_type", selectedMaterialGroup.material_type);
    } else {
      setValue("material_group_description", "");
      setValue("material_type", "");
    }
  }, [selectedMaterialGroup, setValue]);

  useEffect(() => {
    if (!isModalOpen) reset();
  }, [isModalOpen, reset]);

  const onSubmit = async (data: MaterialFormInputs) => {
    try {
      const token = Cookies.get("token");
      const user_id = Number(Cookies.get("user_id"));
      if (!token || isNaN(user_id)) {
        Swal.fire({ text: "Unauthorized", icon: "error" });
        return;
      }
      const payload = {
        material_group_id: Number(data.material_group_id),
        material_number: data.material_number,
        material_description: data.material_description,
        base_unit: data.base_unit,
        plant_id: Number(data.plant_id),
        user_id,
      };
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/materials`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 201) {
        Swal.fire({ text: "Material submitted successfully", icon: "success", timer: 1500, showConfirmButton: false });
        setRefetch(!isRefetch);
        onClose();
        reset();
      }
    } catch (error) {
      Swal.fire({ text: "Failed to add material", icon: "error" });
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
        <h3 className="modal-title">Add Material</h3>
        <button className="btn btn-xs btn-icon btn-light" onClick={onClose} type="button">
          <i className="ki-outline ki-cross" />
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body scrollable-y py-0 my-5 px-6 max-h-[65vh]">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(fieldIcons).map(([name, Icon]) => {
              const isSelect = name === "material_group_id" || name === "plant_id";
              const isReadOnly = name === "material_group_description" || name === "material_type";
              const label = name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
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
                      name={name as keyof MaterialFormInputs}
                      control={control}
                      render={({ field }) => {
                        if (name === "material_group_id") {
                          return (
                            <Combobox value={field.value} onChange={field.onChange}>
                              {({ open }) => (
                                <div className="relative w-full">
                                  <Combobox.Input
                                    onChange={(e) => setQueryGroup(e.target.value)}
                                    displayValue={() =>
                                      materialGroups.find((g) => String(g.material_group_id) === field.value)?.material_group || ""
                                    }
                                    className="w-full px-3 py-2 bg-white focus:outline-none rounded-r-lg"
                                    placeholder="Search material group..."
                                  />
                                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                  </Combobox.Button>
                                  {open && (
                                    <Combobox.Options className="absolute z-10 mt-1 max-h-[400px] w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 text-sm">
                                      {filteredMaterialGroups.length === 0 ? (
                                        <div className="cursor-default select-none px-4 py-2 text-gray-500">No material group found.</div>
                                      ) : (
                                        filteredMaterialGroups.map((group) => (
                                          <Combobox.Option
                                            key={group.material_group_id}
                                            value={String(group.material_group_id)}
                                            className={({ active }) =>
                                              `cursor-pointer select-none px-4 py-2 ${active ? "bg-gray-100" : ""}`
                                            }
                                          >
                                            {group.material_group}
                                          </Combobox.Option>
                                        ))
                                      )}
                                    </Combobox.Options>
                                  )}
                                </div>
                              )}
                            </Combobox>
                          );
                        } else if (name === "plant_id") {
                          return (
                            <Combobox value={field.value} onChange={field.onChange}>
                              {({ open }) => (
                                <div className="relative w-full">
                                  <Combobox.Input
                                    onChange={(e) => setQueryPlant(e.target.value)}
                                    displayValue={() =>
                                      plants.find((p) => String(p.plant_id) === field.value)?.plant || ""
                                    }
                                    className="w-full px-3 py-2 bg-white focus:outline-none rounded-r-lg"
                                    placeholder="Search plant..."
                                  />
                                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
                                  </Combobox.Button>
                                  {open && (
                                    <Combobox.Options className="absolute z-10 mt-1 max-h-[400px] w-full overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 text-sm">
                                      {filteredPlants.length === 0 ? (
                                        <div className="cursor-default select-none px-4 py-2 text-gray-500">No plant found.</div>
                                      ) : (
                                        filteredPlants.map((plant) => (
                                          <Combobox.Option
                                            key={plant.plant_id}
                                            value={String(plant.plant_id)}
                                            className={({ active }) =>
                                              `cursor-pointer select-none px-4 py-2 ${active ? "bg-gray-100" : ""}`
                                            }
                                          >
                                            {plant.plant}
                                          </Combobox.Option>
                                        ))
                                      )}
                                    </Combobox.Options>
                                  )}
                                </div>
                              )}
                            </Combobox>
                          );
                        } else {
                          return (
                            <input
                              {...field}
                              type="text"
                              readOnly={isReadOnly}
                              className={`w-full px-3 py-2 focus:outline-none rounded-r-lg ${
                                isReadOnly ? "bg-gray-100" : "bg-white"
                              }`}
                            />
                          );
                        }
                      }}
                    />
                  </div>
                  {errors[name as keyof MaterialFormInputs] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[name as keyof MaterialFormInputs]?.message}
                    </p>
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
