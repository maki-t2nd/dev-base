var gulp      = require('gulp')
, webserver   = require('gulp-webserver')
, jade        = require('gulp-jade')
, compass     = require('gulp-compass')
, prefix      = require('gulp-autoprefixer')
, rimraf      = require('gulp-rimraf')
, plumber     = require('gulp-plumber')
, pngmin      = require('gulp-pngmin')
, runSequence = require('run-sequence');

var src = 'src',
    dest = 'dest';

var path = {
  'jade': src + '/**/[a-zA-Z0-9]*.jade',
  'wjade': src + '/**/*.jade',
  'sass': src + '/**/[a-zA-Z0-9]*.scss',
  'wsass': src + '/**/*.scss',
  'images': src + '/images/**/*',
  'js': [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/jquery-easing-original/jquery.easing.1.3.js',
    src + '/js/**/*.js'
  ],
  'docs': src + '/**/*.{html,php,txt,pdf,doc}'
}

var config = require('./config.json');
var dev = true;
var style;

if(dev){
  style = 'expanded';
} else {
  style = 'compressed';
}

// サーバー
gulp.task('server', function() {
  return gulp.src(dest)
  .pipe(webserver({
    host: '0.0.0.0',
    livereload: true
  }));
});

// html生成
gulp.task('jade', function() {
  return gulp.src(path.jade)
  .pipe(plumber())
  .pipe(jade({
    pretty: true,
    basedir: src,
    locals: config
  }))
  .pipe(gulp.dest(dest));
});

// css生成
gulp.task('compass', function() {
  return gulp.src(path.sass)
  .pipe(plumber())
  .pipe(compass({
    config_file: 'src/config.rb',
    project: __dirname,
    style: style,
    css: dest + '/css/',
    sass: src + '/sass/',
    image: dest + '/images/',
    import_path: ['bower_components']
  }))
  .pipe(prefix('last 2 version', 'ie 9', 'ie 8', 'ie 7'))
  .pipe(gulp.dest(dest));
});

// jsコピー
gulp.task('js', function() {
  return gulp.src(path.js)
  .pipe(gulp.dest(dest + '/js'));
});

// imgコピー
gulp.task('images', function() {
  return gulp.src(path.images)
  .pipe(gulp.dest(dest + '/images/'));
});

// その他コピー
gulp.task('copy', function() {
  return gulp.src(path.docs)
  .pipe(gulp.dest(dest));
});

// png最適化
gulp.task('pngmin', function() {
  return gulp.src(dest + '/**/*.png')
  .pipe(pngmin())
  .pipe(gulp.dest(dest));
});

// dest削除
gulp.task('clean', function() {
  return gulp.src(dest)
  .pipe(rimraf());
});

// 監視
gulp.task('watch', function() {
  gulp.watch(path.wjade, ['jade']);
  gulp.watch(path.wsass, ['compass']);
  gulp.watch(path.images, ['images']);
  gulp.watch(path.js, ['js']);
  gulp.watch(path.docs, ['copy']);
});


gulp.task('default', function() {});

gulp.task('dev', function() {
  runSequence('clean', ['jade', 'js', 'images', 'copy'], 'compass', ['watch', 'server']);
});

gulp.task('build', function() {
  runSequence('clean', ['jade', 'js', 'images', 'copy'], 'compass', 'pngmin');
});