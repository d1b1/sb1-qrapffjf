import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

function Contact() {
  const navigate = useNavigate();
  const selectedLenders = useSelector((state: RootState) => state.lenders.selectedLenders);
  const [name, setName] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the email sending logic
    console.log('Sending email with:', { name, company, email, selectedLenders });
    alert('Email request submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </button>

        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Selected Lenders</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send Email to Selected Lenders
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Selected Lenders</h3>
            </div>
            <div className="overflow-x-auto">
              {Object.values(selectedLenders).map((lender) => (
                <div key={lender.objectID} className="p-6 border-b border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">{lender.lenderName}</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Contact Information</p>
                          <p className="mt-1 text-sm text-gray-900">{lender.contactName}</p>
                          <a href={`mailto:${lender.contactEmail}`} className="text-sm text-indigo-600 hover:text-indigo-900">
                            {lender.contactEmail}
                          </a>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check Size</p>
                          <p className="mt-1 text-sm text-gray-900">
                            Min: ${lender.minimumCheckSize.toLocaleString()} / Max: ${lender.maximumCheckSize.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Industry</p>
                          <p className="mt-1 text-sm text-gray-900">{lender.industry?.join(', ') || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Vertical</p>
                          <p className="mt-1 text-sm text-gray-900">{lender.vertical?.join(', ') || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Funding Use</p>
                          <p className="mt-1 text-sm text-gray-900">{lender.fundingUse?.join(', ') || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Stage</p>
                        <p className="mt-1 text-sm text-gray-900">{lender.stage?.join(', ') || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Collateral Types</p>
                        <p className="mt-1 text-sm text-gray-900">{lender.collateralTypes?.join(', ') || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Requirements</p>
                        <div className="mt-2 space-y-2">
                          <p className="text-sm text-gray-900">Personal Guaranty: {lender.personalGuarantyRule || 'N/A'}</p>
                          <p className="text-sm text-gray-900">Collateral To Pledge: {lender.collateralToPledgeYesNo || 'N/A'}</p>
                          <p className="text-sm text-gray-900">Covenants: {lender.covenantsYesNo || 'N/A'}</p>
                          <p className="text-sm text-gray-900">EBITDA Positive: {lender.ebitdaPositiveRule || 'N/A'}</p>
                          <p className="text-sm text-gray-900">Path To Revenue: {lender.pathToRevenueRule || 'N/A'}</p>
                          <p className="text-sm text-gray-900">Path To Revenue Logic: {lender.pathToRevenueLogic || 'N/A'}</p>
                          <p className="text-sm text-gray-900">Min Cash Runway: {lender.minCashRunwayRule || 'N/A'}</p>
                          <p className="text-sm text-gray-900">Recurring Revenue: {lender.recurringRevenueRule || 'N/A'}</p>
                          {lender.minPriorYearRevenueRule === 'True' && (
                            <p className="text-sm text-gray-900">
                              Min Prior Year Revenue: ${lender.minPriorYearRevenueAmt?.toLocaleString() || 'N/A'}
                            </p>
                          )}
                          {lender.minProjectedRevenueRule === 'True' && (
                            <p className="text-sm text-gray-900">
                              Min Projected Revenue: ${lender.minProjectedRevenueAmt?.toLocaleString() || 'N/A'}
                            </p>
                          )}
                          <p className="text-sm text-gray-900">Loan Runway Months: {lender.loanRunwayMonthsRule || 'N/A'}</p>
                          <p className="text-sm text-gray-900">Min Months In Business: {lender.minMonthsInBusinessRule || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;