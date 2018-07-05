version := latest
name := superwatermelon-blog-procedural-terrain-generation-$(version)
dist := lib out/app/server.js out/app/lib public content package.json package-lock.json
dist_static := out/css out/js

.PHONY: default
default: dist

.PHONY: dist
dist: $(dist)
	mkdir -p build/app
	cp -R $(dist) build/app/
	mkdir -p build/app/out
	cp -R $(dist_static) build/app/out/
	cd build/app && npm install --production
	mkdir -p build/dist
	tar -C build/app -czvf build/dist/$(name).tar.gz .

$(dist):
	npm install

.PHONY: clean
clean:
	rm -rf build
