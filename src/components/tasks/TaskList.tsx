import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase, Database } from '@/lib/supabase';
import TaskItem from './TaskItem';
import TaskModal from './TaskModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

type FilterType = 'all' | 'active' | 'completed';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  useEffect(() => {
    applyFilter();
  }, [tasks, filter]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    switch (filter) {
      case 'active':
        setFilteredTasks(tasks.filter(task => task.status === 'active'));
        break;
      case 'completed':
        setFilteredTasks(tasks.filter(task => task.status === 'completed'));
        break;
      default:
        setFilteredTasks(tasks);
    }
  };

  const handleCreateTask = async (taskData: TaskInsert) => {
    if (!user) return;

    setModalLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateTask = async (taskData: TaskInsert) => {
    if (!user || !editingTask) return;

    setModalLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', editingTask.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(task => task.id === editingTask.id ? data : task));
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    } finally {
      setModalLoading(false);
      setEditingTask(null);
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: completed ? 'completed' : 'active' })
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(task => task.id === taskId ? data : task));
      
      toast({
        title: completed ? 'Task completed!' : 'Task reactivated',
        description: completed ? 'Great job!' : 'Task marked as active',
      });
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!user || !taskToDelete) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskToDelete)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== taskToDelete));
      toast({
        title: 'Task deleted',
        description: 'Task has been permanently deleted',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const confirmDelete = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const getFilterButtonClass = (filterType: FilterType) => {
    return filter === filterType 
      ? 'bg-blue-100 text-blue-700 border-blue-300' 
      : 'text-gray-500 hover:text-gray-700';
  };

  const getEmptyMessage = () => {
    switch (filter) {
      case 'active':
        return tasks.length === 0 
          ? "No tasks yet. Create your first task to get started!" 
          : "All tasks completed! Great work! 🎉";
      case 'completed':
        return "No completed tasks yet. Complete some tasks to see them here.";
      default:
        return "No tasks yet. Create your first task to get started!";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl px-8 py-6">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Tasks</h1>

        {/* Filter buttons */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter('all')}
            className={getFilterButtonClass('all')}
          >
            All ({tasks.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter('active')}
            className={getFilterButtonClass('active')}
          >
            Active ({tasks.filter(t => t.status === 'active').length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter('completed')}
            className={getFilterButtonClass('completed')}
          >
            Completed ({tasks.filter(t => t.status === 'completed').length})
          </Button>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {getEmptyMessage()}
            </h3>
            <p className="text-gray-500 mb-4">
              Organize your work and boost productivity with TaskForg
            </p>
            {filter === 'all' || filter === 'active' ? (
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Task
              </Button>
            ) : null}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={openEditModal}
              onDelete={confirmDelete}
            />
          ))
        )}
      </div>

      {/* Floating action button */}
      {filteredTasks.length > 0 && (
        <Button
          onClick={openCreateModal}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
          size="sm"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Task modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        loading={modalLoading}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskList;