var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    version = require('gulp-version-number');

var paths = {
  // images: {
  //   src:
  // },
  styles: {
    src: ['./development/sass/blueberry.scss',
          './node_modules/noty/lib/noty.css',
          './node_modules/noty/lib/themes/nest.css'],
    srcWatch: './development/sass/**/*.scss',
    dest: './source/css'
  },
  scripts: {
    src: ['./node_modules/jquery/dist/jquery.js',
          './node_modules/bootstrap/dist/js/bootstrap.bundle.js',
          './node_modules/sticky-kit/dist/sticky-kit.js',
          './node_modules/shufflejs/dist/shuffle.js',
          './node_modules/in-view/dist/in-view.min.js',
          './node_modules/noty/lib/noty.js',
          './node_modules/autosize/dist/autosize.js',

          // './development/js/modules/image-preloader.js',
          './development/js/modules/events.js',
          './development/js/modules/helpers.js',

          './development/js/modules/notification-center.js',
          './development/js/modules/navbar-fixer.js',
          './development/js/modules/sticky-container.js',
          './development/js/modules/swatches.js',
          './development/js/modules/navbar-buy-button.js',
          './development/js/modules/content-buy-button.js',
          './development/js/modules/posts-filter.js',
          './development/js/modules/smooth-scroll.js',
          './development/js/modules/form-ajax-submit.js',
          './development/js/app.js'],
    srcWatch: './development/js/**/*.js',
    dest: './source/js'
  }
};

// Scripts Task

gulp.task('scripts', function() {
  return gulp
    .src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(concat('blueberry.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.scripts.dest));
});

gulp.task('scripts-prod', function() {
  return gulp
    .src(paths.scripts.src)
    .pipe(concat('blueberry.js'))
    .pipe(uglify()).on('error', function(err) {
      console.log(err.toString());
    })
    .pipe(gulp.dest(paths.scripts.dest));
});

// Styles Task

gulp.task('styles', function () {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.styles.dest));
});

gulp.task('styles-prod', function () {
  return gulp.src(paths.styles.src)
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.styles.dest));
});

// gulp.task('suffix', function(){
//   gulp.src(['file.txt'])
//     .pipe(replace('bar', 'foo'))
//     .pipe(gulp.dest('build/'));
// });

gulp.task('watch', function() {
    gulp.watch(paths.scripts.srcWatch, ['scripts']);
    gulp.watch(paths.styles.srcWatch, ['styles']);
});

gulp.task('production', ['scripts-prod', 'styles-prod']);
gulp.task('development', ['scripts', 'styles']);
gulp.task('default', ['development', 'watch']);
