import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// Production-ready configuration
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
      // Mock the GitHub Spark hooks for production
      '@github/spark/hooks': resolve(projectRoot, 'src/lib/spark-mocks.ts')
    }
  },
  define: {
    // Provide global spark object for production
    'window.spark': JSON.stringify({
      llmPrompt: '() => ""',
      llm: '() => Promise.resolve("")',
      user: '() => Promise.resolve({})',
      kv: {
        keys: '() => Promise.resolve([])',
        get: '() => Promise.resolve(undefined)',
        set: '() => Promise.resolve()',
        delete: '() => Promise.resolve()'
      }
    })
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
});
