export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '\\.(vue)$': '<rootDir>/test/__mocks__/fileMock.js'
  },
  testMatch: ['**/test/**/*.test.js', '**/test/**/*.spec.js'],
  collectCoverageFrom: [
    'src/**/*.js', 
    '!src/**/*.test.js', 
    '!src/**/*.spec.js',
    '!src/**/index.js' // Exclude index files from coverage
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  // Test organization
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  // Better error reporting
  errorOnDeprecated: true,
  // Parallel test execution
  maxWorkers: '50%'
};
