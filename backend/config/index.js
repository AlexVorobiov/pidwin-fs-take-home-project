import convict from 'convict'
import dotenv from 'dotenv';

dotenv.config();

const configSchema = convict({
    env: {
        format: ['prod', 'dev', 'test'],
        default: 'dev',
        arg: 'nodeEnv',
        env: 'NODE_ENV'
    },
    port: {
        doc: 'The port to bind.',
        format: 'port',
        default: 5000,
        env: 'PORT',
    },
    mongodbURL: {
        doc: 'The MongoDB connection URL.',
        format: String,
        default: 'mongodb://localhost:27017',
        env: 'MONGODB_URL',
    },
    jwtSecret: {
        doc: 'The secret key for JSON Web Token.',
        format: String,
        default: '',
        env: 'JWT_SECRET',
    },
    jwtExpireTime: {
        doc: 'JWT expiration time.',
        format: String,
        default: '1h', // Default to 1 hour
        env: 'JWT_EXPIRE_TIME',
    },
});

const env = configSchema.get('env');
configSchema.loadFile(`./config/${env}.json`);
configSchema.validate({ allowed: 'strict' });

const config =  configSchema.getProperties()

export {config};
