var gulp = require('gulp'),
    coffee = require('gulp-coffee'),
    webserver = require('gulp-webserver'),
    gutil = require('gulp-util');

log = function log(err) {
  if(err.name && err.message) {
    console.log('[ERROR]', err.name);
    console.log(err.message);
    console.log(err.stack);
  }
  else if(typeof err === 'object'){
    for(var key in err) {
      console.log(key, err[key]);
    }
  }
  else {
    console.log(err.toString());
  }
};

gulp.task('coffee', function() {
  gulp.src('src/*.coffee')
      .pipe(coffee().on('error', log))
      .pipe(gulp.dest('js'));
});

gulp.task('server', function() {
  gulp.src('./')
      .pipe(webserver({
        livereload: {
          enable: true,
          filter: function(name) { return !name.match(/\.(coffee)$/); }
        }
      }));
});

gulp.task('watch', function() {
  gulp.watch('src/*.coffee', ['coffee']);
});

gulp.task('default', ['coffee', 'server', 'watch']);
