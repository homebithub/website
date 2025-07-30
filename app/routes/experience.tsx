import React from 'react';
import YearsOfExperience from '../components/YearsOfExperience';

const ExperiencePage = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Your Experience</h1>
                    <p className="text-gray-600">Let us know about your professional experience</p>
                </div>
                <YearsOfExperience />
            </div>
        </div>
    );
};

export default ExperiencePage;
