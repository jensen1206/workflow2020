// Import everything important
const gulp = require('gulp');
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const browserSync = require('browser-sync').create();
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');

// For SASS -> CSS
const sass = require('gulp-sass');
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const sassLint = require('gulp-sass-lint');

// HTML
const htmlmin = require('gulp-htmlmin');

// JavaScript/TypeScript
const browserify = require('gulp-browserify');
const babel = require('gulp-babel');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

// Define Important Varaibles
const src = './src';
const dest = './dest';

// Function for reload the Browser
const reload = (done) => {
    browserSync.reload();
    done();
};

// Function for serve the dev server in borwsaer
const serve = (done) => {
    browserSync.init({
        server: {
            baseDir: `${dest}`
        }
    });
    done();
};

// Compile sass into css with gulp
const css = () => {
  // Find SASS
  return gulp.src(`${src}/sass/**/*.sass`)
    // Init Plumber
    .pipe(plumber())
    // Lint SASS
    .pipe(sassLint({
      options: {
        formatter: 'stylish',
      },
      rules: {
        'no-ids': 1,
        'final-newline': 0,
        'no-mergeable-selectors': 1,
        'indentation': 0
      }
    }))
    // Format SASS
    .pipe(sassLint.format())
    // Start Source Map
    .pipe(sourcemaps.init())
    // Compile SASS -> CSS
    .pipe(sass.sync({
      outputStyle: "compressed"
    })).on('error', sass.logError)
    // add SUffix
    .pipe(rename({
      basename: 'style',
      suffix: ".min"
    }))
    // Add Autoprefixer & cssNano
    .pipe(postcss([autoprefixer(), cssnano()]))
    // Write Source Map
    .pipe(sourcemaps.write(''))
    // Write everything to destination folder
    .pipe(gulp.dest(`${dest}/assets/css`))
    // Reload Page
    .pipe(browserSync.stream());
};

// Compile .js to minify .js
const script = () => {
    // FindJS
    return gulp.src(`${src}/js/**/*.js`)
        // Init Plumber
        .pipe(plumber(((error) => {
            gutil.log(error.message);
        })))
        // Start useing source maps
        .pipe(sourcemaps.init())
        // concat
        .pipe(concat('concat.js'))
        // Use Babel
        .pipe(babel())
        // JavaScript Lint
        .pipe(jshint())
        // Report of jslint
        .pipe(jshint.reporter('jshint-stylish'))
        // Add browser Support
        .pipe(browserify({
            insertGlobals:false
        }))
        // Minify
        .pipe(uglify())
        // add SUffix
        .pipe(rename({ basename: 'global', suffix: ".min" }))
        // Write Sourcemap
        .pipe(sourcemaps.write(''))
        // Write everything to destination folder
        .pipe(gulp.dest(`${dest}/assets/js`))
        // Update Browser
        .pipe(browserSync.stream());
};

// Compile .html to minify .html
const html = () => {
  // Find HTML
  return gulp.src(`${src}/*.html`)
    // Init Plumber
    .pipe(plumber())
    // Compile HML
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      html5: true,
      removeEmptyAttributes: true,
      removeTagWhitespace: true,
      sortAttributes: true,
      sortClassName: true
    }))
    // Write everything to destination folder
    .pipe(gulp.dest(`${dest}`));
};

// Compile .php to minify .php
const php = () => {
  // Find PHP
  return gulp.src(`${src}/*.php`)
    // Init Plumber
    .pipe(plumber())
    // Compile PHP
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      html5: true,
      removeEmptyAttributes: true,
      removeTagWhitespace: true,
      sortAttributes: true,
      sortClassName: true
    }))
    // Write everything to destination folder
    .pipe(gulp.dest(`${dest}`));
};

const fonts = () => {
  return gulp.src(`${src}/fonts/fontawesome-webfont.*`)
  .pipe(gulp.dest(`${dest}/fonts/`));
};

// Function to watch our Changes and refreash page
const watch = () => gulp.watch([`${src}/*.html`,`${src}/*.php`, `${src}/js/**/*.js`, `${src}/sass/**/*.sass`],
gulp.series(css, script, html, php, reload));

// All Tasks for this Project
const dev = gulp.series(css, script, html, php, fonts, serve, watch);

// Just Build the Project
const build = gulp.series(html, php, fonts, script, css);
// Default function (used when type gulp)

exports.dev = dev;
exports.build = build;
exports.default = build;
