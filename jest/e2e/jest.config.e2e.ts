import { Config } from '@jest/types';
import commonConfig from '../jest.config';

const config: Config.InitialOptions = {
    ...commonConfig,
    displayName: 'e2e',
    testMatch: [
        "**/*.test.e2e.ts"
    ]
}

export default config;
