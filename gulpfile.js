const gulp = require("gulp");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const cssdeclsort = require("css-declaration-sorter");
const mmq = require("gulp-merge-media-queries");
const autoprefixer = require("autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const packageImporter = require("node-sass-package-importer");
const sassGlob = require("gulp-sass-glob");

//Sass
gulp.task("sass", function () {
  gulp
    .src(["sass/**/*.scss"])
    .pipe(
      plumber({
        errorHandler: notify.onError("Error: <%= error.message %>")
      })
    )
    .pipe(sourcemaps.init()) //map生成
    .pipe(
      sass({
        outputStyle: "expanded"
      })
    )
    .pipe(sassGlob())
    .pipe(
      postcss([
        autoprefixer({
          // ☆IEは11以上、Androidは4.4以上
          // その他は最新2バージョンで必要なベンダープレフィックスを付与する設定
          browsers: ["last 2 versions", "ie >= 11", "Android >= 4"],
          cascade: false
        })
      ])
    )
    .pipe(
      postcss([
        cssdeclsort({
          order: "smacss"
        })
      ])
    )
    .pipe(mmq())
    .pipe(
      sass({
        importer: packageImporter({
          extensions: [".scss", ".css"]
        })
      })
    )
    .pipe(sourcemaps.write("../maps")) //cssの格納される一個上の階層にmapのファイル追加
    .pipe(gulp.dest("css"));
});

//Bootstrap
gulp.task('bootstrap', function () {
  gulp.src(['sass/scss/bootstrap.scss'])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('css'));
});

//JS
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
gulp.task("js", function () {
  gulp.src('js/**/*.js')
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dest/js'));
});

//img
const imagemin = require("gulp-imagemin");
const pngquant = require("imagemin-pngquant"); // 圧縮率を高めるのにプラグインを入れる png
const mozjpeg = require("imagemin-mozjpeg"); // 圧縮率を高めるのにプラグインを入れる jpg
const changed = require("gulp-changed");
const svgo = require('imagemin-svgo');
const gifsicle = require('imagemin-gifsicle');
gulp.task("img", function () {
  gulp
    .src("img/**/*.+(jpg|jpeg|png|gif|svg)")
    .pipe(changed("img/**/*.+(jpg|jpeg|png|gif|svg)"))
    .pipe(imagemin([pngquant(), mozjpeg(), svgo(), gifsicle()]))
    .pipe(gulp.dest("dest/img"));
});

//browser sync
const browserSync = require("browser-sync");
gulp.task("browser-sync", () => {
  browserSync({
    server: {
      baseDir: "./",
      index: "index.html"
    }
  });
});

//デフォルト
gulp.task("default", ["sass", "js", "img", "browser-sync", "bootstrap"], () => {
  gulp.watch("sass/**/*.scss", ["sass"]);
  gulp.watch('sass/scss/bootstrap.scss', ["bootstrap"]);
  gulp.watch("js/**/*.js", ["js"]);
  gulp.watch("img/**/*.+(jpg|jpeg|png|gif|svg)", ["img"]);
  gulp.watch("*.html").on("change", browserSync.reload);
  gulp.watch("css/style.css").on("change", browserSync.reload);
  gulp.watch("js/**/*.js").on("change", browserSync.reload);
});