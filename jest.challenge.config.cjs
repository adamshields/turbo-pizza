module.exports = {
  ...require('./jest.config.cjs'),
  testMatch: ['<rootDir>/tests/challenge/**/*.challenge.ts'],
  coverageDirectory: 'coverage/challenge',
};
