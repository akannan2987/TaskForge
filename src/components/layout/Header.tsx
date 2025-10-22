import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 max-w-screen-2xl mx-auto">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">TaskForg</h1>
            <span className="text-sm text-gray-500 hidden sm:inline">
              AI-Powered Task Management
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;