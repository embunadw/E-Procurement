import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { InboxArrowDownIcon } from "@heroicons/react/24/outline";

import MainVendor from "@/vendor-layouts/main";

const DashboardVendorPage = () => {
  const [totalVendorInput, setTotalVendorInput] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const vendor_id = Cookies.get("vendor_id");
      if (!vendor_id) return;

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard-vendor?vendor_id=${vendor_id}`
        );
        const { totalVendorInputs } = res.data.data;
        setTotalVendorInput(totalVendorInputs);
      } catch (err) {
        console.error("Failed to fetch vendor dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Vendor</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card
          title="Total Quotation Submitted"
          count={totalVendorInput}
          icon={<InboxArrowDownIcon className="h-6 w-6 text-rose-600" />}
          borderColor="border-rose-500"
          bgIcon="bg-rose-100"
          href="/vendorquotation"
        />
      </div>
    </div>
  );
};

const Card = ({
  title,
  count,
  icon,
  borderColor,
  bgIcon,
  href,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  borderColor: string;
  bgIcon: string;
  href: string;
}) => {
  return (
    <a href={href}>
      <div
        className={`cursor-pointer bg-white shadow rounded-lg p-6 text-center border-t-4 ${borderColor} hover:shadow-md transition duration-200`}
      >
        <div className="flex items-center justify-center mb-4">
          <div className={`p-3 rounded-full ${bgIcon}`}>{icon}</div>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
        <p className="text-3xl font-bold text-gray-800">{count}</p>
      </div>
    </a>
  );
};

DashboardVendorPage.getLayout = function PageLayout(page: React.ReactElement) {
  return <MainVendor>{page}</MainVendor>;
};

export default DashboardVendorPage;
