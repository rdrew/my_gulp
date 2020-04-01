//@format
var sourcemaps = require('gulp-sourcemaps');
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var yaml = require('js-yaml');
var fs = require('fs');
var imagemin = require('gulp-imagemin');

var {
  COMPATIBILITY,
  PORT,
  PROXY,
  LOCALPROXY,
  THEMENAME,
  UNCSS_OPTIONS,
  PATHS,
} = loadConfig();

function loadConfig() {
  var ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}
//

function sass() {
  return gulp
    .src(PATHS.Scss.Dir + '/' + PATHS.Scss.FileName, {sourcemaps: true})
    .pipe(sourcemaps.init())
    .pipe(
      $.sass({
        includePaths: PATHS.Scss.Libraries,
        outputStyle: 'compressed', // if css compressed **file size**
      }).on('error', $.sass.logError),
    )
    .pipe($.postcss([autoprefixer()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(PATHS.Css.Dir))
    .pipe(browserSync.stream());
}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
  return gulp
    .src(PATHS.Img.Src + '/*')
    .pipe(imagemin())
    .pipe(gulp.dest(PATHS.Img.Dest));
}

function remoteProxy() {
  browserSync.init({
    serveStatic: ['.'],
    proxy: SITE.Remote,
    startPath: SITE.Remote.StartPath,
    injectChanges: true,
    files: ['css/*.css', 'js/*.js'],
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
}

function watch() {
  gulp.watch(PATHS.ScssDir + '/*.scss', sass);
}

gulp.task('sass', sass);
gulp.task('images', images);
gulp.task('remoteProxy', remoteProxy);
gulp.task('watch', watch);

gulp.task('default', gulp.series('sass', 'images', 'remoteProxy', 'watch'));
