const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^jose$': '<rootDir>/tests/__mocks__/jose.js',
    '^@panva/hkdf$': '<rootDir>/tests/__mocks__/jose.js',
    '^openid-client$': '<rootDir>/tests/__mocks__/jose.js',
    '^preact$': '<rootDir>/tests/__mocks__/jose.js',
    '^preact-render-to-string$': '<rootDir>/tests/__mocks__/jose.js',
    '^uuid$': '<rootDir>/tests/__mocks__/jose.js',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/tests/'],
  transformIgnorePatterns: [
    'node_modules/(?!(jose|openid-client|@panva/hkdf|preact|uuid|next-auth)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
