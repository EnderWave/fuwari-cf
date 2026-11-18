import { access, cp } from "node:fs/promises";

// Astro's Vercel adapter copies dist before Pagefind runs. Publish the index
// to that output too; dist remains the source for previews and other hosts.
await access("dist/pagefind/pagefind.js");
let hasVercelOutput = true;
try {
	await access(".vercel/output/static");
} catch (error) {
	if (error.code !== "ENOENT") throw error;
	hasVercelOutput = false;
}
if (hasVercelOutput) {
	await cp("dist/pagefind", ".vercel/output/static/pagefind", {
		recursive: true,
	});
	console.log("Pagefind index copied to Vercel static output.");
}
