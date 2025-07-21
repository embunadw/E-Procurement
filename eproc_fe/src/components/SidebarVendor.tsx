import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import {
  Home,
  FileText,
  FileCog,
  ChevronDown,
} from "lucide-react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

// Komponen Link Sidebar
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

// Komponen Dropdown Sidebar
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

function SidebarVendor() {
  const router = useRouter();
  const { pathname } = router;

  const [vendor, setVendor] = useState<any>(null);
  const [rfqOpen, setRfqOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      const decoded: any = jwtDecode(token);
      setVendor({
        company_name: decoded.company_name || "Vendor",
        email: decoded.email || "-",
      });
    }
  }, []);

  const rfqMenus = [
    {
      href: "/vendorquotation",
      title: "RFQ",
      icon: FileText,
    },
  ];

  const reportMenus = [
    {
      href: "/report_vendor",
      title: "Report RFQ",
      icon: DocumentTextIcon,
    },
  ];

  return (
    <div className="sidebar dark:bg-coal-600 bg-light border-r border-r-gray-200 fixed top-0 bottom-0 z-20 hidden lg:flex flex-col w-64">
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
        <div className="scrollable-y-hover flex flex-col pl-5 pr-3 space-y-2">
          {/* Dashboard */}
          <SidebarLink
            href="/dashboardvendor"
            title="Dashboard"
            icon={Home}
            isActive={pathname === "/dashboardvendor"}
          />

          {/* Submenu: RFQ */}
          <SidebarDropdown
            label="RFQ"
            icon={FileCog}
            open={rfqOpen}
            toggle={() => setRfqOpen(!rfqOpen)}
            menus={rfqMenus}
            pathname={pathname}
          />

          {/* Submenu: Report */}
          <SidebarDropdown
            label="Report"
            icon={DocumentTextIcon}
            open={reportOpen}
            toggle={() => setReportOpen(!reportOpen)}
            menus={reportMenus}
            pathname={pathname}
          />
        </div>
      </div>
    </div>
  );
}

export default SidebarVendor;
