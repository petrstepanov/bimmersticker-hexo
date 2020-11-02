var browserify = require('browserify');
var gulp = require('gulp');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var del = require('del');
var log = require('gulplog');

var paths = {
	styles: {
		src: ['./development/sass/app.scss',
			'./node_modules/noty/lib/noty.css',
			'./node_modules/noty/lib/themes/nest.css'],
		srcWatch: './development/sass/**/*.scss',
		dest: './source/css'
	},
	scripts: {
		src: ['./development/js/app.js'],  // Only entry point for browserify
		srcWatch: './development/js/**/*.js',
		dest: './source/js'
	},
	fonts: {
		src: [''],
		dest: './fonts'
	},
	icons: {
		src: ['./node_modules/ionicons/dist/ionicons/svg/*.svg'],
		dest: './layout/ionicons'
	}
};


// Clean Task

function clean() {
	return del([paths.styles.dest, paths.scripts.dest, paths.fonts.dest, paths.icons.dest]);
}


// Copy resources

// function copyFonts() {
// 	return gulp.src(paths.fonts.src)
// 		.pipe(gulp.dest(paths.fonts.dest));
// }

function copyIcons() {
	return gulp.src(paths.icons.src)
		.pipe(gulp.dest(paths.icons.dest));
}

// var copy = gulp.series(copyFonts, copyIcons);

// Styles Task

function styles() {
	return gulp.src(paths.styles.src)
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(gulp.dest(paths.styles.dest));
}

function stylesDev() {
	return gulp.src(paths.styles.src)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.styles.dest));
}


// Scripts Task

function scripts() {
	// set up the browserify instance on a task basis
	var b = browserify({
		entries: paths.scripts.src,
		debug: false
	});

	return b.bundle()
		.pipe(source('app.js'))
		.pipe(buffer())
		.pipe(uglify())
		.on('error', log.error)
		.pipe(gulp.dest(paths.scripts.dest));
}

function scriptsDev() {
	// set up the browserify instance on a task basis
	var b = browserify({
		entries: paths.scripts.src,
		debug: true
	});

	return b.bundle()
		.pipe(source('app.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.scripts.dest));
}


// Watch Task

function watch() {
	gulp.watch(paths.scripts.srcWatch, scriptsDev);
	gulp.watch(paths.styles.srcWatch, stylesDev);
}


// Build

var development = gulp.series(clean, copyIcons, gulp.parallel(stylesDev, scriptsDev), watch);
var production = gulp.series(clean, copyIcons, gulp.parallel(styles, scripts));


// Exports

exports.clean = clean;
exports.styles = styles;
exports.stylesDev = stylesDev;
exports.scripts = scripts;
exports.scriptsDev = scriptsDev;

exports.development = development;
exports.production = production;

exports.default = production;

// exports.default = process.env.BUILD_TYPE=='production' ? production : development;