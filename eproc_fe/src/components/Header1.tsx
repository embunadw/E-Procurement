import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./Header1.module.css";

export default function Header1() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formattedDate = currentTime?.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = currentTime?.toLocaleTimeString("id-ID");

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsDropdownOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftContent}>
        <img src="/media/images/patria-logo.png" alt="Patria Logo" className={styles.logo} />
        <img src="/media/images/logo-b.svg" alt="Eproc Logo" className={styles.logo} />

        {/* Tampilkan jam hanya setelah client-side render */}
        {isClient && (
          <div className={styles.datetime}>
            <div>{formattedDate}</div>
            <div>{formattedTime}</div>
          </div>
        )}
      </div>

      <div className={styles.navButtons}>
        <Link href="/auth/landingpage" legacyBehavior>
          <a className={`${styles.navButton} ${styles.home}`}>HOME</a>
        </Link>

        <div className={styles.dropdown} ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`${styles.navButton} ${styles.signin}`}
          >
            SIGN IN <span>▾</span>
          </button>
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <button className={styles.dropdownItem} onClick={() => handleNavigate("/auth/login")}>
                Employee
              </button>
              <button className={styles.dropdownItem} onClick={() => handleNavigate("/auth/login-vendor")}>
                Vendor
              </button>
            </div>
          )}
        </div>

        <Link href="/auth/register" legacyBehavior>
          <a className={`${styles.navButton} ${styles.signup}`}>SIGN UP</a>
        </Link>
      </div>
    </header>
  );
}
