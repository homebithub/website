'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '~/config/api';

interface Househelp {
  id: string;
  address: string;
  bio: string;
  profile_status: string;
  avatar_url: string;
  verified: boolean;
  skills: string[] | null;
  experience: number;
  hourly_rate: number;
  languages: string[] | null;
  specialities: string[] | null;
  references: string[] | null;
  user_id: string;
  bureau_id: string;
  'national_id_no;not null': string;
  date_of_birth: string;
  telephone_alt: string;
  current_location: string;
  home_area: string;
  nearest_shopping_center: string;
  person_known: string;
  person_known_tel: string;
  nearest_school: string;
  nearest_church: string;
  county_of_residence: string;
  sub_county: string;
  location: string;
  religion: string;
  village: string;
  chief_name: string;
  chief_tel: string;
  marital_status: string;
  no_of_children_and_age: string;
  fathers_name: string;
  fathers_tel: string;
  mothers_name: string;
  mothers_tel: string;
  education_level: string;
  school_name: string;
  diseases: string;
  next_of_kin: string;
  next_of_kin_tel: string;
  referee: string;
  referee_tel: string;
  salary_expectation: number;
  salary_frequency: string;
  availability: string;
  home_contact: string;
  home_contact_tel: string;
  signature: string;
  signed_date: string;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  profile_type: string;
  last_name: string;
  phone: string;
  email_verified: boolean;
  country: string;
  role: string;
  status: string;
  auth_provider: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

interface HousehelpData {
  Househelp: Househelp;
  User: User;
}

const HousehelpsTable = () => {
  const [househelps, setHousehelps] = useState<HousehelpData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHousehelps = async () => {
      try {
        // You should replace this with your actual JWT token
        const token = 'your_jwt_token';
        localStorage.setItem('jwt', token);

        const response = await fetch(
          `${API_BASE_URL}/api/v1/househelps/bureau/e0eabd6e-491f-4dea-92ea-e27a198a47f9?limit=20&offset=0`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        setHousehelps(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHousehelps();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-800 mb-6 dark:text-primary-400">List of Househelps</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-700">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Phone</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Location</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Experience</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Availability</th>
            </tr>
          </thead>
          <tbody>
            {househelps.length > 0 ? (
              househelps.map((item) => (
                <tr key={item.Househelp.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600">
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{`${item.User.first_name} ${item.User.last_name}`}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{item.User.phone}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{item.Househelp.current_location}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{item.Househelp.experience} years</td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{new Date(item.Househelp.availability).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">
                  List of househelps will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HousehelpsTable;
