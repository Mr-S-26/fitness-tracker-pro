const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app
  dir: './',
})

// Custom Jest configuration
const customJestConfig = {
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Test environment
  testEnvironment: 'jest-environment-jsdom',
  
  // Module path aliases (matching your tsconfig)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/app/layout.tsx',
    '!src/app/globals.css',
  ],
  
  // Test match patterns
  testMatch: [
    '<rootDir>/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
  ],
  
  // EXCLUDE E2E tests (they use Playwright, not Jest)
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/e2e/',  // Ignore E2E tests
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
}

// Export async config for Next.js
module.exports = createJestConfig(customJestConfig)