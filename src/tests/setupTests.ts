import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.test file
config({ path: resolve(__dirname, '../../.env.test') });

// Silence console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};