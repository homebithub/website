import React, { useState } from 'react';
import { HouseholdProfileData } from '../HouseholdProfileModal';

interface LocationStepProps {
  data: HouseholdProfileData;
  onUpdate: (data: Partial<HouseholdProfileData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface Child {
  name: string;
  age: number;
  gender: string;
}

export function ChildrenStep({ data, onUpdate, onNext }: LocationStepProps) {
  const [hasChildren, setHasChildren] = useState(data.children.hasChildren);
  const [expecting, setExpecting] = useState(data.children.expecting);
  const [children, setChildren] = useState<Child[]>(data.children.children);
  const [dueDate, setDueDate] = useState(data.children.dueDate || '');
  const [showChildForm, setShowChildForm] = useState(false);
  const [newChild, setNewChild] = useState<Child>({ name: '', age: 0, gender: '' });

  const handleChildStatusChange = (status: 'has' | 'expecting' | 'none') => {
    if (status === 'has') {
      setHasChildren(true);
      setExpecting(false);
    } else if (status === 'expecting') {
      setHasChildren(false);
      setExpecting(true);
    } else {
      setHasChildren(false);
      setExpecting(false);
    }
    
    onUpdate({
      children: {
        hasChildren: status === 'has',
        expecting: status === 'expecting',
        children: status === 'has' ? children : [],
        dueDate: status === 'expecting' ? dueDate : undefined
      }
    });
  };

  const handleAddChild = () => {
    if (newChild.name && newChild.age > 0 && newChild.gender) {
      const updatedChildren = [...children, newChild];
      setChildren(updatedChildren);
      setNewChild({ name: '', age: 0, gender: '' });
      setShowChildForm(false);
      
      onUpdate({
        children: {
          ...data.children,
          children: updatedChildren
        }
      });
    }
  };

  const handleRemoveChild = (index: number) => {
    const updatedChildren = children.filter((_, i) => i !== index);
    setChildren(updatedChildren);
    
    onUpdate({
      children: {
        ...data.children,
        children: updatedChildren
      }
    });
  };

  const handleDueDateChange = (date: string) => {
    setDueDate(date);
    onUpdate({
      children: {
        ...data.children,
        dueDate: date
      }
    });
  };

  const handleNext = () => {
    // If they have children, ensure at least one child is added
    if (hasChildren && children.length === 0) {
      return;
    }
    
    // If they're expecting, ensure due date is set
    if (expecting && !dueDate) {
      return;
    }
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Tell us about your children</h3>
        <p className="text-gray-600">This helps us find the right househelp for your family</p>
      </div>

      <div className="space-y-4">
        {/* Child Status Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Do you have or are expecting children?
          </label>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="childStatus"
                checked={hasChildren}
                onChange={() => handleChildStatusChange('has')}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">I have children</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="childStatus"
                checked={expecting}
                onChange={() => handleChildStatusChange('expecting')}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">I'm expecting a child</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="childStatus"
                checked={!hasChildren && !expecting}
                onChange={() => handleChildStatusChange('none')}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">No children</span>
            </label>
          </div>
        </div>

        {/* Existing Children Section */}
        {hasChildren && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-gray-900">Your Children</h4>
              <button
                type="button"
                onClick={() => setShowChildForm(true)}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Child
              </button>
            </div>

            {children.length > 0 && (
              <div className="space-y-2">
                {children.map((child, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{child.name}</span>
                      <span className="text-gray-600 ml-2">
                        {child.age} years old, {child.gender}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveChild(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showChildForm && (
              <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                <h5 className="font-medium">Add Child Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Child's name"
                    value={newChild.name}
                    onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={newChild.age || ''}
                    onChange={(e) => setNewChild({ ...newChild, age: parseInt(e.target.value) || 0 })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  />
                  <select
                    value={newChild.gender}
                    onChange={(e) => setNewChild({ ...newChild, gender: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleAddChild}
                    disabled={!newChild.name || !newChild.age || !newChild.gender}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    Add Child
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChildForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expecting Child Section */}
        {expecting && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>
        )}

        {/* No Children - Skip to next step */}
        {!hasChildren && !expecting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  No children selected. You can proceed to select your househelp requirements.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={
            (hasChildren && children.length === 0) ||
            (expecting && !dueDate)
          }
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
} 