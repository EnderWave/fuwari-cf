import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import rehypeKatex from 'rehype-katex';
import {visit} from 'unist-util-visit';
const require=createRequire(import.meta.url);
const astroRequire=createRequire(require.resolve('astro/package.json'));
const {createMarkdownProcessor}=await import(pathToFileURL(astroRequire.resolve('@astrojs/markdown-remark')));
let issues=[]; let name; let tables=0, formulas=0, count=0;
function audit(){return tree=>visit(tree,node=>{
 if(node.type==='table')tables++;
 if(node.type==='math'||node.type==='inlineMath')formulas++;
 if(node.type==='text' && (/\$\$|^\s*\|.*\|\s*$/m.test(node.value)))issues.push(`${name}:${node.position?.start.line}: unrendered markup ${node.value.slice(0,100)}`);
});}
const processor=await createMarkdownProcessor({syntaxHighlight:false,remarkPlugins:[remarkMath,remarkDirective,audit],rehypePlugins:[rehypeKatex]});
for(const file of await fs.readdir('src/content/posts')){
 if(!file.endsWith('.md'))continue;
 const source=await fs.readFile(`src/content/posts/${file}`,'utf8');
 if(!/^published: 2026-11-/m.test(source))continue;
 name=file; count++;
 const result=await processor.render(source.replace(/^---[\s\S]*?\n---\r?\n/,''));
 for(const match of result.code.matchAll(/class="katex-error"[^>]*title="([^"]*)"/g))issues.push(`${name}: ${match[1]}`);
}
console.log(JSON.stringify({count,tables,formulas,issues},null,2));
if(issues.length)process.exitCode=1;
