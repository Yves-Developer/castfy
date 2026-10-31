import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative base: the packaged app loads the build from disk over file://,
  // where absolute asset paths resolve against the drive root and 404.
  base: './',
  root: __dirname,
  /**
   * The app owns its assets. They currently duplicate the dashboard's, but the
   * dashboard is being retired — pointing at its folder would break when it
   * goes, and this is the copy that survives.
   */
  publicDir: path.resolve(__dirname, 'public'),
  build: {
    outDir: 'dist-renderer',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    /**
     * One copy of each. @castfy/ui was installed against another React patch
     * version, so pnpm gave it its own sonner and React: toast() then spoke to
     * the app's sonner while the Toaster listened to the UI package's, and no
     * toast ever showed.
     */
    dedupe: ['react', 'react-dom', 'sonner'],
  },
});
