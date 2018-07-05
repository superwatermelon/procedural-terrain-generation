import { Server } from './lib/server/index';

const port = process.env.PORT || process.env.npm_package_config_port || 3000;
const baseUrl = process.env.BASE_URL || process.env.npm_package_config_baseUrl || '';
const staticUrl = process.env.STATIC_URL || process.env.npm_package_config_staticUrl || '';

const server = new Server({
    port,
    baseUrl
});
server.start();
