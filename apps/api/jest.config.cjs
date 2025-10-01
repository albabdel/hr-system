module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: [],
  roots: ['<rootDir>']
};
