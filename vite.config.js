import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages project site base path.
  base: isGitHubActions ? '/pongtrap/' : '/',
});
