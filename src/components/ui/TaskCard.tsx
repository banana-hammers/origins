'use client';

import { Task } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { Button } from './button';
import { taskService } from '@/lib/taskService';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onTaskUpdate: () => void;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onTaskUpdate, onEdit }: TaskCardProps) {
  const handleStatusChange = async () => {
    try {
      await taskService.updateTask(task.id, {
        ...task,
        status: task.status === 'pending' ? 'completed' : 'pending'
      });
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md border-border/50",
      task.status === 'completed' && "opacity-80 bg-muted/30"
    )}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <CardTitle className={cn(
              "line-clamp-2",
              task.status === 'completed' && "line-through text-muted-foreground"
            )}>
              {task.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-muted-foreground">
              {task.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -mr-2 -mt-1 hover:bg-accent/50"
            onClick={() => onEdit(task)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              <path d="m15 5 4 4"/>
            </svg>
            <span className="sr-only">Edit task</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "size-3 rounded-full",
              task.priority === 'high' && "bg-destructive",
              task.priority === 'medium' && "bg-brand-400",
              task.priority === 'low' && "bg-success-500"
            )} />
            <span className="text-sm capitalize text-muted-foreground font-medium">
              {task.priority} Priority
            </span>
          </div>
          <Button
            variant={task.status === 'pending' ? "outline" : "ghost"}
            size="sm"
            className={cn(
              "w-full sm:w-auto justify-center",
              task.status === 'pending' 
                ? "border-primary/30 hover:border-primary/60 text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={handleStatusChange}
          >
            <div className="flex items-center gap-2">
              {task.status === 'pending' ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  <span className="text-sm font-medium">Mark Complete</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m2 2 20 20"/>
                    <path d="M12 12H2v10h20V12h-5"/>
                    <path d="M12 2v10"/>
                  </svg>
                  <span className="text-sm">Mark Incomplete</span>
                </>
              )}
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}