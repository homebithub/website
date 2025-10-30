import React, { useState, useEffect } from "react";
import { handleApiError } from '../utils/errorMessages';
import { API_BASE_URL } from '~/config/api';

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
  const [needsLiveIn, setNeedsLiveIn] = useState<boolean>(false);
  const [needsDayWorker, setNeedsDayWorker] = useState<boolean>(false);
  const [availableFrom, setAvailableFrom] = useState<string>("");
  const [availability, setAvailability] = useState<AvailabilityType>(initialAvailability);
  const [offDays, setOffDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Different endpoints based on user type
        const endpoint = userType === 'household' 
          ? `${API_BASE_URL}/api/v1/household/profile`
          : `${API_BASE_URL}/api/v1/househelps/me/fields`;
        
        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (userType === 'household') {
            if (data.needs_live_in !== undefined) setNeedsLiveIn(data.needs_live_in);
            if (data.needs_day_worker !== undefined) setNeedsDayWorker(data.needs_day_worker);
            if (data.live_in_off_days) setOffDays(data.live_in_off_days);
            if (data.available_from) setAvailableFrom(data.available_from.split('T')[0]);
            if (data.day_worker_schedule) {
              try {
                const schedule = typeof data.day_worker_schedule === 'string' 
                  ? JSON.parse(data.day_worker_schedule) 
                  : data.day_worker_schedule;
                setAvailability(schedule);
              } catch (e) {
                console.error('Failed to parse schedule:', e);
              }
            }
          } else {
            // For househelp
            if (data.offers_live_in !== undefined) setNeedsLiveIn(data.offers_live_in);
            if (data.offers_day_worker !== undefined) setNeedsDayWorker(data.offers_day_worker);
            if (data.off_days) setOffDays(data.off_days);
            if (data.available_from) setAvailableFrom(data.available_from.split('T')[0]);
            if (data.availability_schedule) {
              try {
                const schedule = typeof data.availability_schedule === 'string' 
                  ? JSON.parse(data.availability_schedule) 
                  : data.availability_schedule;
                setAvailability(schedule);
              } catch (e) {
                console.error('Failed to parse schedule:', e);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load service type:', err);
      }
    };
    loadData();
  }, [userType]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!needsLiveIn && !needsDayWorker) {
      setError(userType === 'household' 
        ? "Please select at least one type of househelp."
        : "Please select at least one type of work you offer.");
      return;
    }
    if (!availableFrom || isNaN(Date.parse(availableFrom))) {
      setError("Please select the 'Available from' date.");
      return;
    }
    if (needsDayWorker) {
      const hasAvailability = Object.values(availability).some(daySlots => Object.values(daySlots).some(Boolean));
      if (!hasAvailability) {
        setError("Please select at least one available day or time slot.");
        return;
      }
    }
    if (needsLiveIn && offDays.length === 0) {
      setError(userType === 'household'
        ? "Please select at least one off day for your live-in househelp."
        : "Please select at least one off day.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Different endpoints for household vs househelp
      if (userType === 'household') {
        // For household, save to household profile with step metadata
        const res = await fetch(`${API_BASE_URL}/api/v1/household/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            needs_live_in: needsLiveIn,
            ...(needsLiveIn && offDays.length > 0 && { live_in_off_days: offDays }),
            needs_day_worker: needsDayWorker,
            ...(needsDayWorker && { day_worker_schedule: JSON.stringify(availability) }),
            available_from: availableFrom,
            _step_metadata: {
              step_id: "nannytype",
              step_number: 2,
              is_completed: true
            }
          }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Failed to save service type:", errorData);
          throw new Error(errorData.message || "Failed to save service type. Please try again.");
        }
        setSuccess("Service type saved successfully!");
      } else {
        // For househelp, save to househelps/me/fields
        const res = await fetch(`${API_BASE_URL}/api/v1/househelps/me/fields`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            updates: {
              offers_live_in: needsLiveIn,
              ...(needsLiveIn && offDays.length > 0 && { off_days: offDays }),
              offers_day_worker: needsDayWorker,
              ...(needsDayWorker && { availability_schedule: JSON.stringify(availability) }),
              available_from: availableFrom,
            },
            _step_metadata: {
              step_id: "nannytype",
              step_number: 2,
              is_completed: true
            }
          }),
        });
        if (!res.ok) throw new Error("Failed to save availability. Please try again.");
        setSuccess("Service type saved successfully!");
      }
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
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">🏠 Service Type</h2>
      <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
        {userType === 'household' 
          ? 'What type of help are you looking for? (You can select both)'
          : 'What type of work do you offer? (You can select both)'}
      </p>
      {/* Live-in Option */}
      <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${needsLiveIn ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100" : "border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
        <input
          type="checkbox"
          checked={needsLiveIn}
          onChange={(e) => setNeedsLiveIn(e.target.checked)}
          className="form-checkbox h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500 rounded"
        />
        <span className="flex-1">🌙 Live-in {userType === 'household' ? '(Lives with you)' : '(I can live with the family)'}</span>
      </label>
      
      {/* Off Days Selection for Live-in */}
      {needsLiveIn && (
        <div className="space-y-4 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-500/30">
          <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400">
            📅 Select Off Days <span className="text-sm text-gray-500 dark:text-gray-400">(Up to 3 days)</span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {userType === 'household' 
              ? 'Choose which days your sleep-in helper will have off'
              : 'Choose which days you would like to have off'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {DAYS.map((day) => (
              <label 
                key={day}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  offDays.includes(day)
                    ? 'border-purple-500 bg-purple-100 dark:bg-purple-800/40 text-purple-900 dark:text-purple-100' 
                    : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] hover:bg-purple-50 dark:hover:bg-purple-900/20'
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
                    ? 'border-purple-500 bg-purple-500' 
                    : 'border-purple-300 dark:border-purple-500/50'
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
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">
              ✓ Selected: {offDays.join(', ')} ({offDays.length}/3)
            </p>
          )}
        </div>
      )}
      
      {/* Day Worker Option */}
      <label className={`flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${needsDayWorker ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100" : "border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20"}`}>
        <input
          type="checkbox"
          checked={needsDayWorker}
          onChange={(e) => setNeedsDayWorker(e.target.checked)}
          className="form-checkbox h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500 rounded"
        />
        <span className="flex-1">☀️ Day Worker {userType === 'household' ? '(Comes during the day)' : '(I work during the day)'}</span>
      </label>
      
      {needsDayWorker && (
        <div className={`bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border-2 overflow-x-auto ${error && error.includes('available day or time slot') ? 'border-red-500 dark:border-red-400' : 'border-purple-200 dark:border-purple-500/30'}`}>
          <div className="mb-4 font-bold text-lg text-center text-purple-700 dark:text-purple-400">📅 Select Availability</div>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">Click day names or time slots to select all. Click individual cells to toggle.</p>
          <table className="min-w-full table-fixed border-separate border-spacing-y-0">
            <thead>
              <tr>
                <th className="w-24 px-2 py-2 text-sm text-purple-700 dark:text-purple-400 font-bold text-left"></th>
                {TIMES.map(time => (
                  <th key={time} className="w-20 px-2 py-2 text-sm text-purple-700 dark:text-purple-400 font-bold capitalize text-center -ml-2">
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
                  <td className="px-2 py-1 font-semibold text-purple-700 dark:text-purple-400 text-left text-sm">
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
      <div className="space-y-3">
        <label className="block text-base font-bold text-purple-700 dark:text-purple-400">
          📆 Available from <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={availableFrom}
          onChange={e => setAvailableFrom(e.target.value)}
          className={`w-full h-14 px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all ${(!availableFrom || isNaN(Date.parse(availableFrom))) && error && error.includes('Available from') ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-purple-200 dark:border-purple-500/30'} [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100`}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>
      {error && (
        <div className="p-4 rounded-xl text-sm font-semibold border-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl text-sm font-semibold border-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30">
          ✓ {success}
        </div>
      )}
      <button
        type="button"
        className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        onClick={handleSubmit}
        disabled={
          loading || 
          (!needsLiveIn && !needsDayWorker) || 
          !availableFrom || 
          isNaN(Date.parse(availableFrom)) ||
          (needsDayWorker && !Object.values(availability).some(daySlots => Object.values(daySlots).some(Boolean))) ||
          (needsLiveIn && offDays.length === 0)
        }
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : (
          <>
            💾 Save
          </>
        )}
      </button>
   
        </div>
  );
};

export default NanyType;
