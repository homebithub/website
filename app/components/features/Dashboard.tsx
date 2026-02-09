import React from 'react';

interface Profile {
  id: number;
  name: string;
  role: string;
  experience: string;
  location: string;
  skills: string[];
  availability: string;
}

const sampleProfiles: Profile[] = [
  {
    id: 1,
    name: "Jane Doe",
    role: "Professional Nanny",
    experience: "5 years",
    location: "Nairobi, Kenya",
    skills: ["Child Care", "Cooking", "First Aid", "Light Housekeeping"],
    availability: "Immediate"
  },
  {
    id: 2,
    name: "Mary Smith",
    role: "Housekeeper",
    experience: "3 years",
    location: "Mombasa, Kenya",
    skills: ["Cleaning", "Laundry", "Pet Care", "Organizing"],
    availability: "2 weeks notice"
  },
  {
    id: 3,
    name: "Grace Johnson",
    role: "Nanny/Housekeeper",
    experience: "7 years",
    location: "Kisumu, Kenya",
    skills: ["Child Care", "Cooking", "Cleaning", "Elder Care"],
    availability: "Available weekdays"
  }
];

const Dashboard = () => {
  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {sampleProfiles.map((profile) => (
        <div 
          key={profile.id}
          className="bg-white rounded-xl shadow-card p-6 border border-primary-100 hover:border-primary-500 transition-all duration-300"
        >
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-primary-800">{profile.name}</h2>
              <p className="text-primary-600">{profile.role}</p>
            </div>
            
            <div className="space-y-3 flex-grow">
              <div>
                <p className="text-text"><span className="font-medium">Experience:</span> {profile.experience}</p>
                <p className="text-text"><span className="font-medium">Location:</span> {profile.location}</p>
                <p className="text-text"><span className="font-medium">Availability:</span> {profile.availability}</p>
              </div>
              
              <div>
                <p className="font-medium text-text mb-2">Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button className="mt-4 w-full bg-primary-600 text-white py-1 px-4 rounded-xl hover:bg-primary-700 transition-colors duration-300">
              View Profile
            </button>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default Dashboard;
