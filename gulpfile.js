var gulp 					= require('gulp'),
		gutil 				= require('gulp-util'),
		sass 					= require('gulp-sass'),
		browserSync 	= require('browser-sync'),
		concat 				= require('gulp-concat'),
		uglify 				= require('gulp-uglify'),
		cleanCss 			= require('gulp-clean-css'),
		rename 				= require('gulp-rename'),
		del 					= require('del'),
		imagemin 			= require('gulp-imagemin'),
		svgmin				= require('gulp-svgmin'),
		cache					= require('gulp-cache'),
		groupMedia		= require('gulp-group-css-media-queries'),
		autoprefixer 	= require('gulp-autoprefixer'),
		ftp						= require('vinyl-ftp'),
		notify				= require('gulp-notify');

//Project scripts

gulp.task('js', function() {
	return gulp.src([
		'app/js/',
		])
	.pipe(concat('scripts.min.js'))
	//.pipe(uglify()) minimize all js files. 
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
	});
});

gulp.task('sass', function() {
	return gulp.src('app/sass/**/*.scss')
	.pipe(sass().on('error', notify.onError()))
	.pipe(rename({suffix: '.min', prefix: ''}))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleanCss())
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.scss', ['sass']);
	gulp.watch(['libs/**/*.js'], ['js']);
	gulp.watch('app/*.html', browserSync.reload);
});

gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin()))
	.pipe(gulp.dest('dist/img')); 
});

gulp.task('svgmin', function() {
	return gulp.src('app/img/**/*.svg')
	.pipe(svgmin())
	.pipe(gulp.dest('dist/img/svg'));
});

gulp.task('build', ['removedist', 'imagemin','svgmin','sass', 'js'], function() {

	var buildFiles = gulp.src([
		'app/*.html',
		'app/.htaccess',
		]).pipe(gulp.dest('dist'));

	var buildCss = gulp.src([
		'app/css/main.min.css',
		])
		.pipe(groupMedia())
		.pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src([
		'app/js/scripts.min.js',
		]).pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src([
		'app/fonts/**/*',
		]).pipe(gulp.dest('dist/fonts'));

});

gulp.task('deploy', function() {

	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);