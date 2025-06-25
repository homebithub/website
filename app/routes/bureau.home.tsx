import React from "react";

export default function BureauHomeDashboard() {
  // Dummy data for dashboard
  const stats = [
    { label: "Househelps Registered", value: 42 },
    { label: "Households Served", value: 17 },
    { label: "Active Contracts", value: 8 },
    { label: "Completed Placements", value: 35 },
    { label: "Pending Applications", value: 5 },
    { label: "Commercial Partners", value: 3 },
    { label: "Revenue (This Month)", value: "$2,500" },
    { label: "Avg. Placement Time", value: "5 days" },
  ];

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-bold mb-4 text-primary dark:text-primary-300">Bureau Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-100 dark:border-slate-700 p-4 sm:p-5 flex flex-col items-center"
          >
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-300 mb-2">
              {stat.value}
            </div>
            <div className="text-gray-500 dark:text-gray-300 text-base text-center">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 sm:mt-8">
        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Recent Activity</h3>
        <ul className="space-y-2">
          <li className="text-gray-500 dark:text-gray-300">Placed househelp Mary W. with household #1234</li>
          <li className="text-gray-500 dark:text-gray-300">Onboarded new househelp James K.</li>
          <li className="text-gray-500 dark:text-gray-300">Closed contract with commercial partner CleanCo</li>
          <li className="text-gray-500 dark:text-gray-300">Received 3 new applications today</li>
        </ul>
      </div>
    </div>
  );
}
