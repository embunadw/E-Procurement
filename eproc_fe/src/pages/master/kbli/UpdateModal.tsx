import React, { useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import Modal from "@/components/Modal";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  HashtagIcon,
  CalendarIcon,
  DocumentTextIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

type KbliFormInputs = {
  year: string;
  code: string;
  title: string;
  description: string;
};

type Props = {
  isModalOpen: boolean;
  onClose: () => void;
  setRefetch: (val: boolean) => void;
  isRefetch: boolean;
  selectedKbli: {
    id: number;
    year: string;
    code: string;
    title: string;
    description: string;
  } | null;
};

const schema: yup.ObjectSchema<KbliFormInputs> = yup.object({
  year: yup
    .string()
    .matches(/^\d{4}$/, "Year must be a 4-digit number")
    .required("Year is required"),
  code: yup
    .string()
    .length(5, "KBLI Code must be exactly 5 characters")
    .required("KBLI Code is required"),
  title: yup.string().required("KBLI Title is required"),
  description: yup.string().required("Description is required"),
});

const UpdateKbliModal = ({
  isModalOpen,
  onClose,
  setRefetch,
  isRefetch,
  selectedKbli,
}: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<KbliFormInputs>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isModalOpen && selectedKbli) {
      reset({
        year: selectedKbli.year,
        code: selectedKbli.code,
        title: selectedKbli.title,
        description: selectedKbli.description,
      });
    }
  }, [isModalOpen, selectedKbli, reset]);

  const onSubmit = async (data: KbliFormInputs) => {
    try {
      const token = Cookies.get("token");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/kblis/${selectedKbli?.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        text: "KBLI updated successfully",
        icon: "success",
        timer: 1500,
      });

      setRefetch(!isRefetch);
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire({
        text: "Failed to update KBLI",
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
  const inputFields = [
    {
      name: "year",
      label: "Year",
      placeholder: "Enter Year (e.g. 2020)",
      icon: CalendarIcon,
    },
    {
      name: "code",
      label: "KBLI Code",
      placeholder: "Enter KBLI Code",
      icon: HashtagIcon,
    },
    {
      name: "title",
      label: "KBLI Title",
      placeholder: "Enter KBLI Title",
      icon: DocumentTextIcon,
    },
    {
      name: "description",
      label: "Description",
      placeholder: "Enter Description",
      icon: PencilIcon,
    },
  ];

  return (
    <Modal isModalOpen={isModalOpen}>
      <div className="modal-header">
        <h3 className="modal-title">Edit KBLI</h3>
        <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
          <i className="ki-outline ki-cross" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body overflow-y-auto py-0 mt-2 px-6 max-h-[65vh]">
          <div className="grid grid-cols-2 gap-4">
            {inputFields.map(({ name, label, placeholder, icon: Icon }) => (
              <div
                className={`form-group mb-2 ${
                  name === "title" || name === "description" ? "col-span-2" : ""
                }`}
                key={name}
              >
                <label className="form-label mb-1">
                  {label}
                  <span className="text-red-500"> *</span>
                </label>
                <div className="flex items-start border rounded-lg shadow-sm bg-white">
                  <div className="pl-3 pt-2">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <Controller
                    name={name as keyof KbliFormInputs}
                    control={control}
                    render={({ field }) =>
                      name === "title" || name === "description" ? (
                        <textarea
                          {...field}
                          placeholder={placeholder}
                          rows={6}
                          className="w-full px-3 py-2 focus:outline-none rounded-r-lg bg-white resize-y text-justify text-left"
                        />
                      ) : name === "code" ? (
                        <input
                          {...field}
                          type="text"
                          placeholder={placeholder}
                          readOnly
                          className="w-full px-3 py-2 focus:outline-none rounded-r-lg bg-gray-100 text-gray-500"
                        />
                      ) : name === "year" ? (
                        <input
                          {...field}
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          onInput={(e) => {
                            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 4);
                            field.onChange(e);
                          }}
                          placeholder={placeholder}
                          className="w-full px-3 py-2 focus:outline-none rounded-r-lg bg-white"
                        />
                      ) : (
                        <input
                          {...field}
                          type="text"
                          placeholder={placeholder}
                          className="w-full px-3 py-2 focus:outline-none rounded-r-lg bg-white"
                        />
                      )
                    }

                  />
                </div>
                {errors[name as keyof KbliFormInputs] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[name as keyof KbliFormInputs]?.message}
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

export default UpdateKbliModal;
