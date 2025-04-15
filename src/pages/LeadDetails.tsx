import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { Lead } from './Leads';
import EditLeadModal from '../components/EditLeadModal';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Group lender data fields by category
const fieldCategories = {
  'Basic Information': ['lenderName', 'contactName', 'contactEmail', 'minimumCheckSize', 'maximumCheckSize'],
  'Business Categories': ['industry', 'vertical', 'fundingUse', 'stage', 'collateralTypes'],
  'Requirements': [
    'personalGuarantyRule',
    'collateralToPledgeYesNo',
    'covenantsYesNo',
    'ebitdaPositiveRule',
    'pathToRevenueRule',
    'pathToRevenueLogic',
    'minCashRunwayRule',
    'recurringRevenueRule'
  ],
  'Revenue & Business Metrics': [
    'minPriorYearRevenueRule',
    'minPriorYearRevenueAmt',
    'minProjectedRevenueRule',
    'minProjectedRevenueAmt',
    'loanRunwayMonthsRule',
    'minMonthsInBusinessRule'
  ]
};

function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchLead = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setLead(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lead');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const updateLeadStatus = async (newStatus: Lead['status']) => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', lead.id);

      if (error) throw error;
      setLead(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead status');
    }
  };

  const updateLeadNotes = async (notes: string) => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ notes })
        .eq('id', lead.id);

      if (error) throw error;
      setLead(prev => prev ? { ...prev, notes } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notes');
    }
  };

  const formatValue = (key: string, value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ') || 'N/A';
    } else if (typeof value === 'number') {
      return key.toLowerCase().includes('amount') || key.toLowerCase().includes('size')
        ? `$${value.toLocaleString()}`
        : value.toString();
    } else if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return value.toString();
  };

  const formatKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/([A-Z])\s(?=[A-Z][a-z])/g, '$1')
      .replace(/Amt$/, 'Amount')
      .replace(/Rule$/, '')
      .replace(/YesNo$/, '')
      .trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Lead not found'}
          </div>
          <button
            onClick={() => navigate('/leads')}
            className="mt-4 inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/leads')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leads
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Lead
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {lead.lender_data.lenderName}
              </h1>
              <select
                value={lead.status}
                onChange={(e) => updateLeadStatus(e.target.value as Lead['status'])}
                className="ml-4 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Name</p>
                    <p className="mt-1">{lead.lender_data.contactName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <a 
                      href={`mailto:${lead.lender_data.contactEmail}`}
                      className="mt-1 block text-black hover:text-gray-900"
                    >
                      {lead.lender_data.contactEmail}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Check Size Range</p>
                    <p className="mt-1">
                      ${lead.lender_data.minimumCheckSize?.toLocaleString()} - 
                      ${lead.lender_data.maximumCheckSize?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="mt-1">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1 capitalize">{lead.status}</p>
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-500">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      value={lead.notes || ''}
                      onChange={(e) => updateLeadNotes(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      placeholder="Add notes about this lead..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Detailed Lender Information</h2>
              {Object.entries(fieldCategories).map(([category, fields]) => (
                <div key={category} className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-base font-medium text-gray-900">{category}</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fields.map(field => {
                          if (field === 'objectID') return null;
                          const value = lead.lender_data[field as keyof typeof lead.lender_data];
                          return (
                            <tr key={field}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">
                                {formatKey(field)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {formatValue(field, value)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onLeadUpdated={fetchLead}
        lead={lead}
      />
    </div>
  );
}

export default LeadDetails;