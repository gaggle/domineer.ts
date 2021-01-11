module.exports = {
  extends: [
    "./ts",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jest/recommended",
  ],
  rules: {
    "jest/no-try-expect": "off",
    "react-hooks/exhaustive-deps": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
}
