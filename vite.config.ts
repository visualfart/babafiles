import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { cdnAdapter } from "@vinext/cloudflare/cache/cdn-adapter";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: [
      // On Workers the database is the D1 binding, not the local libsql file.
      { find: /^@\/db\/client$/, replacement: path.resolve(__dirname, "src/db/client.d1.ts") },
    ],
  },
  plugins: [
    vinext({
      cache: { cdn: cdnAdapter() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
