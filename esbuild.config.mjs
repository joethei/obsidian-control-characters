import esbuild from "esbuild";
import fs from 'fs';
import process from "process";
import builtins from 'builtin-modules';
import sass from "sass";
import minify from "css-minify";


const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
https://github.com/joethei/obsidian-non-printing-chars
*/
`;

const prod = (process.argv[2] === 'production');


const copyMinifiedCSS = {
	name: 'minify-css',
	setup: (build) => {
		build.onEnd(async () => {
			const {css} = sass.compile('src/styles.scss');
			let content;
			if(prod) {
				const minCss = await minify(css);
				content = `${banner}\n${minCss}`;
			}else {
				content = `${banner}\n${css}`;
			}
			fs.writeFileSync('build/styles.css', content, {encoding: 'utf-8'});
		})
	}
}

const copyManifest = {
	name: 'copy-manifest',
	setup: (build) => {
		build.onEnd(() => {
			fs.copyFileSync('manifest.json', 'build/manifest.json');
		});
	},
};

esbuild.build({
	banner: {
		js: banner,
	},
	entryPoints: ['src/main.ts'],
	bundle: true,
	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/closebrackets',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/comment',
		'@codemirror/fold',
		'@codemirror/gutter',
		'@codemirror/highlight',
		'@codemirror/history',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/matchbrackets',
		'@codemirror/panel',
		'@codemirror/rangeset',
		'@codemirror/rectangular-selection',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/stream-parser',
		'@codemirror/text',
		'@codemirror/tooltip',
		'@codemirror/view',
		...builtins],
	format: 'cjs',
	watch: !prod,
	target: 'es2016',
	logLevel: "info",
	sourcemap: prod ? false : 'inline',
	treeShaking: true,
	outfile: 'build/main.js',
	plugins: [copyManifest, copyMinifiedCSS]
}).catch(() => process.exit(1));
