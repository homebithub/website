import React, { useState } from 'react';
import type { HouseholdProfileData } from '../../../types/household-profile';
import ChildModal from '../../modals/ChildModal';
import ExpectingModal from '../../modals/ExpectingModal';

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
  const [showChildModal, setShowChildModal] = useState(false);
  const [showExpectingModal, setShowExpectingModal] = useState(false);
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

  const handleSaveChild = async (childData: { gender: string; date_of_birth: string; traits: string[] }) => {
    // Calculate age from date of birth
    const birthDate = new Date(childData.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    const newChildData: Child = {
      name: '', // We'll need to add name field to modal or use a default
      age: age,
      gender: childData.gender
    };
    
    const updatedChildren = [...children, newChildData];
    setChildren(updatedChildren);
    setShowChildModal(false);
    
    onUpdate({
      children: {
        ...data.children,
        children: updatedChildren
      }
    });
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
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">👶🏿 Children</h3>
        <p className="text-gray-400">Tell us about your children so we can find the perfect match</p>
      </div>

      <div className="space-y-4">
        {/* Child Status Selection */}
        <div className="space-y-4">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleChildStatusChange('has')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                hasChildren
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-gray-800 hover:border-purple-400'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                hasChildren ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
              }`}>
                {hasChildren && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
              </div>
              <span className="text-lg">👨‍👩‍👧‍👦</span>
              <span className="font-medium text-gray-900 dark:text-white">I have/expecting a child</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleChildStatusChange('none')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                !hasChildren && !expecting
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-gray-800 hover:border-purple-400'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                !hasChildren && !expecting ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
              }`}>
                {!hasChildren && !expecting && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
              </div>
              <span className="text-lg">🚫</span>
              <span className="font-medium text-gray-900 dark:text-white">I do not have children</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        {hasChildren && (
          <div className="space-y-6">
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowChildModal(true)}
                className="flex items-center gap-2 px-6 py-1.5 font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg dark:shadow-glow-md hover:scale-105 transition-all"
              >
                <span className="text-xl">➕</span>
                Add Child
              </button>
              <button
                type="button"
                onClick={() => setShowExpectingModal(true)}
                className="flex items-center gap-2 px-6 py-1.5 font-semibold bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-400 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-700 hover:scale-105 transition-all"
              >
                <span className="text-xl">🤰🏿</span>
                Expecting a Child
              </button>
            </div>

            {children.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Your Children</h4>
                {children.map((child, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 rounded-xl">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">{child.name || `Child ${index + 1}`}</span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        {child.age} years old, {child.gender}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveChild(index)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Expecting Child Section */}
        {expecting && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🤰🏿</span>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Expecting a Child</h4>
              </div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expected Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>
        )}

        {/* No Children - Skip to next step */}
        {!hasChildren && !expecting && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                No children selected. You can proceed to the next step.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-6">
        <button
          onClick={handleNext}
          disabled={
            (hasChildren && children.length === 0 && !expecting) ||
            (expecting && !dueDate)
          }
          className="w-full px-8 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          <span>📦</span>
          Continue
        </button>
      </div>

      {/* Child Modal */}
      <ChildModal
        isOpen={showChildModal}
        onClose={() => setShowChildModal(false)}
        onSave={handleSaveChild}
      />

      {/* Expecting Modal */}
      <ExpectingModal
        isOpen={showExpectingModal}
        onClose={() => setShowExpectingModal(false)}
        onSave={(data) => {
          setDueDate(data.expected_date);
          setExpecting(true);
          setHasChildren(false);
          setShowExpectingModal(false);
          onUpdate({
            children: {
              hasChildren: false,
              expecting: true,
              children: [],
              dueDate: data.expected_date
            }
          });
        }}
      />
    </div>
  );
} 