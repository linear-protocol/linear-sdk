export default {
  "src/**/*.ts?(x)": [
    () => "tsc --project tsconfig.json --alwaysStrict",
    "tsdx build",
    "prettier --write",
    "tsdx lint --fix"
  ],
};
