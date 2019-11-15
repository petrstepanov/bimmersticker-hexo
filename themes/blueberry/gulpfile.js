var browserify = require('browserify');
var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var del = require('del');

var paths = {
	styles: {
		src: ['./development/sass/app.scss',
			'./node_modules/noty/lib/noty.css',
			'./node_modules/noty/lib/themes/nest.css'],
		srcWatch: './development/sass/**/*.scss',
		dest: './source/css'
	},
	scripts: {
		entries: ['./src/js/app.js'],  // Only entry point for browserify
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
			'./development/js/modules/windshield-form.js',			
			'./development/js/modules/snipcart-button-attributes.js',		
			'./development/js/app.js'],
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
	return gulp.src(paths.scripts.src)
		.pipe(concat('app.js'))
		.pipe(uglify()).on('error', function (err) {
			console.log(err.toString());
		})
		.pipe(gulp.dest(paths.scripts.dest));
}

function scriptsDev() {
	return gulp.src(paths.scripts.src)
		.pipe(sourcemaps.init())
		.pipe(concat('app.js'))
		.pipe(sourcemaps.write())
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