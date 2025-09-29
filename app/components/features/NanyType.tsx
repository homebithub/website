import React, { useState } from "react";
import { handleApiError } from '../../utils/errorMessages';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = ["morning", "afternoon", "evening"];

interface NannyTypeProps {
  userType?: 'househelp' | 'household';
}

type TimeSlots = Record<string, boolean>;
type AvailabilityType = Record<string, TimeSlots>;

const initialAvailability: AvailabilityType = DAYS.reduce((acc, day) => {
  acc[day.toLowerCase()] = { morning: false, afternoon: false, evening: false };
  return acc;
}, {} as AvailabilityType);

const NanyType: React.FC<NannyTypeProps> = ({ userType = 'househelp' }) => {
  const [selected, setSelected] = useState<string>("");
  const [availableFrom, setAvailableFrom] = useState<string>("");
  const [availability, setAvailability] = useState<AvailabilityType>(initialAvailability);
  const [offDays, setOffDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!selected) {
      setError("Please select the type of househelp.");
      return;
    }
    if (!availableFrom || isNaN(Date.parse(availableFrom))) {
      setError("Please select the 'Available from' date.");
      return;
    }
    if (selected === "day") {
      const hasAvailability = Object.values(availability).some(daySlots => Object.values(daySlots).some(Boolean));
      if (!hasAvailability) {
        setError("Please select at least one available day or time slot.");
        return;
      }
    }
    if (userType === 'household' && selected === 'sleep_in' && offDays.length === 0) {
      setError("Please select at least one off day for your sleep-in househelp.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/v1/househelp-preferences/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          availability,
          available_from: availableFrom,
          ...(userType === 'household' && selected === 'sleep_in' && { off_days: offDays }),
        }),
      });
      if (!res.ok) throw new Error("Failed to save availability. Please try again.");
      setSuccess("Availability updated successfully!");
    } catch (err: any) {
      setError(handleApiError(err, 'nannyType', 'An error occurred.'));
    } finally {
      setLoading(false);
    }
  };


  const toggleSlot = (day: string, time: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: !prev[day][time as keyof TimeSlots],
      },
    }));
  };

  const handleOffDayChange = (day: string) => {
    setOffDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else if (prev.length < 3) {
        return [...prev, day];
      }
      return prev;
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-gray-100 p-8 rounded-xl shadow-lg flex flex-col gap-8">
      
      
      <h2 className="text-2xl font-extrabold text-primary mb-4 text-center">Type of househelp</h2>
      <div className="flex flex-col gap-5">
        <label className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${selected === "sleep_in" ? "border-primary-500 bg-primary-50 text-primary-900" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
          <input
            type="radio"
            name="nanyType"
            value="sleep_in"
            checked={selected === "sleep_in"}
            onChange={() => setSelected("sleep_in")}
            className="form-radio h-5 w-5 text-primary-600 border-gray-300 mr-2"
          />
          <span>Sleep in</span>
        </label>
        <label className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${selected === "day" ? "border-primary-500 bg-primary-50 text-primary-900" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
          <input
            type="radio"
            name="nanyType"
            value="day"
            checked={selected === "day"}
            onChange={() => setSelected("day")}
            className="form-radio h-5 w-5 text-primary-600 border-gray-300 mr-2"
          />
          <span>Day burg</span>
        </label>
      </div>
      
      {/* Off Days Selection for Household Sleep-in Nanny */}
      {userType === 'household' && selected === 'sleep_in' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Select Off Days <span className="text-xs text-gray-400">(Select up to 3 days)</span>
          </h3>
          <p className="text-sm text-gray-600">
            Choose which days of the week your sleep-in househelp will have off.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {DAYS.map((day) => (
              <label 
                key={day}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  offDays.includes(day)
                    ? 'border-primary-500 bg-primary-50 text-primary-900' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                } ${offDays.length === 3 && !offDays.includes(day) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={offDays.includes(day)}
                  onChange={() => handleOffDayChange(day)}
                  disabled={offDays.length === 3 && !offDays.includes(day)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                  offDays.includes(day)
                    ? 'border-primary-500 bg-primary-500' 
                    : 'border-gray-300'
                }`}>
                  {offDays.includes(day) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium">{day}</span>
              </label>
            ))}
          </div>
          {offDays.length > 0 && (
            <p className="text-sm text-gray-500">
              Selected: {offDays.join(', ')} ({offDays.length}/3)
            </p>
          )}
        </div>
      )}
      
      {selected === "day" && (
        <div className={`bg-slate-50 p-4 rounded-xl border mt-4 overflow-x-auto ${error && error.includes('available day or time slot') ? 'border-red-500' : 'border-slate-100'}`}>
          <div className="mb-2 font-semibold text-center text-primary-700">Select Availability</div>
          <table className="min-w-full table-fixed border-separate border-spacing-y-0">
            <thead>
              <tr>
                <th className="w-24 px-2 py-2 text-sm text-slate-700 font-medium text-left"></th>
                {TIMES.map(time => (
                  <th key={time} className="w-20 px-2 py-2 text-sm text-slate-700 font-medium capitalize text-center -ml-2">
                    <button
                      type="button"
                      className="w-full focus:outline-none"
                      onClick={() => {
                        // Toggle all for this time
                        const allSelected = DAYS.every(day => availability[day.toLowerCase()][time]);
                        setAvailability(prev => {
                          const updated = { ...prev };
                          DAYS.forEach(day => {
                            updated[day.toLowerCase()] = { ...updated[day.toLowerCase()], [time]: !allSelected };
                          });
                          return updated;
                        });
                      }}
                    >
                      {time.charAt(0).toUpperCase() + time.slice(1)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day}>
                  <td className="px-2 py-1 font-semibold text-slate-700 text-left">
                    <button
                      type="button"
                      className="w-full text-left focus:outline-none"
                      onClick={() => {
                        // Toggle all for this day
                        const allSelected = TIMES.every(time => availability[day.toLowerCase()][time]);
                        setAvailability(prev => ({
                          ...prev,
                          [day.toLowerCase()]: TIMES.reduce((acc, time) => {
                            acc[time] = !allSelected;
                            return acc;
                          }, {} as TimeSlots),
                        }));
                      }}
                    >
                      {day}
                    </button>
                  </td>
                  {TIMES.map(time => (
                    <td key={time} className="w-20 px-2 py-1 text-center align-middle">
                      <button
                        type="button"
                        aria-label={`Toggle ${day} ${time}`}
                        onClick={() => toggleSlot(day.toLowerCase(), time)}
                        className={`w-8 h-8 rounded border flex items-center justify-center transition focus:outline-none
                          ${availability[day.toLowerCase()][time as keyof TimeSlots]
                            ? "bg-purple-700 border-purple-700 text-white"
                            : "bg-white border-purple-400 text-purple-700 hover:bg-purple-50"}
                        `}
                      >
                        {availability[day.toLowerCase()][time as keyof TimeSlots] && (
                          <svg className="w-5 h-5" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        

        </div>
      )}
      <div className="mt-8">
        <label className="block mb-2 font-semibold text-gray-700">Available from <span className="text-red-500">*</span></label>
        <input
          type="date"
          value={availableFrom}
          onChange={e => setAvailableFrom(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${(!availableFrom || isNaN(Date.parse(availableFrom))) && error && error.includes('Available from') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-purple-300 hover:border-purple-400'} [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100`}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>
      <button
        type="button"
        className={`mt-8 w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 rounded-lg shadow-sm transition ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
      {success && <div className="mt-4 text-green-600 text-center">{success}</div>}
   
        </div>
  );
};

export default NanyType;
