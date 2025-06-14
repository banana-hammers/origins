import axios from 'axios';

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

export default githubMCPClientConfig;