import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react({
        jsxImportSource: '@emotion/react',
        babel: {
            plugins: ['@emotion/babel-plugin'],
        },
    }),],
    build: {
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                manualChunks: undefined,
                assetFileNames: 'assets/[name][extname]',
            },
        },
    },
    resolve: {
        alias: {
            react: path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        },
        dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
    },
    optimizeDeps: {
        include: ['@mui/material/Tooltip', '@mui/material/Unstable_Grid2', '@emotion/react', '@emotion/styled'],
    },
})
