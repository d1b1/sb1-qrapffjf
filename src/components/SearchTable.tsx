import React, { forwardRef, useImperativeHandle } from 'react';
import { Search, ChevronDown, X, ChevronRight, Check, Star } from 'lucide-react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, useHits, Configure, useRefinementList, useClearRefinements, useSearchBox, useInstantSearch } from 'react-instantsearch';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLender, clearSelectedLenders, setActiveLead } from '../store/lenderSlice';
import type { RootState } from '../store/store';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const searchClient = algoliasearch(
  'W3VLJMSAS7',
  '4d86733ec803e3aecc7cd619a9c19ab9'
);

interface ResultsTableProps {
  onSelectionChange: (count: number) => void;
}

function ResultsTable({ onSelectionChange }: ResultsTableProps) {
  const { hits } = useHits<Lender>();
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set());
  const dispatch = useDispatch();
  const selectedLenders = useSelector((state: RootState) => state.lenders.selectedLenders);
  const activeLead = useSelector((state: RootState) => state.lenders.activeLead);
  const [activeLeadData, setActiveLeadData] = React.useState<any>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    const fetchActiveLead = async () => {
      if (activeLead) {
        const { data } = await supabase
          .from('leads')
          .select('*')
          .eq('id', activeLead.id)
          .single();
        
        if (data) {
          setActiveLeadData(data);
        }
      } else {
        setActiveLeadData(null);
      }
    };

    fetchActiveLead();
  }, [activeLead]);

  React.useEffect(() => {
    onSelectionChange(Object.keys(selectedLenders).length);

    // Update active lead when selections change
    const updateActiveLead = async () => {
      if (activeLead && !isUpdating) {
        setIsUpdating(true);
        try {
          const selectedLender = Object.values(selectedLenders)[0];
          
          // First get the current lead data
          const { data: currentLead } = await supabase
            .from('leads')
            .select('*')
            .eq('id', activeLead.id)
            .single();

          if (currentLead) {
            // Merge the new Algolia data with existing lead data
            const updatedLenderData = {
              ...currentLead.lender_data,
              ...(selectedLender || {}), // Only update with new data if there is a selection
            };

            const { error } = await supabase
              .from('leads')
              .update({
                lender_data: updatedLenderData
              })
              .eq('id', activeLead.id);

            if (error) throw error;

            // Refresh active lead data
            const { data } = await supabase
              .from('leads')
              .select('*')
              .eq('id', activeLead.id)
              .single();

            if (data) {
              setActiveLeadData(data);
            }
          }
        } catch (error) {
          console.error('Error updating active lead:', error);
        } finally {
          setIsUpdating(false);
        }
      }
    };

    updateActiveLead();
  }, [selectedLenders, activeLead, onSelectionChange]);

  const toggleRow = (index: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleToggleSelection = (hit: Lender) => {
    // Clear other selections if we have an active lead
    if (activeLead) {
      dispatch(clearSelectedLenders());
    }
    dispatch(toggleLender(hit));
  };

  const clearActiveLead = () => {
    dispatch(setActiveLead(null));
    dispatch(clearSelectedLenders());
  };

  return (
    <div>
      {Object.keys(selectedLenders).length > 0 && !activeLead && (
        <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100">
          <span className="text-sm font-medium text-indigo-700">
            {Object.keys(selectedLenders).length} lender{Object.keys(selectedLenders).length !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {activeLeadData && (
            <tr className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-y-2 border-yellow-300">
              <td colSpan={5} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-600 fill-yellow-500" />
                      <span className="font-medium text-yellow-800">Active Lead:</span>
                    </div>
                    <div className="flex items-center space-x-8">
                      <div>
                        <span className="font-medium text-yellow-900">{activeLeadData.lender_data.lenderName}</span>
                      </div>
                      <div>
                        <span className="text-yellow-800">
                          ${activeLeadData.lender_data.minimumCheckSize.toLocaleString()} - 
                          ${activeLeadData.lender_data.maximumCheckSize.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-yellow-800">{activeLeadData.lender_data.contactName}</span>
                        <a 
                          href={`mailto:${activeLeadData.lender_data.contactEmail}`}
                          className="ml-2 text-yellow-900 hover:text-yellow-700 underline"
                        >
                          {activeLeadData.lender_data.contactEmail}
                        </a>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={clearActiveLead}
                    className="text-yellow-700 hover:text-yellow-900 p-1 hover:bg-yellow-200 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          )}
          <tr>
            <th className="w-10 px-6 py-3"></th>
            <th className="w-10 px-6 py-3"></th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lender Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {hits.map((hit, index) => (
            <React.Fragment key={hit.objectID}>
              <tr className={expandedRows.has(index) ? 'bg-gray-50' : ''}>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleRow(index)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedRows.has(index) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleSelection(hit)}
                    className={`rounded-md p-1 ${
                      selectedLenders[hit.objectID]
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {hit.lenderName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <span>Min: ${hit.minimumCheckSize.toLocaleString()}</span>
                    <span>Max: ${hit.maximumCheckSize.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <span className="font-medium">{hit.contactName}</span>
                    <a 
                      href={`mailto:${hit.contactEmail}`} 
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {hit.contactEmail}
                    </a>
                  </div>
                </td>
              </tr>
              {expandedRows.has(index) && (
                <tr>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                  <td colSpan={3} className="px-6 py-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <table className="min-w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500 w-1/3">Personal Guaranty Rule</td>
                            <td className="py-2 text-sm text-gray-900">{hit.personalGuarantyRule || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">Collateral To Pledge</td>
                            <td className="py-2 text-sm text-gray-900">{hit.collateralToPledgeYesNo || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">Covenants</td>
                            <td className="py-2 text-sm text-gray-900">{hit.covenantsYesNo || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">EBITDA Positive Rule</td>
                            <td className="py-2 text-sm text-gray-900">{hit.ebitdaPositiveRule || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">Path To Revenue Rule</td>
                            <td className="py-2 text-sm text-gray-900">{hit.pathToRevenueRule || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">Path To Revenue Logic</td>
                            <td className="py-2 text-sm text-gray-900">{hit.pathToRevenueLogic || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">Min Cash Runway Rule</td>
                            <td className="py-2 text-sm text-gray-900">{hit.minCashRunwayRule || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">Recurring Revenue Rule</td>
                            <td className="py-2 text-sm text-gray-900">{hit.recurringRevenueRule || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">Min Prior Year Revenue Rule</td>
                            <td className="py-2 text-sm text-gray-900">
                              {hit.minPriorYearRevenueRule}
                              {hit.minPriorYearRevenueRule === 'True' && hit.minPriorYearRevenueAmt && (
                                <span className="ml-2 text-gray-500">
                                  (Min: ${hit.minPriorYearRevenueAmt.toLocaleString()})
                                </span>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">Min Projected Revenue Rule</td>
                            <td className="py-2 text-sm text-gray-900">
                              {hit.minProjectedRevenueRule}
                              {hit.minProjectedRevenueRule === 'True' && hit.minProjectedRevenueAmt && (
                                <span className="ml-2 text-gray-500">
                                  (Min: ${hit.minProjectedRevenueAmt.toLocaleString()})
                                </span>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">Loan Runway Months Rule</td>
                            <td className="py-2 text-sm text-gray-900">{hit.loanRunwayMonthsRule || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-sm font-medium text-gray-500">Min Months In Business Rule</td>
                            <td className="py-2 text-sm text-gray-900">{hit.minMonthsInBusinessRule || 'N/A'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClearRefinements() {
  const { clear } = useClearRefinements();
  const { clear: clearSearch, query } = useSearchBox();
  const { refresh } = useInstantSearch();
  const [hasRefinements, setHasRefinements] = React.useState(false);

  const industry = useRefinementList({ attribute: 'industry' });
  const vertical = useRefinementList({ attribute: 'vertical' });
  const fundingUse = useRefinementList({ attribute: 'fundingUse' });
  const stage = useRefinementList({ attribute: 'stage' });
  const collateralTypes = useRefinementList({ attribute: 'collateralTypes' });

  React.useEffect(() => {
    const hasActiveRefinements = [
      industry.items,
      vertical.items,
      fundingUse.items,
      stage.items,
      collateralTypes.items
    ].some(items => items.some(item => item.isRefined));

    setHasRefinements(hasActiveRefinements || !!query);
  }, [industry.items, vertical.items, fundingUse.items, stage.items, collateralTypes.items, query]);

  if (!hasRefinements) return null;

  const handleClear = () => {
    clear();
    clearSearch();
    refresh();
  };

  return (
    <button
      onClick={handleClear}
      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <X className="h-4 w-4 mr-1" />
      Clear all
    </button>
  );
}

function CustomSearchBox() {
  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <SearchBox
        classNames={{
          input: 'block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm',
          submit: 'hidden',
          reset: 'hidden'
        }}
        placeholder="Search lenders..."
      />
    </div>
  );
}

function ActiveRefinements() {
  const industry = useRefinementList({ attribute: 'industry' });
  const vertical = useRefinementList({ attribute: 'vertical' });
  const fundingUse = useRefinementList({ attribute: 'fundingUse' });
  const stage = useRefinementList({ attribute: 'stage' });
  const collateralTypes = useRefinementList({ attribute: 'collateralTypes' });

  const refinementLists = [
    { items: industry.items, refine: industry.refine, label: 'Industry' },
    { items: vertical.items, refine: vertical.refine, label: 'Vertical' },
    { items: fundingUse.items, refine: fundingUse.refine, label: 'Funding Use' },
    { items: stage.items, refine: stage.refine, label: 'Stage' },
    { items: collateralTypes.items, refine: collateralTypes.refine, label: 'Collateral Types' }
  ];

  const activeRefinements = refinementLists.flatMap(({ items, refine, label }) =>
    items
      .filter(item => item.isRefined)
      .map(item => ({
        label: `${label}: ${item.label}`,
        value: item.value,
        refine: () => refine(item.value)
      }))
  );

  if (activeRefinements.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {activeRefinements.map((refinement, index) => (
        <span
          key={index}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
        >
          {refinement.label}
          <button
            onClick={() => refinement.refine()}
            className="ml-2 inline-flex items-center p-0.5 hover:bg-indigo-200 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

function FacetDropdown({ attribute, label }: { attribute: string; label: string }) {
  const { items, refine } = useRefinementList({ attribute });
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedItems = items.filter(item => item.isRefined);

  const handleSelect = (value: string) => {
    refine(value);
    setIsOpen(false);
  };

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <div className="flex justify-between items-center">
          <span className="block truncate">
            {selectedItems.length > 0 
              ? `${label} (${selectedItems.length} selected)`
              : label}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {items.map((item) => (
            <div
              key={item.value}
              className={`${
                item.isRefined
                  ? 'bg-indigo-50 text-indigo-900'
                  : 'text-gray-900'
              } cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100`}
              onClick={() => handleSelect(item.value)}
            >
              <span className="block truncate">
                {item.label} ({item.count})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Facets() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
      <FacetDropdown attribute="industry" label="Industry" />
      <FacetDropdown attribute="vertical" label="Vertical" />
      <FacetDropdown attribute="fundingUse" label="Funding Use" />
      <FacetDropdown attribute="stage" label="Stage" />
      <FacetDropdown attribute="collateralTypes" label="Collateral Types" />
    </div>
  );
}

interface SearchTableProps {
  onSelectionChange: (count: number) => void;
  ref?: React.Ref<{ clearSelected: () => void }>;
}

const SearchTable = forwardRef<{ clearSelected: () => void }, SearchTableProps>(
  ({ onSelectionChange }, ref) => {
    const dispatch = useDispatch();

    useImperativeHandle(ref, () => ({
      clearSelected: () => {
        dispatch(clearSelectedLenders());
      }
    }));

    return (
      <div className="bg-white rounded-lg shadow">
        <InstantSearch 
          searchClient={searchClient} 
          indexName="lenders"
        >
          <Configure hitsPerPage={10} />
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <CustomSearchBox />
              <ClearRefinements />
            </div>
            <Facets />
            <ActiveRefinements />
          </div>
          <div className="overflow-x-auto">
            <ResultsTable onSelectionChange={onSelectionChange} />
          </div>
        </InstantSearch>
      </div>
    );
  }
);

export default SearchTable;