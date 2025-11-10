import react from '@vitejs/plugin-react-swc'
import path from 'path'
import type { ConfigEnv } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from "@tailwindcss/vite"

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv) => {
  const currentEnv = loadEnv(mode, process.cwd())
  console.log('Current mode:', command)
  console.log('Current environment configuration:', currentEnv) //loadEnv is to load the .env in the root directory .env.[mode] environment configuration file
  return defineConfig({
    plugins: [react(), tailwindcss()],
    //The base path of the project deployment
    base: currentEnv.VITE_PUBLIC_PATH,
    mode,
    resolve: {
      //别名
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8090',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    //构建
    build: {
      sourcemap: mode != 'production',
    },
  })
}
