// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from 'eslint/config';

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
