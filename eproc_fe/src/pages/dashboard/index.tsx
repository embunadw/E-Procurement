import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  InboxArrowDownIcon,
} from "@heroicons/react/24/outline";
import Main from "@/main-layouts/main";

const DashboardPage = () => {
  const [totalVendor, setTotalVendor] = useState(0);
  const [totalRFQ, setTotalRFQ] = useState(0);
  const [totalVendorInput, setTotalVendorInput] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`);
        const { totalVendors, totalRFQs, totalVendorInputs } = res.data.data;
        setTotalVendor(totalVendors);
        setTotalRFQ(totalRFQs);
        setTotalVendorInput(totalVendorInputs);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card
          title="Total Vendor"
          count={totalVendor}
          icon={<UserGroupIcon className="h-6 w-6 text-indigo-600" />}
          borderColor="border-indigo-500"
          bgIcon="bg-indigo-100"
          href="/master/vendor"
        />
        <Card
          title="Total RFQ"
          count={totalRFQ}
          icon={<ClipboardDocumentListIcon className="h-6 w-6 text-emerald-600" />}
          borderColor="border-emerald-500"
          bgIcon="bg-emerald-100"
          href="/transaksi/app-rfq"
        />
        <Card
          title="Total Vendor Input"
          count={totalVendorInput}
          icon={<InboxArrowDownIcon className="h-6 w-6 text-rose-600" />}
          borderColor="border-rose-500"
          bgIcon="bg-rose-100"
          href="/report"
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
    <Link href={href}>
      <div
        className={`cursor-pointer bg-white shadow rounded-lg p-6 text-center border-t-4 ${borderColor} hover:shadow-md transition duration-200`}
      >
        <div className="flex items-center justify-center mb-4">
          <div className={`p-3 rounded-full ${bgIcon}`}>{icon}</div>
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">{title}</h2>
        <p className="text-3xl font-bold text-gray-800">{count}</p>
      </div>
    </Link>
  );
};

DashboardPage.getLayout = function PageLayout(page: React.ReactElement) {
  return <Main>{page}</Main>;
};

export default DashboardPage;
