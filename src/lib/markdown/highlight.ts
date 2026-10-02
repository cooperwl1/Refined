/**
 * A deliberately tiny syntax highlighter. It doesn't try to be a compiler —
 * just enough colour to make code readable, in keeping with the site's restraint.
 * Output is a flat token list rendered as <span>s by <CodeBlock />.
 */

export type TokenType = 'plain' | 'keyword' | 'string' | 'comment' | 'number' | 'fn' | 'tag' | 'attr' | 'punct';
export interface Token {
	type: TokenType;
	value: string;
}

const KEYWORDS: Record<string, string[]> = {
	js: 'const let var function return if else for while do switch case break continue new class extends import from export default async await try catch finally throw typeof instanceof in of this super null undefined true false yield delete void static get set'.split(' '),
	ts: 'type interface enum implements private public protected readonly declare namespace as satisfies keyof infer never unknown any string number boolean'.split(' '),
	py: 'def return if elif else for while in not and or is None True False class import from as with try except finally raise lambda pass break continue yield async await global nonlocal self print'.split(' '),
	sh: 'if then else fi for do done while case esac function in export echo cd npm npx git pnpm yarn sudo'.split(' '),
	css: 'important media supports keyframes import layer theme apply utility'.split(' ')
};

const FAMILY: Record<string, keyof typeof KEYWORDS | 'markup' | 'json'> = {
	js: 'js', javascript: 'js', mjs: 'js', jsx: 'js',
	ts: 'ts', typescript: 'ts', tsx: 'ts', svelte: 'ts',
	py: 'py', python: 'py',
	sh: 'sh', bash: 'sh', shell: 'sh', zsh: 'sh', console: 'sh',
	css: 'css', scss: 'css', postcss: 'css',
	html: 'markup', xml: 'markup', svg: 'markup',
	json: 'json', yaml: 'json', yml: 'json', toml: 'json'
};

export function highlight(code: string, lang: string): Token[] {
	const family = FAMILY[lang];
	if (!family) return [{ type: 'plain', value: code }];

	const keywords = new Set(
		family === 'ts' ? [...KEYWORDS.js, ...KEYWORDS.ts] : family === 'markup' || family === 'json' ? [] : KEYWORDS[family]
	);
	const hashComments = family === 'py' || family === 'sh' || lang === 'yaml' || lang === 'yml' || lang === 'toml';

	const patterns: [TokenType, RegExp][] = [
		['comment', family === 'markup' ? /^<!--[\s\S]*?-->/ : hashComments ? /^#[^\n]*/ : /^(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/],
		['string', /^("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)/],
		['tag', family === 'markup' || lang === 'svelte' ? /^<\/?[A-Za-z][\w:.-]*/ : /^(?!)/],
		['attr', family === 'markup' ? /^[\w:-]+(?==)/ : family === 'json' ? /^[\w-]+(?=\s*:)/ : /^(?!)/],
		['number', /^-?\b\d+(\.\d+)?([eE][+-]?\d+)?\b|^#[0-9a-fA-F]{3,8}\b/],
		['fn', /^[A-Za-z_$][\w$]*(?=\s*\()/],
		['plain', /^[A-Za-z_$@-][\w$-]*/],
		['punct', /^[{}()[\];,.<>=+\-*/%!&|^~?:]+/],
		['plain', /^\s+/]
	];

	const out: Token[] = [];
	let rest = code;
	const pushTok = (type: TokenType, value: string) => {
		const last = out[out.length - 1];
		if (last && last.type === type) last.value += value;
		else out.push({ type, value });
	};

	while (rest.length) {
		let matched = false;
		for (const [type, re] of patterns) {
			const m = re.exec(rest);
			if (!m || !m[0]) continue;
			let t = type;
			if (type === 'plain' && keywords.has(m[0].replace(/^@/, ''))) t = 'keyword';
			if (family === 'json' && type === 'plain' && /^(true|false|null)$/.test(m[0])) t = 'keyword';
			pushTok(t, m[0]);
			rest = rest.slice(m[0].length);
			matched = true;
			break;
		}
		if (!matched) {
			pushTok('plain', rest[0]);
			rest = rest.slice(1);
		}
	}
	return out;
}
