const gulp = require('gulp');

const GLSL_SRC_FILES = [
	'../app/shaders/*.glsl',
	'../app/shaders/**/*.glsl',
];
const GLSL_BUILD_FOLDER = '../build/assets/shaders';


gulp.task('build:glsl', function() {
	return gulp.src(GLSL_SRC_FILES)
		.pipe(gulp.dest(GLSL_BUILD_FOLDER));
});

gulp.task('watch:glsl', ['build:glsl'], function() {
	gulp.watch(GLSL_SRC_FILES, ['build:glsl']);
});
