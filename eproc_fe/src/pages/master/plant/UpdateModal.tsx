import Modal from "@/components/Modal";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect } from "react";
import Swal from "sweetalert2";
import {
  HashtagIcon,
  MapPinIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

type PlantFormInputs = {
  plant: string;
  postcode: number;
  city: string;
  name: string;
};

type Props = {
  isModalOpen: boolean;
  onClose: () => void;
  setRefetch: (val: boolean) => void;
  isRefetch: boolean;
  selectedPlant: {
    plant_id: number;
    plant: string;
    postcode: number;
    city: string;
    name: string;
  } | null;
};

const schema: yup.ObjectSchema<PlantFormInputs> = yup.object({
  plant: yup.string().required("Plant code is required"),
  postcode: yup
    .number()
    .typeError("Postcode must be a number")
    .required("Postcode is required"),
  city: yup.string().required("City is required"),
  name: yup.string().required("Name is required"),
});

const UpdateModal = ({
  isModalOpen,
  onClose,
  setRefetch,
  isRefetch,
  selectedPlant,
}: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PlantFormInputs>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isModalOpen && selectedPlant) {
      reset({
        plant: selectedPlant.plant,
        postcode: selectedPlant.postcode,
        city: selectedPlant.city,
        name: selectedPlant.name,
      });
    }
  }, [isModalOpen, selectedPlant, reset]);

  const onSubmit = async (data: PlantFormInputs) => {
    try {
      const token = Cookies.get("token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/plants/${selectedPlant?.plant_id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        text: "Plant updated successfully",
        icon: "success",
        timer: 1500,
      });
      setRefetch(!isRefetch);
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire({
        text: "Failed to update plant",
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

  const inputFields: {
    name: keyof PlantFormInputs;
    label: string;
    placeholder: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      name: "plant",
      label: "Plant Code",
      placeholder: "Enter Plant Code",
      icon: HashtagIcon,
    },
    {
      name: "postcode",
      label: "Postcode",
      placeholder: "Enter Postcode",
      icon: MapPinIcon,
    },
    {
      name: "city",
      label: "City",
      placeholder: "Enter City",
      icon: BuildingOffice2Icon,
    },
    {
      name: "name",
      label: "Name",
      placeholder: "Enter Name",
      icon: BuildingOffice2Icon,
    },
  ];

  return (
    <Modal isModalOpen={isModalOpen}>
      <div className="modal-header">
        <h3 className="modal-title">Edit Plant</h3>
        <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
          <i className="ki-outline ki-cross" />
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body scrollable-y py-0 my-5 px-6 max-h-[65vh]">
          <div className="grid grid-cols-2 gap-4">
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
  name={name}
  control={control}
  render={({ field }) => (
    <input
      {...field}
      type={name === "postcode" ? "number" : "text"}
      placeholder={placeholder}
      className={clsx(
        "w-full px-3 py-2 focus:outline-none rounded-r-lg",
        name === "plant" && "bg-gray-100 cursor-not-allowed"
      )}
      readOnly={name === "plant"}
    />
  )}
/>

                </div>
                {errors[name] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[name]?.message}
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
