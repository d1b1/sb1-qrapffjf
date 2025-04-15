import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: () => void;
}

function NewLeadModal({ isOpen, onClose, onLeadCreated }: NewLeadModalProps) {
  const [lenderName, setLenderName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [minimumCheckSize, setMinimumCheckSize] = useState('');
  const [maximumCheckSize, setMaximumCheckSize] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const lenderData = {
        lenderName,
        contactName,
        contactEmail,
        minimumCheckSize: parseInt(minimumCheckSize),
        maximumCheckSize: parseInt(maximumCheckSize),
        objectID: crypto.randomUUID()
      };

      const { error } = await supabase.from('leads').insert({
        user_id: user.id,
        lender_data: lenderData,
        status: 'new',
        notes
      });

      if (error) throw error;

      onLeadCreated();
      onClose();
      setLenderName('');
      setContactName('');
      setContactEmail('');
      setMinimumCheckSize('');
      setMaximumCheckSize('');
      setNotes('');
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('Failed to create lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Create New Lead
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="lenderName" className="block text-base font-medium text-gray-700 mb-2">
              Lender Name
            </label>
            <input
              type="text"
              id="lenderName"
              value={lenderName}
              onChange={(e) => setLenderName(e.target.value)}
              className="block w-full px-4 py-3 text-base rounded-lg border border-gray-700 shadow-sm focus:border-black focus:ring-black"
              placeholder="Enter the name of the lending institution"
              required
            />
          </div>

          <div>
            <label htmlFor="contactName" className="block text-base font-medium text-gray-700 mb-2">
              Contact Name
            </label>
            <input
              type="text"
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="block w-full px-4 py-3 text-base rounded-lg border border-gray-700 shadow-sm focus:border-black focus:ring-black"
              placeholder="Enter the primary contact person's name"
              required
            />
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-base font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="block w-full px-4 py-3 text-base rounded-lg border border-gray-700 shadow-sm focus:border-black focus:ring-black"
              placeholder="Enter the contact's email address"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="minimumCheckSize" className="block text-base font-medium text-gray-700 mb-2">
                Minimum Check Size
              </label>
              <input
                type="number"
                id="minimumCheckSize"
                value={minimumCheckSize}
                onChange={(e) => setMinimumCheckSize(e.target.value)}
                className="block w-full px-4 py-3 text-base rounded-lg border border-gray-700 shadow-sm focus:border-black focus:ring-black"
                placeholder="Enter minimum investment amount"
                required
              />
            </div>

            <div>
              <label htmlFor="maximumCheckSize" className="block text-base font-medium text-gray-700 mb-2">
                Maximum Check Size
              </label>
              <input
                type="number"
                id="maximumCheckSize"
                value={maximumCheckSize}
                onChange={(e) => setMaximumCheckSize(e.target.value)}
                className="block w-full px-4 py-3 text-base rounded-lg border border-gray-700 shadow-sm focus:border-black focus:ring-black"
                placeholder="Enter maximum investment amount"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-base font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="block w-full px-4 py-3 text-base rounded-lg border border-gray-700 shadow-sm focus:border-black focus:ring-black"
              placeholder="Add any additional notes or comments about this lead"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Lead'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewLeadModal;