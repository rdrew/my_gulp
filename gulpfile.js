//@format
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
    .src(PATHS.ScssDir + '/' + PATHS.ScssFileName)
    .pipe(
      $.sass({
        includePaths: PATHS.ScssLibraries,
        outputStyle: 'compressed', // if css compressed **file size**
      }).on('error', $.sass.logError),
    )
    .pipe($.postcss([autoprefixer()]))
    .pipe(gulp.dest(PATHS.CssFileDir))
    .pipe(browserSync.stream());
}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
  return gulp
    .src(PATHS.ImgSrc + '/*')
    .pipe(imagemin())
    .pipe(gulp.dest(PATHS.ImgDest));
}

function serve() {
  browserSync.init({
    //server: './',
    proxy: LOCALPROXY,
  });

  gulp.watch(PATHS.ScssDir + '/*.scss', sass);
}

gulp.task('sass', sass);
gulp.task('images', images);
gulp.task('serve', gulp.series('sass', serve));
gulp.task('default', gulp.series('sass', serve));
