import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";

dotenv.config();
installGlobals();

export default defineConfig({
  server: {
    port: process.env.PORT ? +process.env.PORT : 3000,
  },
  plugins: [remix(), tsconfigPaths()],
});
