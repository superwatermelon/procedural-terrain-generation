version := latest
name := superwatermelon-blog-procedural-terrain-generation-$(version)
dist := lib out/app/server.js out/app/lib public content
dist_static := out/css out/js

.PHONY: default
default: dist

.PHONY: dist
dist: $(dist)
	mkdir -p build/$(name)
	cp -R $(dist) build/$(name)/
	mkdir -p build/$(name)/out
	cp -R $(dist_static) build/$(name)/out/
	tar -C build/$(name) -czvf build/$(name).tar.gz .

$(dist):
	npm install

.PHONY: clean
clean:
	rm -rf build
