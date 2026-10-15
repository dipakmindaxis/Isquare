import React from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  CalendarCheck,
  LogOut,
  Building2,
} from "lucide-react";

const VMSDashboard: React.FC = () => {
  const cards = [
    {
      title: "Total Visitors",
      value: "0",
      icon: <Users size={28} />,
      color: "bg-blue-500",
    },
    {
      title: "Today's Visitors",
      value: "0",
      icon: <UserCheck size={28} />,
      color: "bg-green-500",
    },
    {
      title: "Expected Visitors",
      value: "0",
      icon: <UserPlus size={28} />,
      color: "bg-orange-500",
    },
    {
      title: "Currently Inside",
      value: "0",
      icon: <Clock size={28} />,
      color: "bg-purple-500",
    },
    {
      title: "Today's Appointments",
      value: "0",
      icon: <CalendarCheck size={28} />,
      color: "bg-cyan-500",
    },
    {
      title: "Visitors Checked Out",
      value: "0",
      icon: <LogOut size={28} />,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#e4e8e1] p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#00234a] text-white p-3 rounded-xl">
            <Building2 size={30} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Visitor Management System
            </h1>

            <p className="text-gray-500 text-sm">
              Manage visitors, appointments and visitor check-in/check-out
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div
                className={`${card.color} text-white p-3 rounded-lg`}
              >
                {card.icon}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                {card.title}
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {card.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Today's Visitor Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Today's Visitor Activity
          </h2>

          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Users size={48} className="mx-auto mb-3" />

              <p className="text-sm">
                No visitor activity available
              </p>
            </div>
          </div>
        </div>

        {/* Recent Visitors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Visitors
            </h2>

            <button className="text-sm text-blue-600 hover:text-blue-800">
              View All
            </button>
          </div>

          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <UserCheck size={48} className="mx-auto mb-3" />

              <p className="text-sm">
                No recent visitors
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <UserPlus size={22} />
            </div>

            <span className="font-medium text-gray-700">
              Register Visitor
            </span>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <div className="bg-green-100 text-green-600 p-2 rounded-lg">
              <UserCheck size={22} />
            </div>

            <span className="font-medium text-gray-700">
              Visitor Check-In
            </span>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
              <CalendarCheck size={22} />
            </div>

            <span className="font-medium text-gray-700">
              Schedule Appointment
            </span>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <div className="bg-red-100 text-red-600 p-2 rounded-lg">
              <LogOut size={22} />
            </div>

            <span className="font-medium text-gray-700">
              Visitor Check-Out
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VMSDashboard;