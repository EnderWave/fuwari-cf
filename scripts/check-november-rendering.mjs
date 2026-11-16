import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import remarkMath from "remark-math";
import remarkDirective from "remark-directive";
import { parseDirectiveNode } from "../src/plugins/remark-directive-rehype.js";
import rehypeComponents from "rehype-components";
import { AdmonitionComponent } from "../src/plugins/rehype-component-admonition.mjs";
import rehypeKatex from "rehype-katex";
import { visit } from "unist-util-visit";
const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve("astro/package.json"));
const { createMarkdownProcessor } = await import(
	pathToFileURL(astroRequire.resolve("@astrojs/markdown-remark"))
);
let issues = [];
let name;
let tables = 0,
	formulas = 0,
	count = 0,
	codeBlocks = 0;
let parsedCode = [];
function audit() {
	return (tree) =>
		visit(tree, (node) => {
			if (node.type === "table") tables++;
			if (node.type === "code") {
				codeBlocks++;
				parsedCode.push(node.value);
				if (!node.value.trim()) issues.push(`${name}: empty code block`);
			}
			if (node.type === "math" || node.type === "inlineMath") formulas++;
			if (
				node.type === "text" &&
				/\$\$|:{3}(?:note|important|caution|tip|warning)?|:spoiler|^\s*\|.*\|\s*$/m.test(
					node.value,
				)
			)
				issues.push(
					`${name}:${node.position?.start.line}: unrendered markup ${node.value.slice(0, 100)}`,
				);
		});
}
const processor = await createMarkdownProcessor({
	syntaxHighlight: false,
	remarkPlugins: [remarkMath, remarkDirective, audit, parseDirectiveNode],
	rehypePlugins: [
		rehypeKatex,
		[
			rehypeComponents,
			{
				components: Object.fromEntries(
					["note", "tip", "important", "warning", "caution"].map((type) => [
						type,
						(props, children) => AdmonitionComponent(props, children, type),
					]),
				),
			},
		],
	],
});
for (const file of await fs.readdir("src/content/posts")) {
	if (!file.endsWith(".md")) continue;
	const source = await fs
		.readFile(`src/content/posts/${file}`, "utf8")
		.then((s) => s.replace(/\r\n/g, "\n"));
	if (!/^published: 2026-11-/m.test(source)) continue;
	name = file;
	count++;
	parsedCode = [];
	const result = await processor.render(
		source.replace(/^---[\s\S]*?\n---\r?\n/, ""),
	);
	const expectedBoxes = [
		...source.matchAll(/^ *:::(note|tip|important|warning|caution)\[/gm),
	].length;
	const boxes = [...result.code.matchAll(/class="admonition bdm-/g)].length;
	if (boxes !== expectedBoxes)
		issues.push(
			`${name}: expected ${expectedBoxes} admonitions, rendered ${boxes}`,
		);
	const expectedAnswers = [...source.matchAll(/^ *:::spoiler\[/gm)].length;
	const answers = [...result.code.matchAll(/<details class="answer-spoiler">/g)]
		.length;
	if (answers !== expectedAnswers)
		issues.push(
			`${name}: expected ${expectedAnswers} closed answer blocks, rendered ${answers}`,
		);
	// A fence can parse successfully while swallowing prose or losing its commands.
	const expectedCode = [
		...source.matchAll(
			/^([ \t]*)(`{3,}|~{3,})[^\n]*\n([\s\S]*?)^\1\2[ \t]*$/gm,
		),
	].map((m) =>
		m[3]
			.split("\n")
			.map((line) => (line.startsWith(m[1]) ? line.slice(m[1].length) : line))
			.join("\n")
			.trimEnd(),
	);
	if (JSON.stringify(expectedCode) !== JSON.stringify(parsedCode))
		issues.push(`${name}: code contents differ from fenced source`);
	for (const match of result.code.matchAll(
		/class="katex-error"[^>]*title="([^"]*)"/g,
	))
		issues.push(`${name}: ${match[1]}`);
}
console.log(
	JSON.stringify({ count, tables, formulas, codeBlocks, issues }, null, 2),
);
if (issues.length) process.exitCode = 1;
