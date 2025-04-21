'use client';

import { useEffect, useState } from 'react';
import { Task, CreateTaskInput } from '@/lib/types';
import { taskService } from '@/lib/taskService';
import { TaskCard } from '@/components/ui/TaskCard';
import { TaskForm } from '@/components/ui/TaskForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const { user } = useAuth();

  // Protect the route
  if (!user) {
    redirect('/auth');
  }

  const loadTasks = async () => {
    try {
      const tasks = await taskService.getTasks();
      setTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (data: CreateTaskInput) => {
    await taskService.createTask(data);
    loadTasks();
  };

  const handleUpdateTask = async (data: CreateTaskInput) => {
    if (!selectedTask) return;
    await taskService.updateTask(selectedTask.id, data);
    setSelectedTask(undefined);
    loadTasks();
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTask(undefined);
  };

  const filterTasks = (status: 'pending' | 'completed') => {
    return tasks.filter(task => task.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  const pendingTasks = filterTasks('pending');
  const completedTasks = filterTasks('completed');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto max-w-7xl p-8">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">My Tasks</h1>
            <p className="mt-2 text-muted-foreground">Manage and track your tasks</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} size="lg" className="gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Task
          </Button>
        </div>

        <div className="space-y-12">
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Pending Tasks</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tasks that need your attention</p>
            </div>
            
            {pendingTasks.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <p className="text-muted-foreground">No pending tasks. Time to add some!</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pendingTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onTaskUpdate={loadTasks}
                    onEdit={handleEditTask}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Completed Tasks</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tasks you&apos;ve accomplished</p>
            </div>
            
            {completedTasks.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <p className="text-muted-foreground">No completed tasks yet. Keep going!</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {completedTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onTaskUpdate={loadTasks}
                    onEdit={handleEditTask}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <TaskForm
          task={selectedTask}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        />
      </div>
    </div>
  );
}