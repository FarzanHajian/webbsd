const browserify = require('browserify');
const tsify = require('tsify');
const tinyify = require('tinyify');
const source = require('vinyl-source-stream');
const { src, dest } = require('gulp');
var sass = require('gulp-sass');

function defaultTask(cb) {
    browserify({
        basedir: '.',
        entries: ['src/webbsd.ts'],
        //debug: true,
        standalone: 'webbsd',   // Must match the module name in BottomSheetDialog._uiTemplate string, inside onclick handler.
        cache: {},
        packageCache: {}
    })
        .plugin(tsify, { noImplicitAny: true, target: 'es6' })
        .plugin(tinyify)
        .bundle()
        .pipe(source('webbsd.js'))
        .pipe(dest('dist'));

    src('src/webbsd.scss')
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(dest('dist'));

    cb();
}

exports.default = defaultTask;