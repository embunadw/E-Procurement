import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SearchModal from "../components/SearchModal";
import React, { ReactNode, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

interface MainProps {
  children: ReactNode;
}

function getUserFromToken(token: string | undefined) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return {
      userName: decoded.userName || decoded.name || "User",
    };
  } catch {
    return null;
  }
}

const Main: React.FC<MainProps> = ({ children }) => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const token = Cookies.get("token");
    const user = getUserFromToken(token);


    const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/landingpage"];

    if (!user && !publicRoutes.includes(router.pathname)) {
      router.push("/auth/login");
      return;
    }

    if (user) setUserName(user.userName);
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/auth/landingpage");
  };

  return (
    <>
      <div className="flex grow min-h-screen">
        <Sidebar />
        <div className="wrapper flex grow flex-col">
          <Header onLogout={handleLogout} userName={userName} />
          <main className="grow content pt-5" id="content" role="content">
            <div className="container-fixed">{children}</div>
          </main>
          <Footer />
        </div>
      </div>
      <SearchModal />
    </>
  );
};

export default Main;
