import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { dirname, resolve } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'url'

function removeDataTestid (node) {
  if (node.type === 1 /* NodeTypes.ELEMENT */) {
    node.props = node.props.filter(prop => prop.type === 6 ? prop.name !== 'data-testid' : true)
  }
}

const prod = process.env.NODE_ENV === 'production'
const predefinedClustersFile = process.env.VITE_APP_PREDEFINED_CLUSTERS_FILE || 'default_clusters.json'
const predefinedClustersPath = resolve(dirname(fileURLToPath(import.meta.url)), predefinedClustersFile)
const predefinedClusters = existsSync(predefinedClustersPath)
  ? JSON.parse(readFileSync(predefinedClustersPath, 'utf8'))
  : []

export default defineConfig({
  base: process.env.VITE_APP_PUBLIC_PATH || '/',
  server: {
    watch: {
      ignored: ['**/src-tauri/target/**']
    }
  },
  plugins: [
    vue({
      template: {
        transformAssetUrls,
        compilerOptions: {
          nodeTransforms: prod ? [removeDataTestid] : [],
        }
      }
    }),
    quasar(),
    VueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
      strictMessage: false
    })
  ],
  build: {
    sourcemap: true
  },
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
    '__PREDEFINED_CLUSTERS__': JSON.stringify(predefinedClusters)
  }
})
