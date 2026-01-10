import React, { useState } from 'react';
import AddProject from './AddProject';
import AddCertificate from './AddCertificate';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('project');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>

        <div className="flex justify-center mb-8 gap-4">
          <button
            onClick={() => setActiveTab('project')}
            className={`px-6 py-2 rounded-lg transition-all duration-300 ${
              activeTab === 'project'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Add Project
          </button>
          <button
            onClick={() => setActiveTab('certificate')}
            className={`px-6 py-2 rounded-lg transition-all duration-300 ${
              activeTab === 'certificate'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Add Certificate
          </button>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          {activeTab === 'project' ? <AddProject /> : <AddCertificate />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
