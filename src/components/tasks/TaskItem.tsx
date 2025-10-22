import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, CreditCard as Edit3, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggleComplete, 
  onEdit, 
  onDelete 
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const isCompleted = task.status === 'completed';

  const handleToggleComplete = async (checked: boolean) => {
    setIsCompleting(true);
    await onToggleComplete(task.id, checked);
    setIsCompleting(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <Card className={cn(
      'p-4 transition-all duration-200 hover:shadow-md',
      isCompleted && 'bg-gray-50'
    )}>
      <div className="flex items-start space-x-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleToggleComplete}
          disabled={isCompleting}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={cn(
                'font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors',
                isCompleted && 'line-through text-gray-500'
              )}
              onClick={() => onEdit(task)}
              >
                {task.title}
              </h3>
              
              {task.description && (
                <p className={cn(
                  'mt-1 text-sm text-gray-600',
                  isCompleted && 'line-through'
                )}>
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center space-x-2 mt-2">
                <Badge 
                  variant="outline" 
                  className={getPriorityColor(task.priority)}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
                
                {task.due_date && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDueDate(task.due_date)}
                  </div>
                )}
                
                {task.ai_generated && (
                  <Badge variant="secondary" className="text-xs">
                    AI Generated
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskItem;