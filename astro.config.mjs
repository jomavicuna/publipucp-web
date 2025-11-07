// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/static';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://publipucp.pe',
  output: 'static',
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
  integrations: [tailwind()],
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.airtableusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com'
      }
    ],
    // Use passthrough service to avoid processing remote images during build
    // Vercel will handle optimization at runtime
    service: { entrypoint: 'astro/assets/services/noop' }
  }
});
