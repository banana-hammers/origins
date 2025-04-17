import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const githubMCPUrl = process.env.MCP_SERVER_URL!;
const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN!;

export const githubMCPClient = axios.create({
  baseURL: githubMCPUrl,
  headers: {
    Authorization: `Bearer ${githubToken}`,
    'Content-Type': 'application/json',
  },
});

const githubMCPClientConfig = {
  command: 'docker',
  args: [
    'run',
    '-i',
    '--rm',
    '-e',
    'GITHUB_PERSONAL_ACCESS_TOKEN',
    'ghcr.io/github/github-mcp-server'
  ],
  env: {
    GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  }
};

const GITHUB_MCP_URL = process.env.GITHUB_MCP_URL || "http://localhost:3001";

export async function fetchGitHubMCP(path: string, options?: RequestInit) {
  const res = await fetch(`${GITHUB_MCP_URL}${path}`, options);
  if (!res.ok) throw new Error(`GitHub MCP error: ${res.statusText}`);
  return res.json();
}

export default githubMCPClientConfig;