// eslint-disable-next-line
module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2019,
		sourceType: "module"
	},
	env: {
		es6: true,
		browser: true,
		node: true
	},
	extends: [
		"eslint:recommended"
	],
	plugins: [
		"svelte3",
		"@typescript-eslint"
	],
	ignorePatterns: [
		"dist/"
	],
	overrides: [
		{
			files: ["*.svelte"],
			processor: "svelte3/svelte3"
		}
	],
	settings: {
		"svelte3/typescript": true
	},
	rules: {
		"indent": [
			"error",
			"tab",
			{ "SwitchCase" : 1 }
		],
		"linebreak-style": [
			"error",
			"windows"
		],
		"brace-style": [
			"error",
			"1tbs",
			{ "allowSingleLine": true }
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		],
		"space-before-function-paren": [
			"error",
			{
				"anonymous": "never",
				"named": "never",
				"asyncArrow": "always"
			}
		],
		"no-return-assign": "off",
		"object-curly-spacing": [
			"error",
			"always"
		],
		"curly": [
			"error",
			"multi-line",
			"consistent"
		],
		"comma-spacing": [
			"error"
		],
		"array-bracket-spacing": [
			"error",
			"never"
		],
		"space-before-blocks": [
			"error",
			"always"
		],
		"block-spacing": [
			"error",
			"always"
		],
		"no-trailing-spaces": [
			"error"
		],
		"eol-last": [
			"error"
		],
		"no-multiple-empty-lines": [
			"error",
			{
				"max": 2,
				"maxBOF": 0,
				"maxEOF": 1
			}
		]
	},
};
