import { Config } from '@jest/types';
import commonConfig from '../jest.config';

const config: Config.InitialOptions = {
    ...commonConfig,
    displayName: 'unit',
    modulePathIgnorePatterns: [
        'e2e'
    ]
}

export default config;
