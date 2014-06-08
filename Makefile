.PHONY: build serve server

serve server: install
	./node_modules/.bin/watchify -v -t [ reactify --es6 ] index.jsx -o bundle.js

build: install
	./node_modules/.bin/browserify -t [ reactify --es6 ] index.jsx -o bundle.js

install:
	npm install
