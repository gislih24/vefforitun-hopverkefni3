module.exports = {
    // Core formatting rules
    printWidth: 100, // Modern screens can handle slightly longer lines.
    tabWidth: 4, // Standard for JavaScript ecosystems.
    useTabs: false, // Spaces are dominant in the JS community.
    semi: true, // Required for ASI safety.
    singleQuote: true, // Preferred by Airbnb/React/Node.js communities.
    trailingComma: 'all', // Modern practice (works with ES2017+).
    bracketSpacing: true, // { foo: bar } readability.
    bracketSameLine: false, // JSX standard.
    arrowParens: 'always', // Explicit is better than implicit.

    // Language-specific handling
    quoteProps: 'as-needed', // Only quote invalid identifiers.
    jsxSingleQuote: false, // JSX attributes typically use double quotes.
    endOfLine: 'lf', // Unix-style line endings (Git-friendly).
    proseWrap: 'always', // Better for Markdown readability.

    // Framework-specific rules
    htmlWhitespaceSensitivity: 'css', // Respect CSS display rules.
    vueIndentScriptAndStyle: false, // Vue template consistency.

    // Code embedding/processing
    embeddedLanguageFormatting: 'auto', // Format JS in markdown/html.
    insertPragma: false, // Only add @format with --insert-pragma.
    requirePragma: false, // Don't require magic comments.

    // File-type specific overrides
    overrides: [
        // JSON should use double quotes
        { files: '*.json', options: { singleQuote: false, printWidth: 80 } },
        // YAML/HTML need original quotes
        { files: '*.{yml,html}', options: { singleQuote: false } },
        // Markdown readability
        { files: '*.md', options: { proseWrap: 'always', printWidth: 80 } },
        // Shell script formatting
        { files: '*.sh', options: { tabWidth: 4, useTabs: false } },
    ],
};
