const { createCjsPreset } = require('jest-preset-angular/presets');
/** @type {import('jest').Config} */
module.exports = {
  ...createCjsPreset(),
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: ['src/app/**/*.ts', '!src/app/**/*.spec.ts', '!src/app/**/*.routes.ts', '!src/app/app.config.ts', '!src/app/**/*.model.ts'],
  coverageDirectory: 'coverage/baseline',
  coverageReporters: ['text', 'html', 'lcov'],
};
