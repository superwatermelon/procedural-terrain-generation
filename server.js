import { Server } from './lib/server/index';

const DEFAULT_PORT = 3000;
const DEFAULT_BASE_URL = '';
const DEFAULT_SSL_ONLY = false;

const port = process.env.PORT || process.env.npm_package_config_port || DEFAULT_PORT;
const sslOnly = process.env.SSL_ONLY || process.env.npm_package_config_sslOnly || DEFAULT_SSL_ONLY;
const baseUrl = process.env.BASE_URL || process.env.npm_package_config_baseUrl || DEFAULT_BASE_URL;

const server = new Server({
    port,
    sslOnly: sslOnly && sslOnly !== 'false',
    baseUrl
});
server.start();
