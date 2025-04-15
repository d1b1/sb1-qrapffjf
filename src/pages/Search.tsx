import React, { useState, useRef } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient, User } from '@supabase/supabase-js';
import Header from '../components/Header';
import SearchTable from '../components/SearchTable';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface SearchProps {
  user: User | null;
}

function Search({ user }: SearchProps) {
  const [selectedCount, setSelectedCount] = useState(0);
  const navigate = useNavigate();
  const searchTableRef = useRef<{ clearSelected: () => void }>();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleClearSelected = () => {
    if (searchTableRef.current) {
      searchTableRef.current.clearSelected();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Koo Capital" 
        selectedCount={selectedCount}
        onContactClick={() => navigate('/contact')}
        onClearSelected={handleClearSelected}
        user={user}
      >
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </Header>
      <main className="container mx-auto px-4 py-8">
        <SearchTable 
          ref={searchTableRef}
          onSelectionChange={setSelectedCount} 
        />
      </main>
    </div>
  );
}

export default Search;