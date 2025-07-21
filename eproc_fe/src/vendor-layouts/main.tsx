import React, { ReactNode, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import SidebarVendor from "@/components/SidebarVendor";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface MainVendorProps {
  children: ReactNode;
}

function getUserFromToken(token: string | undefined) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return {
      userName: decoded.username || decoded.name || "Vendor",
    };
  } catch {
    return null;
  }
}

const MainVendor: React.FC<MainVendorProps> = ({ children }) => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const token = Cookies.get("token");
    const user = getUserFromToken(token);

    const publicRoutes = ["/auth/login-vendor", "/auth/register"];

    if (!user && !publicRoutes.includes(router.pathname)) {
      router.push("/auth/login-vendor");
      return;
    }

    if (user) setUserName(user.userName);
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
    router.push("/auth/login-vendor");
  };

  return (
    <>
      <div className="flex grow min-h-screen">
        <SidebarVendor />
        <div className="wrapper flex grow flex-col">
          <Header onLogout={handleLogout} userName={userName} />
          <main className="grow content pt-5" id="content" role="content">
            <div className="container-fixed">{children}</div>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default MainVendor;
