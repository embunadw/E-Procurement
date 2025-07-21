import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import Link from "next/link";

import Header1 from "@/components/Header1";
import Footer1 from "@/components/Footer1";

import styles from "./LandingPage.module.css";

const LandingPage = () => {
  const [dateTime, setDateTime] = useState("");
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    const token = Cookies.get("token");
    if (token) {
      router.push("/dashboard");
    }

    const updateDateTime = () => {
      const now = new Date();
      const hari = now.toLocaleDateString("id-ID", { weekday: "long" });
      const tanggal = now.getDate();
      const bulan = now.toLocaleDateString("id-ID", { month: "long" });
      const tahun = now.getFullYear();
      const jam = now.toLocaleTimeString("id-ID");

      setDateTime(`${hari}, ${tanggal} ${bulan} ${tahun} - ${jam}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, [router]);

  if (!isClient) return null;

  return (
    <div className={styles.wrapper}>
      <Header1 />

      <main className={styles.heroSection}>
        <div className={styles.leftContent}>
          <h1 className={styles.welcome}>Selamat Datang !</h1>
          <p className={styles.description}>
            e-Proc PT. United Tractors Pandu Engineering adalah e-Procurement di lingkungan
            PT United Tractors Pandu Engineering untuk sarana pengadaan barang dan/atau jasa
            yang dilakukan secara online/elektronik dengan menggunakan fasilitas aplikasi e-Proc.
          </p>

          <Link href="/auth/register">
            <button className={styles.joinButton}>Join Now!</button>
          </Link>

          <p className={styles.disclaimer}></p>
        </div>

        <div className={styles.rightImage}>
          <img src="/media/images/SSTFull.png" alt="Patria Dump Truck" />
        </div>
      </main>

      <Footer1 />
    </div>
  );
};

export default LandingPage;
