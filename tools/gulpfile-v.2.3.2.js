const gulp = require('gulp'),
  fs = require('fs'),
  cssnano = require('cssnano'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  browserSync = require('browser-sync'),
  plumber = require('gulp-plumber'),
  nunjucks = require('gulp-nunjucks-render'),
  sass = require('gulp-sass'),
  ejs = require('gulp-ejs'),
  pug = require('gulp-pug'),
  argv = require('yargs').argv,
  mqpacker = require('css-mqpacker'),
  htmlmin = require('gulp-htmlmin'),
  gulpEdge = require('gulp-edgejs');

let configs, css_path, dev_path, _struct
let name = `../${argv.n}`,
  checkInfo = fs.exists(`${name}/info.json`),
  isPlugin = [
    mqpacker({
      sort: true
    }),
    autoprefixer({
      browsers: [
        'last 3 versions',
        'iOS >= 8',
        'Safari >= 8',
        'ie 11',
      ]
    })
  ]


if (checkInfo === false) {
  _log('info.json not exist! \n Please run Task "yarn inis" ');

  gulp.src(`./info.json`)
    .pipe(gulp.dest(name));

  _log(`
        ==========================================
            Info.json created!
            Please re-config value in info.json
        ==========================================
        `)
}
configs = JSON.parse(fs.readFileSync(`${name}/info.json`))
css_path = `${name}/${configs.path_static}/${configs.css_path}`
dev_path = `${name}/${configs.dev_path}`
_struct = [{
  in: './_resource/css/*.*',
  to: `${css_path}/`
},
{
  in: './_resource/inc/*.*',
  to: `${css_path}/inc/`
},
{
  in: './_resource/js/*.js',
  to: `${name}/${configs.path_static}/js/`
},
{
  in: './_resource/fonts/*.*',
  to: `${name}/${configs.path_static}/fonts/`
},
{
  in: './_resource/images/*.*',
  to: `${name}/${configs.path_static}/images/`
},
{
  in: `./_resource/dev/${configs.engine}/*.*`,
  to: `${dev_path}/`
},
{
  in: `./_resource/dev/${configs.engine}/layout/*.*`,
  to: `${dev_path}/layout/`
},
{
  in: `./_resource/dev/${configs.engine}/components/*.*`,
  to: `${dev_path}/components/`
}
]
if (configs.minify) {
  isPlugin.push(cssnano())
}

/**
 * Compile framework for myself
 */
gulp.task('fw', () => {
  gulp.src(`./_resource/*.scss`)
    .pipe(
      plumber({
        errorHandler: function (error) {
          console.log(error.toString());
          this.emit('end');
        }
      })
    )
    .pipe(sass())
    .pipe(gulp.dest('./_resource/static/css'))
    .pipe(
      postcss([
        mqpacker({
          sort: true
        }),
        autoprefixer({
          browsers: [
            'last 3 versions',
            'iOS >= 8',
            'Safari >= 8',
            'ie 11',
          ]
        }),
        cssnano()
      ])
    )
    .pipe(gulp.dest('./_resource/css'))
});

/**
 * Make new Project
 * Copy File Project
 */
gulp.task('copy', () => {
  for (let _str of _struct) {
    _log(`${_str.in} -> ${_str.to}`)
    gulp.src(`./_resource/${_str.in}`)
      .pipe(gulp.dest(_str.to))
      .pipe(
        plumber({
          errorHandler: function (error) {
            console.log(error.toString());
            this.emit('end');
          }
        })
      );
  }
})

// #region CSS Taks
/**
 * CSS Compiler
 */
gulp.task('scss', () => {
  gulp.src(`${css_path}/*.scss`)
    .pipe(
      plumber({
        errorHandler: function (error) {
          console.log(error.toString());
          this.emit('end');
        }
      })
    )
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(gulp.dest(css_path))
    .pipe(
      postcss(isPlugin)
    )
    .pipe(gulp.dest(css_path))
})

/**
 * Watch SCSS Change & Precompile
 */

gulp.task('watch-scss', () => {
  gulp.watch([`${css_path}/*.scss`, `${css_path}/**/*.scss`],
    function () {
      gulp.run('scss');
    });
})

// #endregion CSS Taks

// #region Engine

/**
 * Engine Compile
 * Support: EJS, PUG, NUNJUCKS
 */
gulp.task('engine', () => {
  if (configs.engine === 'nunjucks') {
    gulp.src(`${dev_path}/*.${configs.ext}`)
      .pipe(nunjucks({
        path: [`${dev_path}/`],
        ext: '.html',
        data: {
          css_path: `./${configs.path_static}/css`,
          js_path: `./${configs.path_static}/js`,
          img_path: `./${configs.path_static}/images`
        }
      }))
      .pipe(
        plumber({
          errorHandler: function (error) {
            console.log(error.toString());
            this.emit('end');
          }
        })
      )
      .pipe(gulp.dest(`${name}`));
  }

  if (configs.engine === 'ejs') {
    gulp.src(`${dev_path}/*.${configs.ext}`)
      .pipe(ejs({}, {}, {
        ext: '.html'
      })).pipe(
        plumber({
          errorHandler: function (error) {
            console.log(error.toString());
            this.emit('end');
          }
        })
      )
      .pipe(gulp.dest(`${name}`));
  }
  if (configs.engine === 'edge') {
    gulp.src(`${dev_path}/*.${configs.ext}`)
      .pipe(gulpEdge({}, {
        ext: "html"
      })).pipe(
        plumber({
          errorHandler: function (error) {
            console.log(error.toString());
            this.emit('end');
          }
        })
      )
      .pipe(gulp.dest(`${name}`));
  }

  if (configs.engine === 'pug') {
    gulp.src(`${dev_path}/*.${configs.ext}`)
      .pipe(pug({
        pretty: true
      })).pipe(
        plumber({
          errorHandler: function (error) {
            console.log(error.toString());
            this.emit('end');
          }
        })
      )
      .pipe(gulp.dest(`${name}`));
  }
})

gulp.task('minfyHTML', () => {
  gulp.src(`${name}/*.html`)
    .pipe(htmlmin({
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
    }))
    .pipe(gulp.dest(`${name}`));
})

/**
 * Watch Change Template & Precompile
 */

gulp.task('watch-template', () => {
  gulp.watch([
    `${dev_path}/*.${configs.ext}`,
    `${dev_path}/**/*.${configs.ext}`
  ],
    function () {
      gulp.run('engine');
    }
  );
})

// #endregion Engine

// #region Server Loading
gulp.task('reload', () => {
  gulp.watch([
    `${css_path}/style.css`,
    `${name}/*.html`
  ]).on('change', browserSync.reload);
})

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: name
    }
  });
  gulp.run('reload')
});
// #endregion Server Loading

/**
 * Function Lib
 */

function errorHand(data) {
  console.log(data.toString());
  this.emit('end');
}

function prettyForHTML() {
  gulp.src(`${name}/*.${configs.ext}`)
    .pipe(prettyHtml())
    .pipe(gulp.dest(`${name}`));
}

function _log(msg) {
  console.log(msg)
}
