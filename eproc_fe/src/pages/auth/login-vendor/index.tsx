import Head from "next/head";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";

import Header1 from "@/components/Header1";
import Footer1 from "@/components/Footer1";
import styles from "../login-vendor/LoginVendor.module.css";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required*"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required*"),
});

export default function VendorLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHydrated(true);

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        event.reason.response &&
        event.reason.response.status === 401
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login-vendor`,
        data
      );

      const { token, data: vendorData } = response.data;

      Cookies.set("token", token, { expires: 1 });
      Cookies.set("vendor_id", vendorData.vendor_id.toString(), { expires: 1 });

      localStorage.setItem("token", token);

      await Swal.fire({
        icon: "success",
        title: "Login Success!",
        text: "Welcome Back!",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });

      router.push("/dashboardvendor");
    } catch (err: any) {
      if (err && typeof err === "object") {
        let errorTitle = "Login Failed";
        let errorMessage = "An unknown error occurred";

        if (err.response?.status === 401) {
          errorTitle = "Wrong Email or Password";
          errorMessage = "Please double-check your email and password.";
        } else if (err.response?.status === 404) {
          errorTitle = "Email Not Registered";
          errorMessage = "The email you entered is not registered as a vendor.";
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = "Connection problem. Please check your internet.";
        }

        await Swal.fire({
          icon: "error",
          title: errorTitle,
          text: errorMessage,
          confirmButtonText: "Try Again",
          confirmButtonColor: "#ef4444",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <>
      <Head>
        <title>Vendor Login - Eproc Patria</title>
      </Head>

      <div className={styles.pageWrapper}>
        <Header1 />

        <div className={styles.loginWrapper}>
          <div className={styles.contentWrapperSingle}>
            <div className={styles.loginCard}>
              <h3 className={styles.title}>Vendor Sign In</h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(onSubmit)(e).catch((error) => {
                    console.error("Form submission error caught:", error);
                  });
                }}
                noValidate
              >
                {/* Email */}
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    E-mail <span style={{ color: "red" }}>*</span>
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        className={`${styles.inputEmail} ${
                          errors.email ? styles.errorMessage : ""
                        }`}
                      />
                    )}
                  />
                  {errors.email && (
                    <p className={styles.errorMessage}>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Password <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className={styles.inputGroup}>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          className={`${styles.inputPassword} ${
                            errors.password ? styles.errorMessage : ""
                          }`}
                        />
                      )}
                    />
                    <span
                      className={styles.toggleBtn}
                      onClick={() => setShowPassword(!showPassword)}
                      role="button"
                      tabIndex={0}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  {errors.password && (
                    <p className={styles.errorMessage}>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className={styles.btnSubmit}
                  disabled={!isValid || loading}
                >
                  {loading ? "Loading..." : "SIGN IN"}
                </button>

                {/* Links */}
                <div
                  style={{
                    marginTop: "1rem",
                    fontSize: "0.95rem",
                    textAlign: "left",
                  }}
                >
                  Sign in as Employee?{" "}
                  <Link href="/auth/login" legacyBehavior>
                    <a style={{ color: "#2563eb", fontWeight: "bold" }}>
                      Click here!
                    </a>
                  </Link>

                  <p>
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/register" legacyBehavior>
                      <a style={{ color: "#2563eb", fontWeight: "bold" }}>
                        SIGN UP!
                      </a>
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        <Footer1 />
      </div>
    </>
  );
}
