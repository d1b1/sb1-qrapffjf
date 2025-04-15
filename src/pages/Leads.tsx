import React from 'react';
import { ArrowLeft, Plus, Pencil, ExternalLink, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createClient } from '@supabase/supabase-js';
import type { Lender } from '../store/lenderSlice';
import { setActiveLead } from '../store/lenderSlice';
import type { RootState } from '../store/store';
import NewLeadModal from '../components/NewLeadModal';
import EditLeadModal from '../components/EditLeadModal';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface Lead {
  id: string;
  lender_data: Lender;
  created_at: string;
  status: 'new' | 'contacted' | 'in_progress' | 'closed';
  notes: string | null;
}

function Leads() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeLead = useSelector((state: RootState) => state.lenders.activeLead);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLeads();
  }, []);

  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead status');
    }
  };

  const updateLeadNotes = async (leadId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ notes })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, notes } : lead
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notes');
    }
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleMakeActive = (lead: Lead) => {
    dispatch(setActiveLead({
      id: lead.id,
      notes: lead.notes
    }));
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </button>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 mr-4">Saved Leads</h1>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Lead
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {lead.lender_data.lenderName}
                    </h2>
                    <button
                      onClick={() => handleEditClick(lead)}
                      className="ml-3 text-gray-400 hover:text-gray-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleMakeActive(lead)}
                      className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        activeLead?.id === lead.id
                          ? 'border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 focus:ring-yellow-500'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
                      }`}
                    >
                      <Star className={`h-4 w-4 mr-2 ${activeLead?.id === lead.id ? 'fill-yellow-400' : ''}`} />
                      {activeLead?.id === lead.id ? 'Active' : 'Make Active'}
                    </button>
                    <button
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                      className="rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact Information</p>
                        <p className="mt-1 text-sm text-gray-900">{lead.lender_data.contactName}</p>
                        <a 
                          href={`mailto:${lead.lender_data.contactEmail}`}
                          className="text-sm text-black hover:text-gray-900"
                        >
                          {lead.lender_data.contactEmail}
                        </a>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Check Size</p>
                        <p className="mt-1 text-sm text-gray-900">
                          Min: ${lead.lender_data.minimumCheckSize?.toLocaleString()} / 
                          Max: ${lead.lender_data.maximumCheckSize?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Notes</p>
                        <textarea
                          value={lead.notes || ''}
                          onChange={(e) => updateLeadNotes(lead.id, e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                          rows={3}
                          placeholder="Add notes about this lead..."
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Industry</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {lead.lender_data.industry?.join(', ') || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Stage</p>
                        <p className="mt-1 text-sm text-gray-900">
                          {lead.lender_data.stage?.join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {leads.length === 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No saved leads yet. Start by selecting lenders from the search page.</p>
            </div>
          )}
        </div>
      </div>

      <NewLeadModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onLeadCreated={fetchLeads}
      />

      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLead(null);
        }}
        onLeadUpdated={fetchLeads}
        lead={selectedLead}
      />
    </div>
  );
}

export default Leads;