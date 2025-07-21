import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/router";
import Header1 from "@/components/Header1";
import Footer1 from "@/components/Footer1";
import Select from "react-select";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./RegisterPage.module.css";

interface KbliOption {
  id: number;
  code: string;
  title: string;
}

interface SelectOption {
  value: string;
  label: string;
}

export default function RegisterVendor() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    company_name: "",
    telephone: "",
    address: "",
    nib: "",
    email: "",
    password: "",
    vendor_category: "",
    referral: "",
    company_aff_id: "",
    kbli_id: [] as number[],
  });

  const [kbliList, setKbliList] = useState<KbliOption[]>([]);
  const [affCompanies] = useState([
    { id: 16722, name: "PT United Tractors Pandu Engineering" },
    { id: 16727, name: "PT Patria Maritime Lines" },
    { id: 16729, name: "PT Patria Maritime Perkasa" },
    { id: 16731, name: "PT Triatra Sinergia Pratama" },
  ]);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/kblis`)
      .then((res) => {
        const result = res.data?.data?.data || res.data?.data || res.data;
        setKbliList(Array.isArray(result) ? result : []);
      })
      .catch(() => setKbliList([]));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "nib" && value.length > 13) return;

    setForm({ ...form, [name]: value });
  };

  const onInvalid = () => {
    const requiredFields = [
      { key: "company_name", label: "Company Name" },
      { key: "telephone", label: "Telephone" },
      { key: "address", label: "Address" },
      { key: "nib", label: "NIB" },
      { key: "email", label: "Email" },
      { key: "password", label: "Password" },
      { key: "vendor_category", label: "Vendor Category" },
      { key: "referral", label: "Referral" },
      { key: "company_aff_id", label: "Company Affiliation" },
    ];

    let errorMessages = "";

    for (const field of requiredFields) {
      if (!form[field.key as keyof typeof form]) {
        errorMessages += `• ${field.label} is required\n`;
      }
    }

    if (!form.kbli_id || form.kbli_id.length === 0) {
      errorMessages += "• KBLI must be selected\n";
    }

    if (form.nib.length > 13) {
      errorMessages += "• NIB must not exceed 13 digits\n";
    }

    if (errorMessages) {
      Swal.fire({
        title: "Incomplete Form",
        text: errorMessages,
        icon: "error",
        confirmButtonText: "OK",
      });
      return true;
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (onInvalid()) return;

    const payload = {
      ...form,
      company_aff_id: Number(form.company_aff_id),
      kbli_id: form.kbli_id,
    };

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/register-vendors`, payload);

      Swal.fire({
        title: "Success",
        text: "Vendor registered successfully.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        setForm({
          company_name: "",
          telephone: "",
          address: "",
          nib: "",
          email: "",
          password: "",
          vendor_category: "",
          referral: "",
          company_aff_id: "",
          kbli_id: [],
        });

        router.push("/auth/login-vendor");
      });
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.message || "Failed to register vendor.", "error");
    }
  };

  const kbliOptions: SelectOption[] = kbliList.map((k) => ({
    value: k.id.toString(),
    label: `${k.code} - ${k.title}`,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header1 />
      <main style={{ flex: 1 }}>
        <div className={styles.registerWrapper}>
          <form onSubmit={handleSubmit} className={styles.registerContent}>
            <div className={styles.cardLeft}>
              <h3 className={styles.cardTitle}>Sign Up to Account</h3>

              <div className={styles.fieldGroup}>
                <label>
                  Company Affiliation <span style={{ color: "red" }}>*</span> :
                </label>
                <select
                  name="company_aff_id"
                  onChange={handleChange}
                  value={form.company_aff_id}
                >
                  <option value="" disabled>
                    Select Company
                  </option>
                  {affCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label>
                  Referral <span style={{ color: "red" }}>*</span> :
                </label>
                <input
                  name="referral"
                  onChange={handleChange}
                  value={form.referral}
                  placeholder="Reference"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>
                  Vendor Category <span style={{ color: "red" }}>*</span> :
                </label>
                <select
                  name="vendor_category"
                  onChange={handleChange}
                  value={form.vendor_category}
                >
                  <option value="">Select Category</option>
                  <option value="Vendor Local">Vendor Local</option>
                  <option value="Vendor SubCont">Vendor SubCont</option>
                  <option value="Vendor Import">Vendor Import</option>
                  <option value="Vendor Catering">Vendor Catering</option>
                  <option value="Vendor Manpower">Vendor Manpower</option>
                  <option value="Vendor B3EHS">Vendor B3 (Waste or EHS)</option>
                </select>
              </div>
            </div>

            <div className={styles.cardRight}>
              <h3 className={styles.cardTitle}>Sign Up for New Account</h3>

              <div className={styles.fieldGroup}>
                <label>
                  Company Name <span style={{ color: "red" }}>*</span> :
                </label>
                <input
                  name="company_name"
                  onChange={handleChange}
                  value={form.company_name}
                  placeholder="Company Name"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>
                  Telephone No. <span style={{ color: "red" }}>*</span> :
                </label>
                <input
                  name="telephone"
                  onChange={handleChange}
                  value={form.telephone}
                  placeholder="Telephone"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>
                  Address <span style={{ color: "red" }}>*</span> :
                </label>
                <textarea
                  name="address"
                  onChange={handleChange}
                  value={form.address}
                  placeholder="Address"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>
                  NIB <span style={{ color: "red" }}>*</span>:
                </label>
                <input
                  name="nib"
                  maxLength={13}
                  value={form.nib}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setForm({ ...form, nib: val });
                    }
                  }}
                  placeholder="NIB (maximum 13 digits)"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>
                  KBLI <span style={{ color: "red" }}>*</span> :
                </label>
                <Select
                  isMulti
                  closeMenuOnSelect={false}
                  name="kbli_id"
                  classNamePrefix="select"
                  options={kbliOptions}
                  value={kbliOptions.filter((opt) =>
                    form.kbli_id.includes(Number(opt.value))
                  )}
                  onChange={(selectedOptions) => {
                    const selectedIds = selectedOptions.map((opt) => Number(opt.value));
                    setForm((prev) => ({ ...prev, kbli_id: selectedIds }));
                  }}
                  placeholder="Select one or more KBLI"
                  menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({
                      ...base,
                      maxHeight: "300px",
                      overflowY: "auto",
                    }),
                  }}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>
                  E-mail <span style={{ color: "red" }}>*</span> :
                </label>
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  value={form.email}
                  placeholder="Email"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>
                  Password <span style={{ color: "red" }}>*</span> :
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    onChange={handleChange}
                    value={form.password}
                    placeholder="Password"
                    style={{
                      width: "100%",
                      paddingRight: "2.5rem",
                      paddingLeft: "0.5rem",
                      height: "38px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      cursor: "pointer",
                      color: "#555",
                    }}
                    title={showPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Register
              </button>

              <p className={styles.signinText}>
                Already have an account?{" "}
                <Link href="/auth/login-vendor" className={styles.signup}>
                  SIGN IN
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
      <Footer1 />
    </div>
  );
}
