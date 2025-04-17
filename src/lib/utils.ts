import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetchFromMCPServer = async (endpoint: string, method: 'GET' | 'POST' = 'GET', data?: Record<string, unknown> | null) => {
  const url = `${process.env.MCP_SERVER_URL}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios({
      url,
      method,
      headers,
      data,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching from MCP server:', error);
    throw error;
  }
};
