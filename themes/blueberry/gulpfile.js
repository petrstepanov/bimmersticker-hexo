var browserify = require('browserify');
var gulp = require('gulp');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass')(require('sass'));
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
		srcWatch: './development/**/*.scss',
		dest: './source/css'
	},
	scripts: {
		src: ['./development/js/app.js'],  // Only entry point for browserify
		srcWatch: './development/**/*.js',
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
		.pipe(replace('<svg', '<svg width="512" height="512"'))
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
		.pipe(rename(function (path) {
			// Updates the object in-place
			// path.dirname += "/ciao";
			path.basename += "-dev";
			//path.extname = ".md";
		  }))
		.pipe(gulp.dest(paths.styles.dest)); //.on('end', function () { beep(); });
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
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(paths.scripts.dest)); //.on('end', function () { beep(); });
}


// Beep task (with callback)
function beepTask(cb) {
	console.log('\x07');
	cb();
}

// BrowserSync Serve (init) and Reload tasks
// https://coder-coder.com/quick-guide-to-browsersync-gulp-4/
function browsersyncServe(){
	browsersync.init({
		proxy: "localhost:4000",
		ui: false,
		notify:false
	});
}

function browsersyncReload(cb){
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

// var development = gulp.series(clean, copyIcons, stylesDev, scriptsDev, beepTask, browsersyncServe, watch);
// var production =  gulp.series(clean, copyIcons, styles,    scripts,    beepTask);

// https://www.npmjs.com/package/gulp

var build = gulp.series(clean, copyIcons, styles, stylesDev, scripts, scriptsDev);

function watch(){
	gulp.series(clean, copyIcons, styles, stylesDev, scripts, scriptsDev, beepTask, browsersyncServe);
	browsersyncServe();

	gulp.watch(paths.htmls.srcWatch, gulp.series(beepTask, browsersyncReload));
	gulp.watch(paths.scripts.srcWatch, gulp.series(beepTask, scripts, scriptsDev, beepTask, browsersyncReload));
	gulp.watch(paths.styles.srcWatch, gulp.series(beepTask, styles, stylesDev, beepTask, browsersyncReload));
}

exports.default = build;
exports.build = build;
exports.watch = watch;

// exports.default = process.env.BUILD_TYPE=='production' ? production : development;