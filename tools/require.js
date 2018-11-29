const   gulp = require('gulp'),
        fs = require('fs'),
        cssnano = require('cssnano'),
        postcss = require('gulp-postcss'),
        autoprefixer = require('autoprefixer'),
        browserSync = require('browser-sync'),
        plumber = require('gulp-plumber'),
        sass = require('gulp-sass'),
        mqpacker = require('css-mqpacker'),
        gulpEdge = require('gulp-edgejs');

module.export = {
    gulp,
    gulpEdge,
    fs,
    cssnano,
    postcss,
    autoprefixer,
    browserSync,
    plumber,
    sass,
    mqpacker,
}
