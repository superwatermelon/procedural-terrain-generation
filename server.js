import { Server } from './lib/server/index';

const DEFAULT_PORT = 3000;
const DEFAULT_BASE_URL = '';
const DEFAULT_SSL_ONLY = false;
const DEFAULT_GA_TRACKING_ID = '';

const port = process.env.PORT || process.env.npm_package_config_port || DEFAULT_PORT;
const sslOnly = process.env.SSL_ONLY || process.env.npm_package_config_sslOnly || DEFAULT_SSL_ONLY;
const baseUrl = process.env.BASE_URL || process.env.npm_package_config_baseUrl || DEFAULT_BASE_URL;
const gaTrackingId = process.env.GA_TRACKING_ID || process.env.npm_package_config_gaTrackingId || DEFAULT_GA_TRACKING_ID;

const server = new Server({
    port,
    sslOnly: sslOnly && sslOnly !== 'false',
    baseUrl,
    gaTrackingId
});
server.start();
