import { Server } from './lib/server/index';

const port = process.env.PORT || process.env.npm_package_config_port || 3000;

const server = new Server({
    port
});
server.start();
