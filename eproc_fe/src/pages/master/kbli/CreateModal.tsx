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

const schema: yup.ObjectSchema<KbliFormInputs> = yup.object({
  year: yup
    .string()
    .matches(/^\d{4}$/, "Year must be a 4-digit number")
    .required("Year is required"),
  code: yup
    .string()
    .length(5, "KBLI Code must be exactly 5 digits")
    .matches(/^\d{5}$/, "KBLI Code must be numeric")
    .required("KBLI Code is required"),
  title: yup.string().required("KBLI Title is required"),
  description: yup.string().required("Description is required"),
});

const CreateKbliModal = ({ isModalOpen, onClose, setRefetch, isRefetch }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<KbliFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      year: "",
      code: "",
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!isModalOpen) reset();
  }, [isModalOpen, reset]);

  const onSubmit = async (data: KbliFormInputs) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Missing token");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/kblis`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          validateStatus: function (status) {
            // Consider 2xx and 409 as successful responses
            return (status >= 200 && status < 300) || status === 409;
          },
        }
      );

      if (response.status === 201) {
        Swal.fire({
          text: "KBLI added successfully",
          icon: "success",
          timer: 1500,
        });
        setRefetch(!isRefetch);
        onClose();
        reset();
      } else if (response.status === 409) {
        Swal.fire({
          text: response.data.message || "KBLI Code is using",
          icon: "error",
        });
      }
    } catch (error: any) {
      console.error("Error creating KBLI:", error);
      Swal.fire({
        text: error?.response?.data?.message || "Failed to add KBLI. Please check your data.",
        icon: "error",
      });
    }
  };



  const inputFields = [
    {
      name: "year",
      label: "Year",
      placeholder: "Enter Year (e.g. 2020)",
      icon: CalendarIcon,
      max: 4,
    },
    {
      name: "code",
      label: "KBLI Code",
      placeholder: "Enter KBLI Code",
      icon: HashtagIcon,
      max: 5,
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
        <h3 className="modal-title">Add KBLI</h3>
        <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
          <i className="ki-outline ki-cross" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="modal-body overflow-y-auto py-0 mt-2 px-6 max-h-[65vh]">
          <div className="grid grid-cols-2 gap-4">
            {inputFields.map(({ name, label, placeholder, icon: Icon, max }) => {
              const isTextarea = name === "title" || name === "description";
              const isNumeric = name === "year" || name === "code";

              return (
                <div
                  className={`form-group mb-2 ${isTextarea ? "col-span-2" : ""
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
                        isTextarea ? (
                          <textarea
                            {...field}
                            placeholder={placeholder}
                            rows={6}
                            className="w-full px-3 py-2 focus:outline-none rounded-r-lg bg-white resize-y"
                          />
                        ) : (
                          <input
                            {...field}
                            type="text"
                            inputMode={isNumeric ? "numeric" : "text"}
                            placeholder={placeholder}
                            maxLength={max}
                            onInput={(e) => {
                              let value = e.currentTarget.value;
                              if (isNumeric) {
                                value = value.replace(/\D/g, "").slice(0, max);
                                e.currentTarget.value = value;
                              }
                              field.onChange(value);
                            }}
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

export default CreateKbliModal;
