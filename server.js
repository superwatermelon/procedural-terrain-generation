import { Server } from './lib/server/index';

const port = process.env.PORT || process.env.npm_package_config_port || 3000;
const sslOnly = process.env.SSL_ONLY || process.env.npm_package_config_sslOnly;

const server = new Server({
    port,
    sslOnly: sslOnly && sslOnly !== 'false'
});
server.start();
