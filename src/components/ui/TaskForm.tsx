'use client';

import { useForm } from 'react-hook-form';
import { Task, CreateTaskInput } from '@/lib/types';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from './form';
import { Input } from './input';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
}

export function TaskForm({ task, isOpen, onClose, onSubmit }: TaskFormProps) {
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<CreateTaskInput>({
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'medium',
      status: task?.status ?? 'pending',
      due_date: task?.due_date ? new Date(task.due_date) : undefined,
    }
  });

  const handleSubmit = async (data: CreateTaskInput) => {
    try {
      setError(null);
      if (!data.status) {
        data.status = 'pending';
      }
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (err) {
      console.error('Error submitting task:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save task. Please try again.';
      setError(errorMessage);
      if (errorMessage.includes('authenticated')) {
        // If authentication error, wait a moment then reload the page
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/70">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {task ? 'Edit your task details below.' : 'Fill out the form below to create a new task.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            {error && (
              <div className="text-sm font-medium text-destructive-foreground bg-destructive/15 p-3 rounded-md border border-destructive/30">
                {error}
              </div>
            )}
            <FormField
              control={form.control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Task title" className="border-input/70 focus-visible:ring-primary/30" />
                  </FormControl>
                  <FormDescription className="text-muted-foreground">Give your task a clear and concise title</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Task description" className="border-input/70 focus-visible:ring-primary/30" />
                  </FormControl>
                  <FormDescription className="text-muted-foreground">Add any additional details about your task</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              rules={{ required: 'Priority is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Priority</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className={cn(
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary/20 selection:text-primary",
                        "border-input/70 bg-card text-foreground flex h-10 w-full rounded-md border px-3 py-2",
                        "text-base shadow-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-primary/30 focus-visible:ring-[3px]"
                      )}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Status</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className={cn(
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary/20 selection:text-primary",
                        "border-input/70 bg-card text-foreground flex h-10 w-full rounded-md border px-3 py-2",
                        "text-base shadow-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-primary/30 focus-visible:ring-[3px]"
                      )}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Due Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="border-input/70 focus-visible:ring-primary/30"
                      value={value ? new Date(value).toISOString().split('T')[0] : ''}
                      onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground">When should this task be completed?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="border-input/70 hover:bg-accent/50 hover:text-accent-foreground"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {task ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}