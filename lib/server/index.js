import express from 'express';
import fs from 'fs';
import marked from 'marked';
import highlight from 'highlight.js';
import mustache from 'mustache';
import mustacheExpress from 'mustache-express';
import path from 'path';
import React from 'react';

class Content {
    constructor(root) {
        this._root = root;
    }

    render(name) {
        return marked(fs.readFileSync(path.join(this._root, `${name}.md`), 'utf-8'), {
            highlight: function(code) {
                return highlight.highlightAuto(code).value;
            }
        })
    }
}

export class Server {
    constructor({ port, baseUrl }) {
        const content = new Content(path.join(__dirname, '..', '..', 'content'));
        this._port = port;
        this._app = express();
        this._app.engine('mustache', mustacheExpress());
        this._app.set('view engine', 'mustache');
        this._app.set('views', path.join(__dirname, 'templates'));
        this._app.use('/', express.static(path.join(__dirname, '..', '..', 'public')));
        this._app.use('/js', express.static(path.join(__dirname, '..', '..', 'out', 'js')));
        this._app.use('/css', express.static(path.join(__dirname, '..', '..', 'out', 'css')));
        this._app.get('/', (req, res) => {
            res.render('index', {
                title: 'Procedural Terrain Generation',
                subtitle: 'Part 1. Introduction',
                description: 'In this blog series we go into detail about developing Procedural Terrain Generation for the game They Arrive',
                cover: `${baseUrl}/img/covers/parts-1-and-2.jpg`,
                content: content.render('01-intro'),
                bio: content.render('bio'),
                next: `${baseUrl}/landmark-placement`,
                canonical: baseUrl
            });
        });
        this._app.get('/landmark-placement', (req, res) => {
            res.render('index', {
                title: 'Procedural Terrain Generation',
                subtitle: 'Part 2. Landmark Placement',
                description: 'As part of our Procedural Terrain Generation we start with random placement of game landmarks for They Arrive',
                cover: `${baseUrl}/img/covers/parts-1-and-2.jpg`,
                content: content.render('02-landmarks'),
                bio: content.render('bio'),
                prev: baseUrl,
                canonical: `${baseUrl}/landmark-placement`
            });
        });
        this._app.get('/voronoi-tessellation', (req, res) => {
            res.render('index', {
                title: 'Procedural Terrain Generation',
                subtitle: 'Part 3. Voronoi Tessellation',
                content: content.render('03-voronoi'),
                bio: content.render('bio')
            });
        });
        this._app.get('/noise', (req, res) => {
            res.render('index', {
                title: 'Procedural Terrain Generation',
                subtitle: 'Part 4. Noise',
                content: content.render('04-noise'),
                bio: content.render('bio')
            });
        });
        this._app.get('/perlin-noise', (req, res) => {
            res.render('index', {
                title: 'Procedural Terrain Generation',
                subtitle: 'Part 5. Perlin Noise',
                content: content.render('05-perlin'),
                bio: content.render('bio')
            });
        });
        this._app.get('/full', (req, res) => {
            res.render('index', {
                title: 'Procedural Terrain Generation',
                subtitle: 'Complete',
                content: content.render('content'),
                bio: content.render('bio')
            });
        });
    }

    start() {
        this._server = this._app.listen(this._port, () => {
            console.log('Server started, listening on port %d', this._server.address().port)
        });
    }
}
