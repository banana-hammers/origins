// This file now includes the Estimate interface that was previously in a separate /lib folder.
// The interface was consolidated here as part of standardizing the codebase structure to use /src/lib.
export type Task = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export type CreateTaskInput = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateTaskInput = Partial<CreateTaskInput>;

// Estimate type for project_estimate_options
export interface Estimate {
  id: string;
  project_id?: string | null;
  name: string;
  description?: string | null;
  is_draft: boolean;
  total_material: number;
  total_labor: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
}