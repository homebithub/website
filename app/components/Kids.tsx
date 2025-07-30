import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import ChildModal from './ChildModal';
import ExpectingModal from './ExpectingModal';
import { Child } from './Children';

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

  // Update local state when initialChildren prop changes
  useEffect(() => {
    setChildren(initialChildren);
  }, [initialChildren]);

  const handleAddChild = (childData: Omit<Child, 'id'>) => {
    const newChild = { 
      ...childData, 
      id: Date.now().toString(),
      // Ensure consistent field names
      date_of_birth: childData.date_of_birth || childData.dob,
      is_expecting: childData.is_expecting || childData.isExpecting
    };
    
    const updatedChildren = [...children, newChild];
    setChildren(updatedChildren);
    onChildrenUpdate(updatedChildren);
  };

  const handleUpdateChild = (index: number, childData: Omit<Child, 'id'>) => {
    const updatedChildren = [...children];
    updatedChildren[index] = { 
      ...childData, 
      id: updatedChildren[index].id,
      // Ensure consistent field names
      date_of_birth: childData.date_of_birth || childData.dob,
      is_expecting: childData.is_expecting || childData.isExpecting
    };
    setChildren(updatedChildren);
    onChildrenUpdate(updatedChildren);
  };

  const handleRemoveChild = (index: number) => {
    const updatedChildren = children.filter((_, i) => i !== index);
    setChildren(updatedChildren);
    onChildrenUpdate(updatedChildren);
  };

  const handleEditChild = (index: number) => {
    setEditingChild(children[index]);
    setEditingIndex(index);
    setShowChildModal(true);
  };

  const handleSaveChild = async (childData: Omit<Child, 'id'>): Promise<void> => {
    return new Promise((resolve) => {
      if (editingIndex >= 0) {
        handleUpdateChild(editingIndex, childData);
      } else {
        handleAddChild(childData);
      }
      setShowChildModal(false);
      setEditingChild(null);
      setEditingIndex(-1);
      resolve();
    });
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
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => {
            setEditingChild(null);
            setShowChildModal(true);
          }}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Child
        </button>
        <button
          type="button"
          onClick={() => setShowExpectingModal(true)}
          className="flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-medium border border-primary-200 hover:bg-primary-200 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Expecting a Child
        </button>
      </div>

      {children.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traits</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {children.map((child, index) => {
                const isExpecting = child.is_expecting || child.isExpecting;
                const dateOfBirth = child.date_of_birth || child.dob;
                
                return (
                  <tr key={child.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {child.gender || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isExpecting ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Due: {formatDate(child.expected_date)}
                        </span>
                      ) : (
                        formatDate(dateOfBirth)
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {child.traits?.map((trait) => (
                          <span 
                            key={trait} 
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {trait}
                          </span>
                        ))}
                        {isExpecting && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Expecting
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleEditChild(index)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveChild(index)}
                        className="text-red-600 hover:text-red-900"
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
        onSave={(data) => {
          handleAddChild({
            ...data,
            is_expecting: true,
            expected_date: data.expected_date,
            date_of_birth: data.expected_date, // For display consistency
            traits: []
          });
          setShowExpectingModal(false);
        }}
      />
    </div>
  );
};

export default Kids;
