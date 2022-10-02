import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath, URL } from "url";
import { readFileSync } from "fs";

// https://stackoverflow.com/a/73849723/12203337
const hexLoader = {
    name: "hex-loader",
    transform(_: any, id: string) {
        const [path, query] = id.split("?");
        if (query != "raw-hex") {
			return null;
		}
        const data = readFileSync(path);
        const hex = data.toString("hex");
        return `export default "${hex}";`;
    }
};

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		hexLoader,
		svelte()
	],
	resolve: {
		extensions: [".ts", ".css"],
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url))
		}
	},
});
