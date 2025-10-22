import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Loader as Loader2, Plus, Trash2, CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateTasks, AITask } from '@/lib/openai';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const AIPlanner: React.FC = () => {
  const [project, setProject] = useState('');
  const [timeline, setTimeline] = useState('');
  const [complexity, setComplexity] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState<AITask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerateTasks = async () => {
    if (!project.trim()) {
      toast({
        title: 'Missing project description',
        description: 'Please describe your project or goal',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const tasks = await generateTasks(project, timeline, complexity);
      setGeneratedTasks(tasks);
      setSelectedTasks(new Set(tasks.map((_, index) => index)));
      
      toast({
        title: 'Tasks generated successfully!',
        description: `Generated ${tasks.length} actionable tasks`,
      });
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast({
        title: 'Generation failed',
        description: 'Failed to generate tasks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const handleRemoveTask = (index: number) => {
    const newTasks = generatedTasks.filter((_, i) => i !== index);
    const newSelected = new Set<number>();
    
    // Reindex selected tasks
    selectedTasks.forEach(selectedIndex => {
      if (selectedIndex < index) {
        newSelected.add(selectedIndex);
      } else if (selectedIndex > index) {
        newSelected.add(selectedIndex - 1);
      }
    });
    
    setGeneratedTasks(newTasks);
    setSelectedTasks(newSelected);
  };

  const handleAddTasks = async () => {
    if (!user || selectedTasks.size === 0) return;

    setAdding(true);
    try {
      const tasksToAdd = Array.from(selectedTasks).map(index => ({
        title: generatedTasks[index].title,
        description: generatedTasks[index].description,
        priority: generatedTasks[index].priority,
        status: 'active' as const,
        user_id: user.id,
        ai_generated: true,
      }));

      const { error } = await supabase
        .from('tasks')
        .insert(tasksToAdd)
        .select();

      if (error) throw error;

      toast({
        title: 'Tasks added successfully!',
        description: `Added ${selectedTasks.size} tasks to your list`,
      });

      // Clear the form and generated tasks
      setProject('');
      setTimeline('');
      setComplexity('');
      setGeneratedTasks([]);
      setSelectedTasks(new Set());

      // Navigate to tasks page
      navigate('/tasks');
    } catch (error) {
      console.error('Error adding tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to add tasks to your list',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex justify-center">
      <div className="w-full max-w-5xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Brain className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">AI Task Planner</h1>
        </div>
        <p className="text-gray-600">
          Describe your project and let AI break it down into actionable tasks
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Project Description</CardTitle>
          <CardDescription>
            Tell us about your project, goal, or objective. The more specific you are, the better tasks we can generate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="project">Describe your project or goal</Label>
            <Textarea
              id="project"
              placeholder="Example: Create a personal fitness app with workout tracking, meal planning, and progress analytics. The app should be user-friendly and work on both iOS and Android platforms..."
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="min-h-[120px] resize-none"
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline (Optional)</Label>
              <Select value={timeline} onValueChange={setTimeline}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-week">1 Week</SelectItem>
                  <SelectItem value="2-weeks">2 Weeks</SelectItem>
                  <SelectItem value="1-month">1 Month</SelectItem>
                  <SelectItem value="2-months">2 Months</SelectItem>
                  <SelectItem value="3-months">3 Months</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complexity">Complexity (Optional)</Label>
              <Select value={complexity} onValueChange={setComplexity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="complex">Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerateTasks}
            disabled={loading || !project.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Tasks...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-5 w-5" />
                Generate Tasks with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Tasks */}
      {generatedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Tasks ({generatedTasks.length})</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {selectedTasks.size} selected
                </span>
                <Button
                  onClick={handleAddTasks}
                  disabled={selectedTasks.size === 0 || adding}
                  size="sm"
                >
                  {adding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Selected Tasks
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Review and select the tasks you want to add to your task list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedTasks.map((task, index) => (
                <Card 
                  key={index}
                  className={`transition-all duration-200 ${
                    selectedTasks.has(index) 
                      ? 'border-blue-200 bg-blue-50/50' 
                      : 'border-gray-200'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedTasks.has(index)}
                        onChange={() => handleToggleTask(index)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {task.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {task.description}
                            </p>
                            
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={getPriorityColor(task.priority)}
                              >
                                <span className="flex items-center space-x-1">
                                  {getPriorityIcon(task.priority)}
                                  <span>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                                </span>
                              </Badge>
                              
                              <Badge variant="secondary" className="text-xs">
                                ~{task.estimated_hours}h
                              </Badge>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTask(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
};

export default AIPlanner;