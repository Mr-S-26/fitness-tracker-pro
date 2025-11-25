const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Custom Jest configuration
const customJestConfig = {
  // Setup files - use TypeScript version
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Test environment
  testEnvironment: 'jest-environment-jsdom',
  
  // Module path aliases (matching your tsconfig)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
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
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // TypeScript globals
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
      },
    },
  },
}

// createJestConfig is exported this way to ensure next/jest can load the Next.js config
module.exports = createJestConfig(customJestConfig)
