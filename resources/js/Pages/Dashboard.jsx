import React from "react";
import { Head, usePage } from "@inertiajs/react";
import DashboardHeader from "../components/DashboardHeader";
import DashboardSidebar from "../components/DashboardSidebar";
import {
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineHome,
  HiOutlineUserGroup,
} from "react-icons/hi";

// Palette (inspirée de Home.jsx)
const COLORS = {
  gold: "#a68e55",
  brown: "#8c6c3c",
  black: "#040404",
  accent: "#23ad94",
  bg: "linear-gradient(180deg,#f7f3ee_0%,#e6d9c2_100%)",
};

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div
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
    </div>
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
  if (!orders || orders.length === 0) return null;
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

export default function Dashboard() {
  const {
    totalOrder = 0,
    sell = { total_sell_price: 0, total_cost: 0 },
    productItem = 0,
    customer = 0,
    sellProductList = [],
    lastOrder = [],
    auth = { user: { name: "Admin" } },
  } = usePage().props;

  return (
    <>
      <Head title="Dashboard" />
      <div className="min-h-screen bg-[#f7f3ee] flex">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={auth.user} />
          <main className="flex-1 px-6 py-8">
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
              {lastOrder && lastOrder.length > 0 && (
                <div className="lg:col-span-2">
                  <RecentOrders orders={lastOrder} />
                </div>
              )}
              <div>
                <BestSellProducts products={sellProductList} />
              </div>
            </div>
          </main>
        </div>
      </div>
      <style>{`
        .sidebar-label {
          transition: opacity .25s cubic-bezier(.4,0,.2,1), max-width .25s cubic-bezier(.4,0,.2,1);
        }
        .animate-fade-in { animation: fade-in .25s ease; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: none;} }
      `}</style>
    </>
  );
}