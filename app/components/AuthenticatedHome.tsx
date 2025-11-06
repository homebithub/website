import React, { useState, useEffect } from 'react';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { API_BASE_URL } from '~/config/api';
import { apiClient } from '~/utils/apiClient';

interface HousehelpProfile {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  years_of_experience?: number;
  salary_expectation?: string;
  salary_frequency?: string;
  location?: string;
  bio?: string;
}

export default function AuthenticatedHome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [househelps, setHousehelps] = useState<HousehelpProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHousehelps();
  }, []);

  const loadHousehelps = async () => {
    try {
      // Requires auth; redirect on 401
      const res = await apiClient.auth(`${API_BASE_URL}/api/v1/househelps`, { method: 'GET' });
      const data = await apiClient.json<HousehelpProfile[]>(res);
      setHousehelps(data);
    } catch (err) {
      console.error('Error loading househelps:', err);
      // Error is already handled by apiClient for 401; still show message
      setError('Failed to load househelps');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="low">
        <main className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search Bar Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 mb-8 shadow-lg">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Find Your Perfect Househelp
              </h1>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, location, or skills..."
                  className="w-full px-6 py-4 rounded-xl text-lg focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  🔍 Search
                </button>
              </form>
            </div>

            {/* Househelp Profiles Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Available Househelps
              </h2>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30 rounded-xl p-6 text-center">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              ) : househelps.length === 0 ? (
                <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No househelps available at the moment. Check back soon!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {househelps.map((househelp) => (
                    <div
                      key={househelp.id}
                      className="bg-white dark:bg-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
                    >
                      {/* Profile Picture */}
                      <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                          {househelp.profile_picture ? (
                            <img
                              src={househelp.profile_picture}
                              alt={`${househelp.first_name} ${househelp.last_name}`}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            `${househelp.first_name?.[0] || ''}${househelp.last_name?.[0] || ''}`
                          )}
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                        {househelp.first_name} {househelp.last_name}
                      </h3>

                      {/* Location */}
                      {househelp.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                          📍 {househelp.location}
                        </p>
                      )}

                      {/* Experience */}
                      {househelp.years_of_experience && (
                        <p className="text-sm text-purple-600 dark:text-purple-400 text-center mb-3">
                          ⭐ {househelp.years_of_experience} years experience
                        </p>
                      )}

                      {/* Salary */}
                      {househelp.salary_expectation && (
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center mb-3">
                          💰 {househelp.salary_expectation}
                          {househelp.salary_frequency && ` per ${househelp.salary_frequency.replace('ly', '')}`}
                        </p>
                      )}

                      {/* Bio Preview */}
                      {househelp.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center line-clamp-2 mb-4">
                          {househelp.bio}
                        </p>
                      )}

                      {/* View Profile Button */}
                      <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
