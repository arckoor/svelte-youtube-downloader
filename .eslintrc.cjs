// eslint-disable-next-line
module.exports = {
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
		"svelte3"
	],
	ignorePatterns: [
		"dist/"
	],
	overrides: [
		{
			files: ["**/*.svelte"],
			processor: "svelte3/svelte3"
		}
	],
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
		"no-return-assign": [
			"error",
			"always"
		],
		"object-curly-spacing": [
			"error",
			"always"
		],
		"curly": [
			"error",
			"all"
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