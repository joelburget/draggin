var gulp = require('gulp');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var exec = require('child_process').exec;
var reactify = require('reactify');

var reactifyES6 = function(file) {
    return reactify(file, {'es6': true});
};

gulp.task('makehs', function() {
    gulp.watch('hs/abssyntax.hs', function(event) {
        var cmd = 'fay --strict AbsSyntax --package fay-text,fay-dom --library hs/abssyntax.hs -o build/abssyntax.js';
        console.error(cmd);
        exec(cmd, function(error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
        });
    });
});

gulp.task('serve', function() {
    var bundler = watchify('./js/index.jsx');
    bundler.transform(reactifyES6);

    // rebundle every time index changes and leave some logspam
    bundler.on('log', console.error);
    bundler.on('update', rebundle);

    function rebundle () {
      return bundler.bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./build/'))
    }

    return rebundle();
});

gulp.task('default', ['makehs', 'serve']);
