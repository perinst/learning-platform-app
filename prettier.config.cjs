// Prettier configuration for the entire repo (API + UI)
// Tailwind plugin is added if available; config works fine without it.
/** @type {import("prettier").Config} */
const config = {
    $schema: 'https://json.schemastore.org/prettierrc',
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'always',
    endOfLine: 'lf',
    plugins: [],
    overrides: [
        {
            files: ['*.yml', '*.yaml'],
            options: { singleQuote: false, tabWidth: 4 },
        },
        {
            files: ['*.md'],
            options: { proseWrap: 'preserve' },
        },
        {
            files: ['*.json', '*.jsonc'],
            options: { trailingComma: 'none' },
        },
        {
            files: ['*.css', '*.scss', '*.less'],
            options: { singleQuote: false },
        },
        {
            files: ['*.ts', '*.tsx'],
            options: { parser: 'typescript' },
        },
    ],
};

module.exports = config;
