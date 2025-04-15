import React from 'react';
import { Mail, Trash2, FileText, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
  selectedCount?: number;
  onContactClick?: () => void;
  onClearSelected?: () => void;
  user?: SupabaseUser | null;
}

function Header({ title, children, selectedCount = 0, onContactClick, onClearSelected, user }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-full">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-700">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/leads')}
              className="inline-flex items-center px-4 py-2 border border-gray-400 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <FileText className="h-4 w-4 mr-2" />
              Leads
            </button>
            {selectedCount > 0 && (
              <>
                <button
                  onClick={onContactClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact {selectedCount} Lender{selectedCount !== 1 ? 's' : ''}
                </button>
                <button
                  onClick={onClearSelected}
                  className="inline-flex items-center px-4 py-2 border border-gray-400 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Selection
                </button>
              </>
            )}
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;