import React from 'react';
import { Mail, Trash2 } from 'lucide-react';

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
  selectedCount?: number;
  onContactClick?: () => void;
  onClearSelected?: () => void;
}

function Header({ title, children, selectedCount = 0, onContactClick, onClearSelected }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center space-x-4">
            {selectedCount > 0 && (
              <>
                <button
                  onClick={onContactClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact {selectedCount} Lender{selectedCount !== 1 ? 's' : ''}
                </button>
                <button
                  onClick={onClearSelected}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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