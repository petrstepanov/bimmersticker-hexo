var browserify = require('browserify');
var gulp = require('gulp');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass')(require('sass'));
// var babel = require('gulp-babel');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var del = require('del');
var log = require('gulplog');
var replace = require('gulp-replace');
const browsersync = require('browser-sync').create();

var paths = {
	htmls: {
		srcWatch: './layout/**/*.ejs'
	},
	styles: {
		src: ['./development/sass/app.scss'],
		srcWatch: './development/sass/**/*.scss',
		dest: './source/css'
	},
	stylesComponents: {
		src: ['./development/sass-components/*.scss'],
		srcWatch: './development/sass-components/**/*.scss',
		dest: './source/css/components'
	},
	scripts: {
		src: ['./development/js/app.js'],  // Only entry point for browserify
		srcWatch: './development/js/**/*.js',
		dest: './source/js'
	},
	scriptsComponents: {
		src: ['./development/js-components/*.js'],  // Only entry point for browserify
		srcWatch: './development/js-components/**/*.js',
		dest: './source/js/components'
	},
	fonts: {
		src: [''],
		dest: './fonts'
	},
	ionicons: {
		src: ['./node_modules/ionicons/dist/svg/*.svg'],
		dest: './layout/ionicons'
	},
	svg: {
		src: './development/svg/*.svg',
		srcWatch: './development/svg/**/*.svg',
		dest: './layout/svg'
	}
};

// Clean Task

function clean() {
	return del([paths.styles.dest, paths.scripts.dest, paths.fonts.dest, paths.ionicons.dest, paths.svg.dest]);
}

// Copy resources

// function copyFonts() {
// 	return gulp.src(paths.fonts.src)
// 		.pipe(gulp.dest(paths.fonts.dest));
// }

function copyIonicons() {
	return gulp.src(paths.ionicons.src)
		.pipe(replace('<svg', '<svg width="512" height="512"'))
		.pipe(gulp.dest(paths.ionicons.dest));
}

function cleanupSVG() {
	return gulp.src(paths.svg.src)
		.pipe(replace(/fill=\"\S+\"/g, ''))
		.pipe(replace(/stroke=\"\S+\"/, ''))
		.pipe(gulp.dest(paths.svg.dest));
}

// var copy = gulp.series(copyFonts, copyIonicons);

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
		.pipe(rename(function (path) {
			// Updates the object in-place
			// path.dirname += "/ciao";
			path.basename += "-dev";
			//path.extname = ".md";
		}))
		.pipe(gulp.dest(paths.styles.dest)); //.on('end', function () { beep(); });
}

function stylesComponents() {
	return gulp.src(paths.stylesComponents.src)
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(gulp.dest(paths.stylesComponents.dest));
}

function stylesComponentsDev() {
	return gulp.src(paths.stylesComponents.src)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(sourcemaps.write('.'))
		.pipe(rename(function (path) {
			// Updates the object in-place
			// path.dirname += "/ciao";
			path.basename += "-dev";
			//path.extname = ".md";
		}))
		.pipe(gulp.dest(paths.stylesComponents.dest)); //.on('end', function () { beep(); });
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
		.pipe(source('app-dev.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.scripts.dest)); //.on('end', function () { beep(); });
}

function scriptsComponents() {
	return gulp.src(paths.scriptsComponents.src, { sourcemaps: false })
		.pipe(uglify())
		.pipe(gulp.dest(paths.scriptsComponents.dest));
}

function scriptsComponentsDev(cb) {
	return gulp.src(paths.scriptsComponents.src, { sourcemaps: true })
		.pipe(rename(function (path) {
			path.basename += "-dev";
		}))
		.pipe(gulp.dest(paths.scriptsComponents.dest));
}

// Beep task (with callback)
function beepTask(cb) {
	console.log('\u0007');
	cb();
}

// BrowserSync Serve (init) and Reload tasks
// https://coder-coder.com/quick-guide-to-browsersync-gulp-4/
function browsersyncServe() {
	browsersync.init({
		proxy: "localhost:4000",
		ui: false,
		notify: false
	});
}

function browsersyncReload(cb) {
	browsersync.reload();
	cb();
}

// Watch Task
// now does both - production and development! slower but never forget prod before pushing
// website pulls right scripts and styles from the environment vars

// function watch(cb) {


// Old code - no browsersync
// gulp.watch(paths.scripts.srcWatch, gulp.series(scripts, scriptsDev, beepTask));
// gulp.watch(paths.styles.srcWatch, gulp.series(styles, stylesDev, beepTask));
// cb();
// };


// Build
// now does both - production and development! slower but never forget prod before pushing
// website pulls right scripts and styles from the environment vars

// var development = gulp.series(clean, copyIonicons, stylesDev, scriptsDev, beepTask, browsersyncServe, watch);
// var production =  gulp.series(clean, copyIonicons, styles,    scripts,    beepTask);

// https://www.npmjs.com/package/gulp

// https://gulpjs.com/docs/en/getting-started/creating-tasks
// Every task should be a function with callback

// BUILD

const build = gulp.series(clean, copyIonicons, cleanupSVG, styles, stylesDev, stylesComponents, stylesComponentsDev, scripts, scriptsDev, scriptsComponents, scriptsComponentsDev);

// WATCH

const initWatch = function (cb) {
	gulp.watch(paths.scripts.srcWatch, gulp.series(scripts, scriptsDev, beepTask));
	gulp.watch(paths.scriptsComponents.srcWatch, gulp.series(scriptsComponents, scriptsComponentsDev, beepTask));
	gulp.watch(paths.styles.srcWatch, gulp.series(styles, stylesDev, beepTask));
	gulp.watch(paths.stylesComponents.srcWatch, gulp.series(stylesComponents, stylesComponentsDev, beepTask));
	gulp.watch(paths.svg.srcWatch, gulp.series(cleanupSVG, beepTask));
	cb();
}

const watch = gulp.series(build, initWatch);

// SYNC

const sync = function () {
	browsersyncServe();
	gulp.watch(paths.htmls.srcWatch, gulp.series(beepTask, browsersyncReload));
	gulp.watch(paths.scripts.srcWatch, gulp.series(beepTask, scripts, scriptsDev, beepTask, browsersyncReload));
	gulp.watch(paths.scriptsComponents.srcWatch, gulp.series(beepTask, scriptsComponents, scriptsComponentsDev, beepTask, browsersyncReload));
	gulp.watch(paths.styles.srcWatch, gulp.series(beepTask, styles, stylesDev, beepTask, browsersyncReload));
	gulp.watch(paths.stylesComponents.srcWatch, gulp.series(beepTask, stylesComponents, stylesComponentsDev, beepTask, browsersyncReload));
}

exports.default = gulp.series(build, beepTask);
exports.build = gulp.series(build, beepTask);
exports.sync = sync;
exports.watch = gulp.series(watch, beepTask);
exports.clean = clean;

// exports.default = process.env.BUILD_TYPE=='production' ? production : development;