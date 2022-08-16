import { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    rootDir: '../../',
    setupFilesAfterEnv: [
        "./jest/jest.setup.ts"
    ]
}

export default config;
