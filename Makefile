.PHONY: build serve server

build: install
	./node_modules/.bin/browserify -t [ reactify --es6 ] index.jsx -o bundle.js

serve server:
	./node_modules/.bin/watchify -v -t [ reactify --es6 ] index.jsx -o bundle.js

install:
	npm install
