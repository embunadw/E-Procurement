import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import {
  Home,
  Users,
  Package,
  Layers,
  Building2,
  Truck,
  FileCog,
  ClipboardList,
  FolderCog,
  ChevronDown,
} from "lucide-react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

// Komponen Link biasa
const SidebarLink = ({ href, title, icon: Icon, isActive }: any) => (
  <Link
    href={href}
    className={clsx(
      "menu-link flex items-center gap-3 pl-3 pr-5 py-2 rounded-lg hover:bg-secondary-active",
      isActive && "bg-gray-200"
    )}
  >
    <span className="menu-icon text-gray-500 w-5">
      {Icon && <Icon size={18} strokeWidth={1.8} />}
    </span>
    <span className="menu-title text-sm font-semibold text-gray-700">{title}</span>
  </Link>
);

// Komponen Dropdown
const SidebarDropdown = ({ label, icon: Icon, open, toggle, menus, pathname }: any) => (
  <div className="menu-item">
    <div
      className="menu-link flex items-center justify-between gap-3 pl-3 pr-5 py-2 cursor-pointer hover:bg-secondary-active rounded-lg"
      onClick={toggle}
    >
      <div className="flex items-center gap-3">
        <span className="menu-icon text-gray-500 w-5">
          {Icon && <Icon size={18} strokeWidth={1.8} />}
        </span>
        <span className="menu-title text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <ChevronDown
        className={clsx("transition-transform", { "rotate-180": open })}
        size={16}
      />
    </div>
    <div className={clsx("menu-accordion pl-5", { show: open })}>
      {menus.map((menu: any) => (
        <Link
          key={menu.href}
          href={menu.href}
          className={clsx(
            "menu-link flex items-center gap-3 pl-5 py-2 rounded-lg hover:bg-secondary-active",
            pathname === menu.href && "bg-gray-200"
          )}
        >
          <span className="menu-icon text-gray-500 w-5">
            {menu.icon && <menu.icon size={18} strokeWidth={1.8} />}
          </span>
          <span className="menu-title text-sm font-normal text-gray-700">{menu.title}</span>
        </Link>
      ))}
    </div>
  </div>
);

function Sidebar() {
  const router = useRouter();
  const { pathname } = router;

  const [role, setRole] = useState<string | null>(null);
  const [masterOpen, setMasterOpen] = useState(false);
  const [transaksiOpen, setTransaksiOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      const decoded: any = jwtDecode(token);
      const userRole = decoded.role?.toLowerCase() || null;
      setRole(userRole);
    }
  }, []);

  const masterMenus = [
    { href: "/master/user",          title: "User",           icon: Users },
   
    { href: "/master/material_group",title: "Material Group", icon: Layers },
    { href: "/master/plant",         title: "Plant",          icon: Building2 },
     { href: "/master/material",      title: "Material",       icon: Package },
    { href: "/master/vendor",        title: "Vendor",         icon: Truck },
    { href: "/master/kbli",          title: "KBLI",           icon: DocumentTextIcon },
  ];

  const transaksiMenus = [
    { href: "/transaksi/app-rfq", title: "Transaction RFQ", icon: ClipboardList },
  ];

  const reportMenus = [
    { href: "/report", title: "Report RFQ", icon: DocumentTextIcon },
  ];
const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="sidebar dark:bg-coal-600 bg-light border-r border-r-gray-200 fixed top-0 bottom-0 z-20 hidden lg:flex flex-col">
      {/* Header */}
      <div className="sidebar-header hidden lg:flex items-center justify-between px-3 lg:px-6 py-4">
        
        <Link href="/" className="flex items-center space-x-2">
          <img
            src="/media/app/logo-b.svg"
            className="w-60 h-auto object-contain"
            alt="Logo"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="sidebar-content flex-grow py-4 pr-2">
        <div className="scrollable-y-hover flex flex-col pl-2 lg:pl-5 pr-1 lg:pr-3">
          
          <SidebarLink
            href="/"
            title="Dashboard"
            icon={Home}
            isActive={pathname === "/"}
            prefetch={false}
          />

          {/* === HAK AKSES: PATRIA === */}
          {role === "patria" && (
            <>
              <SidebarDropdown
                label="Master"
                icon={FolderCog}
                open={masterOpen}
                toggle={() => setMasterOpen(!masterOpen)}
                menus={masterMenus}
                pathname={pathname}
              />
              <SidebarDropdown
                label="Transaction"
                icon={FileCog}
                open={transaksiOpen}
                toggle={() => setTransaksiOpen(!transaksiOpen)}
                menus={transaksiMenus}
                pathname={pathname}
              />
              <SidebarDropdown
                label="Report"
                icon={DocumentTextIcon}
                open={reportOpen}
                toggle={() => setReportOpen(!reportOpen)}
                menus={reportMenus}
                pathname={pathname}
              />
            </>
          )}

              
        {role === "manager" && (
          <>
            <SidebarDropdown
              label="Transaction"
              icon={FileCog}
              open={transaksiOpen}
              toggle={() => setTransaksiOpen(!transaksiOpen)}
              menus={transaksiMenus}
              pathname={pathname}
            />
            <SidebarDropdown
              label="Report"
              icon={DocumentTextIcon}
              open={reportOpen}
              toggle={() => setReportOpen(!reportOpen)}
              menus={reportMenus}
              pathname={pathname}
            />
          </>
        )}

                </div>
              </div>
            </div>
          );
        }

export default Sidebar;
