import Head from "next/head";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import Link from "next/link";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import styles from "./LoginPage.module.css";

const schema = yup.object().shape({
  email_sf: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Add global error handler to prevent unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.response && event.reason.response.status === 401) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
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

  const onSubmit = async (data: { email_sf: string; password: string }) => {
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, data);
      const { token, user } = response.data;

      Cookies.set("token", token, { expires: 1 });
      Cookies.set("user_id", user.id, { expires: 1 });
      localStorage.setItem("token", token);

      // Success alert
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: 'Welcome back!',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      });

      router.push("/dashboard");
    } catch (err: any) {
      // Prevent error from propagating further
      if (err && typeof err === 'object') {
        // Error handling with SweetAlert2
        let errorTitle = "Login Failed";
        let errorMessage = "An unknown error occurred";

        if (err.response?.status === 401) {
          errorTitle = "Wrong Email or Password";
          errorMessage = "Double check your email and password";
        } else if (err.response?.status === 404) {
          errorTitle = "Unregistered Email";
          errorMessage = "The email you entered is not registered as an employee";
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.message) {
          errorMessage = "Connection problem. Check your internet connection.";
        }

        await Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonText: 'Try again',
          confirmButtonColor: '#ef4444',
          allowOutsideClick: false,
          allowEscapeKey: false
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Eproc Patria</title>
      </Head>

      <div className={styles.loginWrapper}>
        <div className={styles.contentWrapper}>
          {/* Kiri: Logo dan Gambar */}
          <div className={styles.imageContainer}>
            <div className={styles.logoWrapper}>
             <img
                src="/media/images/patria-logo.png"
                alt="Patria Logo"
              />
              <img
                src="/media/images/logo-b.svg"
                alt="Eproc Logo"
              />
            </div>
            <img
              className={styles.imageDumpTruck}
              src="/media/images/SSTFull.png"
              alt="Dump Truck"
            />
          </div>

          {/* Kanan: Form Login */}
          <div className={styles.loginCard}>
            <h3 className={styles.title}>Sign in to Your Patria Account</h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e).catch((error) => {
                console.error('Form submission error caught:', error);
              });
            }} noValidate>
              {/* Input Email */}
              <div className={styles.formGroup}>
                <label htmlFor="email_sf" className={styles.label}>
                E-mail<span style={{ color: "red" }}>*</span>
                </label>
                <Controller
                  name="email_sf"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="email_sf"
                      type="email"
                      placeholder="Enter email"
                      autoComplete="email"
                      className={`${styles.inputEmail} ${
                        errors.email_sf ? styles.errorMessage : ""
                      }`}
                    />
                  )}
                />
                {errors.email_sf && (
                  <p className={styles.errorMessage}>{errors.email_sf.message}</p>
                )}
              </div>

              {/* Input Password */}
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password<span style={{ color: "red" }}>*</span>
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
                        placeholder="Enter password"
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setShowPassword(!showPassword);
                    }}
                  >
                    {showPassword ? <FaEye /> :  <FaEyeSlash />}
                  </span>
                </div>
                {errors.password && (
                  <p className={styles.errorMessage}>{errors.password.message}</p>
                )}
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={!isValid || loading}
              >
                {loading ? "Loading..." : "SIGN IN"}
              </button>

              {/* Link ke Login Vendor */}
              <div
                style={{
                  marginTop: "1rem",
                  fontSize: "0.95rem",
                  textAlign: "left",
                }}
              >
                Login as Vendor?{" "}
                <Link href="/auth/login-vendor" legacyBehavior>
                  <a style={{ color: "#2563eb", fontWeight: "bold" }}>Click here!</a>
                </Link>
              </div>

              {/* Link ke Home */}
              <div
                style={{
                  marginTop: "1rem",
                  fontSize: "0.95rem",
                  textAlign: "left",
                }}
              >
                Back to Home?{" "}
                <Link href="/auth/landingpage" legacyBehavior>
                  <a style={{ color: "#2563eb", fontWeight: "bold" }}>Click here!</a>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}