import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import ChildModal from './modals/ChildModal';
import ExpectingModal from './ExpectingModal';
import type { Child } from './Children';
import { API_BASE_URL } from '~/config/api';
import { handleApiError } from '../utils/errorMessages';

interface KidsProps {
  onChildrenUpdate: (children: Child[]) => void;
  initialChildren?: Child[];
  className?: string;
}

const Kids: React.FC<KidsProps> = ({ onChildrenUpdate, initialChildren = [], className = '' }) => {
  const [children, setChildren] = useState<Child[]>(initialChildren);
  const [showChildModal, setShowChildModal] = useState(false);
  const [showExpectingModal, setShowExpectingModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update local state when initialChildren prop changes
  useEffect(() => {
    setChildren(initialChildren);
  }, [initialChildren]);

  const handleRemoveChild = async (index: number) => {
    try {
      const childId = children[index].id;
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_BASE_URL}/api/v1/household_kids/${childId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      
      if (!res.ok) throw new Error("Failed to delete child");
      
      const updatedChildren = children.filter((_, i) => i !== index);
      setChildren(updatedChildren);
      onChildrenUpdate(updatedChildren);
    } catch (err: any) {
      console.error("Failed to delete child:", err);
      alert(handleApiError(err, 'children', 'Failed to delete child'));
    }
  };

  const handleEditChild = (index: number) => {
    setEditingChild(children[index]);
    setEditingIndex(index);
    setShowChildModal(true);
  };

  const handleSaveChild = async (childData: Omit<Child, 'id'>): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      
      if (editingIndex >= 0) {
        // Update existing child
        const childId = children[editingIndex].id;
        const res = await fetch(`${API_BASE_URL}/api/v1/household_kids/${childId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(childData),
        });
        
        if (!res.ok) throw new Error("Failed to update child");
        const updatedChild = await res.json();
        
        const updatedChildren = [...children];
        updatedChildren[editingIndex] = updatedChild;
        setChildren(updatedChildren);
        onChildrenUpdate(updatedChildren);
      } else {
        // Create new child
        const res = await fetch(`${API_BASE_URL}/api/v1/household_kids`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(childData),
        });
        
        if (!res.ok) throw new Error("Failed to save child");
        const savedChild = await res.json();
        
        const updatedChildren = [...children, savedChild];
        setChildren(updatedChildren);
        onChildrenUpdate(updatedChildren);
      }
      
      setShowChildModal(false);
      setEditingChild(null);
      setEditingIndex(-1);
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      throw new Error(handleApiError(err, 'children', 'Failed to save child'));
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString; // Return as is if date parsing fails
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Success Message */}
      {saveSuccess && (
        <div className="p-4 rounded-xl text-sm font-semibold border-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30">
          ✓ Child saved successfully
        </div>
      )}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => {
            setEditingChild(null);
            setShowChildModal(true);
          }}
          className="flex items-center gap-2 px-6 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <PlusIcon className="h-5 w-5" />
          Add Child
        </button>
        <button
          type="button"
          onClick={() => setShowExpectingModal(true)}
          className="flex items-center gap-2 px-6 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <PlusIcon className="h-5 w-5" />
          Expecting a Child
        </button>
      </div>

      {children.length > 0 && (
        <div className="overflow-x-auto rounded-xl border-2 border-purple-200 dark:border-purple-500/30">
          <table className="min-w-full bg-white dark:bg-gray-900">
            <thead className="bg-purple-50 dark:bg-purple-900/20">
              <tr>
                <th className="px-6 py-1.5 text-left text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-1.5 text-left text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Date of Birth</th>
                <th className="px-6 py-1.5 text-left text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Traits</th>
                <th className="px-6 py-1.5 text-right text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-purple-100 dark:divide-purple-500/20">
              {children.map((child, index) => {
                const isExpecting = child.is_expecting || child.isExpecting;
                const dateOfBirth = child.date_of_birth || child.dob;
                
                return (
                  <tr key={child.id || index} className="hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                    <td className="px-6 py-1 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white capitalize">
                      {child.gender || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {isExpecting ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                          Due: {formatDate(child.expected_date)}
                        </span>
                      ) : (
                        formatDate(dateOfBirth)
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {child.traits?.map((trait) => (
                          <span 
                            key={trait} 
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                          >
                            {trait}
                          </span>
                        ))}
                        {isExpecting && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                            Expecting
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-1 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleEditChild(index)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveChild(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                        aria-label="Remove child"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ChildModal
        isOpen={showChildModal}
        onClose={() => {
          setShowChildModal(false);
          setEditingChild(null);
          setEditingIndex(-1);
        }}
        onSave={handleSaveChild}
        initialData={editingChild}
      />

      <ExpectingModal
        isOpen={showExpectingModal}
        onClose={() => setShowExpectingModal(false)}
        onSave={async (data) => {
          try {
            const token = localStorage.getItem("token");
            
            // Save expecting child to database
            const res = await fetch(`${API_BASE_URL}/api/v1/household_kids`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                gender: data.gender,
                is_expecting: true,
                expected_date: data.expected_date,
                notes: data.notes || "",
                traits: []
              }),
            });
            
            if (!res.ok) throw new Error("Failed to save expecting child");
            const savedChild = await res.json();
            
            const updatedChildren = [...children, savedChild];
            setChildren(updatedChildren);
            onChildrenUpdate(updatedChildren);
            
            setShowExpectingModal(false);
            
            // Show success message
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
          } catch (err: any) {
            console.error("Failed to save expecting child:", err);
            alert(handleApiError(err, 'children', 'Failed to save expecting child'));
          }
        }}
      />
    </div>
  );
};

export default Kids;
