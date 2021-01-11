module.exports = {
  "env": {
    "commonjs": true,
    "es2021": true,
    "node": true,
  },
  "extends": "eslint:recommended",
  ignorePatterns: "examples/",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module",
  },
  "rules": {
    "linebreak-style": [
      "error",
      "unix",
    ],
    "quotes": [
      "error",
      "double",
    ],
    "semi": [
      "error",
      "never",
    ],
  },
}
