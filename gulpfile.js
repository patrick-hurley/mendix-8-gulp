/*
  Gulpfile.js for Mendix apps
*/

'use strict';

/*
  *************************************************************************
  * Dependencies *
  *************************************************************************/
const gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync').create(),
  path = require('path'),
  sourcemaps = require('gulp-sourcemaps'),
  notify = require('gulp-notify'),
  log = require('fancy-log'),
  autoprefixer = require('gulp-autoprefixer'),
  plumber = require('gulp-plumber');

/*
  *************************************************************************
  * Config *
  *************************************************************************/
const sourceStyleFolder = 'theme/styles';
const deploymentStyleFolder = 'styles';
const proxyAddress = 'http://proxyaddress';


/*
  *************************************************************************
  * Folder structure *
  *************************************************************************/
const sourceFolder = './' + sourceStyleFolder + '/web',
  sourceSassFolder = sourceFolder + '/sass/',
  sourceCssFolder = sourceFolder + '/css/';

const deploymentFolder = './deployment/web/' + deploymentStyleFolder,
  deploymentCssFolder = deploymentFolder + '/web/css/';

/*
  *************************************************************************
  * Utility tasks *
  *************************************************************************/
const onError = err => {
  log('There was an error' + err.toString());
  this.emit('end');
};

// show sass compilation errors as a notification
const onSassError = function (err) {
  notify.onError({
    title: "SCSS Error",
    subtitle: "Sass compiler error",
    message: "Error: <%= error.message %>",
    sound: "Hero"
  })(err);

  this.emit('end');
};

/*
  *************************************************************************
  * Gulp tasks *
  *************************************************************************/
gulp.task('build-sass', function () {
  return gulp.src(sourceSassFolder + '**/*.scss')
    .pipe(plumber({
      errorHandler: onSassError
    }))
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(sourceCssFolder))
    .pipe(gulp.dest(deploymentCssFolder));
});

gulp.task('copy-css', function () {
  return gulp.src(sourceCssFolder + '**/*.css')
    .pipe(gulp.dest(deploymentCssFolder));
});

gulp.task('watch:sass', function () {
  gulp.watch('**/*.scss', { cwd: sourceSassFolder }, gulp.series('build-sass'));
});

gulp.task('watch:css', function () {
  gulp.watch('**/*.css', { cwd: sourceCssFolder }, gulp.series('copy-css'));
});

gulp.task('default', gulp.series(['watch:sass']));
gulp.task('css', gulp.series(['watch:css']));

// Browsersync
gulp.task('browsersync-sass', function () {
  return gulp.src(sourceSassFolder + '**/*.scss')
    .pipe(plumber({
      errorHandler: onSassError
    }))
    .pipe(sass().on("error", sass.logError))
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())
    .pipe(autoprefixer())
    .pipe(gulp.dest(sourceCssFolder))
    .pipe(gulp.dest(deploymentCssFolder))
    .pipe(browserSync.stream());
});

gulp.task('watch:browsersync-sass', function () {
  gulp.watch('**/*.scss', { cwd: sourceSassFolder }, gulp.series('browsersync-sass'));
});

gulp.task('browsersync', function () {
  browserSync.init({
    proxy: {
      target: proxyAddress,
      ws: true
    },
    online: true,
    open: true,
    reloadOnRestart: true,
    ghostMode: false
  });
});

gulp.task('dev', gulp.parallel(['browsersync-sass', 'watch:browsersync-sass', 'browsersync']));