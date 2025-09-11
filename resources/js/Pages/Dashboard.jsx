import React, { useEffect, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineChartBar,
} from "react-icons/hi";
import { FiChevronDown } from "react-icons/fi";

// Palette (inspirée de Home.jsx)
const COLORS = {
  gold: "#a68e55",
  brown: "#8c6c3c",
  black: "#040404",
  accent: "#23ad94",
  bg: "linear-gradient(180deg,#f7f3ee_0%,#e6d9c2_100%)",
};

// ---------------------------- Data Fetching Hook ----------------------------
function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    totalOrder: 0,
    sell: { total_sell_price: 0, total_cost: 0 },
    productItem: 0,
    customer: 0,
    sellProductList: [],
    lastOrder: [],
  });

  useEffect(() => {
    setLoading(true);
    fetch("/api/dashboard", {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setDashboard(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { ...dashboard, loading };
}

// ---------------------------- Components ----------------------------

function StatCard({ icon, label, value, color, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow p-6 flex items-center gap-4 border-l-4`}
      style={{ borderColor: color }}
    >
      <div className={`rounded-full p-3`} style={{ background: color, color: "#fff" }}>
        {icon}
      </div>
      <div>
        <p className="mb-0 text-gray-500">{label}</p>
        <h4 className="my-1 text-xl font-bold" style={{ color }}>{value}</h4>
        {sub && <p className="mb-0 text-xs text-gray-400">{sub}</p>}
      </div>
    </motion.div>
  );
}

function BestSellProducts({ products }) {
  return (
    <div className="card bg-white rounded-xl shadow p-6 mb-6">
      <h6 className="mb-4 font-bold text-[#8c6c3c]">Best Sell Products</h6>
      <ul className="divide-y">
        {products.map((product) => (
          <li key={product.id} className="flex justify-between items-center py-2">
            <span className="text-gray-700">{product.name}</span>
            <span className="bg-green-500 text-white rounded-full px-3 py-1 text-xs font-semibold">
              {product.total_sell}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecentOrders({ orders }) {
  return (
    <div className="card bg-white rounded-xl shadow p-6 mb-6 overflow-x-auto">
      <h6 className="mb-4 font-bold text-[#8c6c3c]">Recent Orders</h6>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-gray-600">
            <th>Product</th>
            <th>Photo</th>
            <th>Invoice</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Shipping</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition">
              <td>
                {order.productInfo?.name?.length > 20
                  ? order.productInfo.name.slice(0, 20) + "..."
                  : order.productInfo?.name}
              </td>
              <td>
                <img
                  src={order.productInfo?.image_path}
                  alt="product"
                  className="w-12 h-12 object-cover rounded"
                />
              </td>
              <td>#{order.sellInfo?.invoice_id}</td>
              <td>
                <span
                  className={`badge px-2 py-1 rounded text-white w-24 text-center ${
                    order.sellInfo?.order_status < 6
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {order.sellInfo?.order_status < 6 ? "Pending" : "Paid"}
                </span>
              </td>
              <td>{Math.round(order.sellInfo?.total_payable_amount)}</td>
              <td>
                {order.sellInfo?.date
                  ? new Date(order.sellInfo.date).toLocaleDateString()
                  : ""}
              </td>
              <td>
                <div className="w-24 h-2 bg-gray-200 rounded">
                  <div
                    className={`h-2 rounded ${
                      order.sellInfo?.order_status < 6
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: order.sellInfo?.order_status < 6 ? "60%" : "100%",
                    }}
                  ></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------- Main Dashboard ----------------------------

export default function Dashboard() {
  const { loading, totalOrder, sell, productItem, customer, sellProductList, lastOrder } =
    useDashboardData();

  return (
    <>
      <Head title="Dashboard" />
      <div className="min-h-screen bg-[#f7f3ee] flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#8c6c3c]">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-blue-500 transition">
              <HiOutlineBell size={24} />
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full px-1">
                3
              </span>
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/assets/front/imgs/default-user.png"
                alt="user"
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
              />
              <span className="font-medium text-gray-700 hidden sm:inline">Admin</span>
              <FiChevronDown className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-6 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#a68e55]"></span>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={<HiOutlineClipboardList size={28} />}
                  label="Total Orders"
                  value={totalOrder}
                  color={COLORS.accent}
                  sub="from last week"
                />
                <StatCard
                  icon={<HiOutlineChartBar size={28} />}
                  label="Total Revenue"
                  value={sell.total_sell_price - sell.total_cost}
                  color="#ef4444"
                  sub="from last week"
                />
                <StatCard
                  icon={<HiOutlineHome size={28} />}
                  label="Product Item"
                  value={productItem}
                  color="#22c55e"
                  sub="Active Product"
                />
                <StatCard
                  icon={<HiOutlineUserGroup size={28} />}
                  label="Total Customers"
                  value={customer}
                  color="#f59e42"
                  sub="Active Customer"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2">
                  <RecentOrders orders={lastOrder} />
                </div>
                {/* Best Sell Products */}
                <div>
                  <BestSellProducts products={sellProductList} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      {/* Animations */}
      <style>{`
        .animate-fade-in { animation: fade-in .25s ease; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: none;} }
      `}</style>
    </>
  );
}