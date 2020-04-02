'use strict';

var gulp = require('gulp');
var server = require('browser-sync').create();
var imagemin = require('gulp-imagemin');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var runSequence  = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var yaml = require('js-yaml');
var fs = require('fs');
//var cache = require('gulp-cache');

var {SITE, PORT, BSREWRITE, PATHS} = loadConfig();

function loadConfig() {
  var ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

//===================
// Browsersync Proxy
//===================

gulp.task('server', function() {
  server.init({
    proxy: SITE.Remote.Url,
    serveStatic: ['.'],
    //files: ['./css/*.css', './js/*.js'],
    files: PATHS.Watch,
    plugins: ['bs-rewrite-rules'],
    rewriteRules: [
      {
        match: BSREWRITE.Css.Match,
        replace: BSREWRITE.Css.Replace,
      },
      {
        match: BSREWRITE.Js.Match,
        replace: BSREWRITE.Js.Replace,
      },
    ],
  });
});

//====================
// Sass Compilation
//===================

gulp.task('sass', function() {
  return gulp
    //.src('./src/scss/**/*.scss')
    .src(PATHS.Scss.Dir + '/*.scss')
    //.src(PATHS.Scss.Dir + '/' + PATHS.Scss.FileName, {sourcemaps: true})
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        includePaths: PATHS.Scss.Libraries,
      }).on('error', sass.logError),
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.Css.Dir))
    .pipe(server.stream());
});



//====================
// JS Concatination
//===================

gulp.task('js', function() {
  gulp
    //.src(PATHS.Js.Src) // path to your files
    .src(PATHS.Js.Src) // path to your files
    .pipe(concat(PATHS.Js.FileName)) // concat and name it "concat.js"
    .pipe(gulp.dest(PATHS.Js.Dest));
});

//====================
// Image Optimization
//===================

gulp.task('images', function() {
  gulp
    .src(PATHS.Img.Src + '/**/*')
    //.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(
      imagemin([
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
          plugins: [{removeViewBox: true}, {cleanupIDs: false}],
        }),
      ]),
    )
    .pipe(gulp.dest(PATHS.Img.Dest));
});


// ##################
// Watch Task
// ##################

gulp.task('watch', ['server', 'sass'], function() {
  //watch sass folder and compile changes
  gulp.watch(PATHS.Scss.Dir + '/**/*.scss', ['sass']);
  //watch js folder and compile changes
  gulp.watch(PATHS.Js.Src + '/**/*.js', ['js']);
  //watch image folder and optimize
  gulp.watch(PATHS.Img.Src + '/**/*', ['images']);
});

// ##################
// Build Task
// ##################

gulp.task('build', function() {
    runSequence(['sass']);
});

// ##################
// Default Task
// ##################

gulp.task('default', function() {
    runSequence(['build', 'server', 'watch']);
});
