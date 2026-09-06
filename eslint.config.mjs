import nextVitals from 'eslint-config-next/core-web-vitals';

export default [
  ...nextVitals,
  {
    rules: {
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
];
