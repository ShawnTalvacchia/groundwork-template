import next from 'eslint-config-next/core-web-vitals'

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      // Dist dirs by PATTERN, not by enumeration. `npm run verify` writes to
      // `.next-verify/`, and an enumerated list is only ever as current as the
      // last person who remembered to extend it - lint that walks into build
      // output still passes, because emitted JS trips no TS-only rule.
      '.next*/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '.claude/worktrees/**',
    ],
  },
  ...next,
]

export default config
