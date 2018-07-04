import { Server } from './lib/server/index';

const server = new Server({
    port: process.env.npm_package_config_port
});
server.start();