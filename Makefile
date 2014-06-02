.PHONY: build

build: install
	./node_modules/.bin/browserify -t [ reactify --es6 ] index.jsx > bundle.js

install:
	npm install
