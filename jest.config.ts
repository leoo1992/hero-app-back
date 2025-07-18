export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const coverageDirectory = './coverage';
export const testMatch = ['**/tests/**/*.spec.ts'];
export const moduleFileExtensions = ['js', 'json', 'ts'];
export const collectCoverageFrom = ['**/*.(t|j)s'];
export const moduleNameMapper = {
  '^src/(.*)$': '<rootDir>/src/$1',
};
export const rootDir = '.';
export const transform = {
  '^.+\\.ts$': 'ts-jest',
};
export const globals = {
  'ts-jest': {
    tsconfig: 'tsconfig.json',
  },
};

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './',
  testMatch: ['**/tests/**/*.spec.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
};
