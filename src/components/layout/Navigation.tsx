import React from 'react';
import { NavLink } from 'react-router-dom';
import { SquareCheck as CheckSquare, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation: React.FC = () => {
  return (
    <nav className="bg-white border-b">
      <div className="w-full">
        <div className="flex justify-center space-x-8">
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm',
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )
            }
          >
            <CheckSquare className="h-4 w-4" />
            <span>My Tasks</span>
          </NavLink>
          
          <NavLink
            to="/ai-planner"
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm',
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )
            }
          >
            <Brain className="h-4 w-4" />
            <span>AI Planner</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;