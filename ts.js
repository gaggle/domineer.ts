module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  env: {
    es6: true,
    node: true,
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  extends: [
    "standard",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  plugins: ["@typescript-eslint", "import", "mocha-no-only", "filenames"],
  rules: {
    // "@typescript-eslint/camelcase": ["error", { properties: "never" }], // We should always camelCase, but to interface with external systems we need to allow properties
    "@typescript-eslint/explicit-function-return-type": "error", // Is by default warning, but we are so opinionated we do errors
    "@typescript-eslint/member-ordering": "error", // Public methods go to top
    "@typescript-eslint/no-explicit-any": "off", // Too difficult w. Typeorm to force types on everything
    "@typescript-eslint/no-unused-vars": ["error", { args: "none", varsIgnorePattern: "^_" }], // Underscored is a nice way to say a variable is unused
    "@typescript-eslint/no-use-before-define": ["error", "nofunc"], // Off for functions and classes because its nonsense to require those to be ordered by use
    "comma-dangle": ["error", "always-multiline"], // We like dangling commas on multilines
    "filenames/match-regex": ["error", "^([a-zA-Z0-9.]+)$"], // To keep consistency we only allow camelCased filenames
    "filenames/no-index": "error", // The "index file" pattern makes it hard to see which file is open, so let's not
    indent: ["error", 2],
    "import/default": "off", // Doesn't interpret "module.exports = ..." as default export so reports many false negatives
    "import/no-unresolved": ["error", { ignore: ["express-serve-static-core"] }], // Some modules appear to be unresolved but do exist
    "import/order": ["error", { "newlines-between": "always", alphabetize: { order: "asc" } }], // We like lines between import groups, and alphabetized import groups
    "mocha-no-only/mocha-no-only": ["error"], // Don't allow mocha ".only", it effectively silences test-errors
    "no-dupe-class-members": "off", // If we leave this on we can't make constructor overrides, and Typescript compiler already handles accidental dupes
    "no-useless-constructor": "off", // If left enabled it causes `cannot ready property 'body' of null` ESLint error to appears in (at least) IntelliJ Ultimate
    quotes: ["error", "double", { avoidEscape: true }], // We like double-quotes (because it allows apostrophes more easily),
  },
  overrides: [
    {
      files: "*.spec.ts", // Tests need to use null-assertions to make life easier, because of how it sets variables inside scopes
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
      },
    },
  ],
}
