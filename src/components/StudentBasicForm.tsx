'use client';

import { useState } from 'react';
import { studentBasicForm, BasicForm } from '@/actions/student-form';

export default function StudentBasicForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setFormMessage(null);
    
    try {
      // Convert FormData to the expected BasicForm type
      const basicFormData: BasicForm = {
        date_of_birth: formData.get('date_of_birth') as string,
        country: formData.get('country') as string,
        phone_number: formData.get('phone_number') as string,
        address: formData.get('address') as string,
        postal_code: formData.get('postal_code') as string,
      };
      
      const result = await studentBasicForm(basicFormData);
      
      if (result.status === 'success') {
        setFormMessage({
          type: 'success',
          message: 'Student information saved successfully!'
        });
        // Reset the form
        (document.getElementById('student-form') as HTMLFormElement).reset();
      } else {
        setFormMessage({
          type: 'error',
          message: result.message || 'Failed to save student information'
        });
      }
    } catch {
      setFormMessage({
        type: 'error',
        message: 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Student Information</h2>
      
      {formMessage && (
        <div className={`p-4 mb-4 rounded-md ${
          formMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {formMessage.message}
        </div>
      )}
      
      <form id="student-form" action={handleSubmit} className="space-y-4">
        {/* Remove the firstname field as it's not needed - it comes from the user session */}
        
        <div>
          <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            id="date_of_birth"
            name="date_of_birth"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            required
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="number"
            id="phone_number"
            name="phone_number"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          {isSubmitting ? 'Saving...' : 'Save Student Information'}
        </button>
      </form>
    </div>
  );
}