import React from "react";
import Link from "next/link";
import styles from "./Footer1.module.css";

export default function Footer1() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLeft}>
          <img
            src="/media/images/patria-logo-alt.png"
            alt="Patria Logo"
            className={styles.footerLogo}
          />
        </div>

        <div className={styles.footerRight}>
          <h4 className={styles.navTitle}>NAVIGATION</h4>
          <ul className={styles.navList}>
            <li>
              <Link href="/auth/landingpage" legacyBehavior>
                <a className={styles.navLink}>Home</a>
              </Link>
            </li>
            <li>
              <Link href="/auth/login" legacyBehavior>
                <a className={styles.navLink}>Sign in</a>
              </Link>
            </li>
            <li>
              <Link href="/auth/register" legacyBehavior>
                <a className={styles.navLink}>Sign up</a>
              </Link>
            </li>
          </ul>
        </div>
      </div>

     
    </footer>
  );
}
