// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import storybook from 'eslint-plugin-storybook';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'storybook-static/**',
  ]),

  ...storybook.configs['flat/recommended'],
  {
    settings: {
      // @/ alias를 internal로 해석하기 위한 TypeScript resolver
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
      'import/internal-regex': '^@/',
    },

    rules: {
      // builtin → external → internal → 상대 경로 → type → unknown
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index', 'object'],
            'type',
            'unknown',
          ],

          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],

          // import type은 internal이 아닌 type 그룹으로 분리
          pathGroupsExcludedImportTypes: ['builtin', 'type'],

          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]);

export default eslintConfig;
