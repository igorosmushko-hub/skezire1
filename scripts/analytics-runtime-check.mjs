import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=fs.readFileSync('src/app/layout.tsx','utf8');
const ast=ts.createSourceFile('layout.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let script;
function visit(node){if(ts.isNoSubstitutionTemplateLiteral(node)&&node.text.includes('function analyticsUrl'))script=node.text;ts.forEachChild(node,visit);}
visit(ast);assert.ok(script);
const calls=[];
const context={URL,location:{origin:'https://preview.example',href:'https://preview.example/ru/shezhire-tree?highlight=secret-person&q=private-query&_vercel_share=private'},document:{scripts:[],referrer:'https://preview.example/kk/shezhire-tree?highlight=hidden',createElement:()=>({}),getElementsByTagName:()=>[{parentNode:{insertBefore(){}}}]},window:{},ym:(...args)=>calls.push(args)};
vm.runInNewContext(script,context);
const options=calls[0][2];assert.equal(options.url,'https://preview.example/ru/shezhire-tree');assert.equal(options.referrer,'https://preview.example/kk/shezhire-tree');
assert.equal(context.analyticsUrl(''),'');assert.equal(context.analyticsUrl('https://example.com/ru/encyclopedia/uly?utm_source=test&_vercel_share=private'),'https://example.com/ru/encyclopedia/uly?utm_source=test');
assert.match(source,/id="metrika-queue" strategy="beforeInteractive"/);
console.log('PASS actual emitted Metrika script: map URLs/referrers stripped, preview access params removed, empty referrer preserved, early goal queue. Provider receipt NOT verified.');
