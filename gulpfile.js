const { series, parallel, src, dest, watch } = require("gulp"),
  clean = require("gulp-clean"),
  gutil = require("gulp-util"),
  touch = require("gulp-touch-cmd"),
  fs = require("fs"),
  replace = require("gulp-replace"),
  filter = require("gulp-filter"),
  autoprefixer = require("autoprefixer"),
  cssnano = require("cssnano"),
  plugin = require("gulp-load-plugins")({ DEBUG: true });
var browsersync = require("browser-sync").create();

// Set path to Foundation files
const FOUNDATION = "node_modules/foundation-sites";

// Select Foundation components, remove components project will not use
const SOURCE = {
  scripts: [
    // Foundation core - needed if you want to use any of the components below
    //FOUNDATION + "/dist/js/plugins/foundation.core.js",
    //FOUNDATION + "/dist/js/plugins/foundation.util.*.js",

    // Pick the components you need in your project
    //FOUNDATION + "/dist/js/plugins/foundation.accordion.js",
    //FOUNDATION + "/dist/js/plugins/foundation.accordionMenu.js",
    //FOUNDATION + "/dist/js/plugins/foundation.drilldown.js",
    //FOUNDATION + "/dist/js/plugins/foundation.dropdown.js",
    //FOUNDATION + "/dist/js/plugins/foundation.dropdownMenu.js",
    //FOUNDATION + "/dist/js/plugins/foundation.interchange.js",
    //FOUNDATION + "/dist/js/plugins/foundation.offcanvas.js",
    //FOUNDATION + "/dist/js/plugins/foundation.responsiveMenu.js",
    //FOUNDATION + "/dist/js/plugins/foundation.responsiveToggle.js",
    //FOUNDATION + "/dist/js/plugins/foundation.reveal.js",
    //FOUNDATION + "/dist/js/plugins/foundation.sticky.js",
    // Place custom JS here, files will be concantonated, minified if ran with --production
    "assets/scripts/lib/**/*.js",
    "assets/scripts/**/*.js"
  ],

  // Scss files will be concantonated, minified if ran with --production
  styles: "assets/styles/scss/**/*.scss",

  // Images placed here will be optimized
  images: "assets/images/**/*",
  fonts: "assets/fonts/**/*",
  html: "*.html",
  xml: "*.xml"
};

const OUTPUT = {
  styles: "output/css/",
  scripts: "output/scripts/",
  images: "output/media/",
  fonts: "output/media/fonts",
  all: "output/"
};

const JSHINT_CONFIG = {
  node: true,
  globals: {
    document: true,
    window: true,
    jQuery: true,
    $: true,
    Foundation: true
  }
};

const packageJSON = JSON.parse(fs.readFileSync("./package.json"));

function scripts() {
  // Use a custom filter so we only lint custom JS
  const CUSTOMFILTER = filter(OUTPUT.scripts + "js/**/*.js", { restore: true });

  return src(SOURCE.scripts)
    .pipe(
      plugin.plumber(function(error) {
        gutil.log(gutil.colors.red(error.message));
        this.emit("end");
      })
    )
    .pipe(plugin.sourcemaps.init())
    .pipe(
      plugin.babel({
        presets: ["es2015"],
        compact: true,
        ignore: []
      })
    )
    .pipe(CUSTOMFILTER)
    .pipe(plugin.jshint(JSHINT_CONFIG))
    .pipe(plugin.jshint.reporter("jshint-stylish"))
    .pipe(CUSTOMFILTER.restore)
    .pipe(plugin.concat("app.js"))
    .pipe(plugin.uglify())
    .pipe(plugin.sourcemaps.write(".")) // Creates sourcemap for minified JS
    .pipe(dest(OUTPUT.scripts))
    .pipe(browsersync.stream())
    .pipe(touch());
}

function styles() {
  const cssPlugins = [
    autoprefixer({
      cascade: false
    }),
    cssnano({ safe: true, minifyFontValues: { removeQuotes: false } })
  ];

  return src(SOURCE.styles)
    .pipe(
      plugin.plumber(function(error) {
        gutil.log(gutil.colors.red(error.message));
        this.emit("end");
      })
    )
    .pipe(plugin.sourcemaps.init())
    .pipe(plugin.sass())
    .pipe(plugin.postcss(cssPlugins))
    .pipe(plugin.sourcemaps.write("."))
    .pipe(dest(OUTPUT.styles))
    .pipe(browsersync.stream())
    .pipe(touch());
}

function images() {
  return src(SOURCE.images)
    .pipe(plugin.imagemin())
    .pipe(dest(OUTPUT.images))
    .pipe(browsersync.stream())
    .pipe(touch());
}

function fonts() {
  return src(SOURCE.fonts)
    .pipe(dest(OUTPUT.fonts))
    .pipe(browsersync.stream())
    .pipe(touch());
}

function html() {
  return src("*.html")
    .pipe(dest(OUTPUT.all))
    .pipe(browsersync.stream())
    .pipe(touch());
}

function xml() {
  return src("*.xml")
    .pipe(replace("PPACKAGE", packageJSON.name))
    .pipe(replace("PVERSION", packageJSON.version))
    .pipe(replace("PDESCRIPTION", packageJSON.description))
    .pipe(replace("PNAME", packageJSON.cleanname))
    .pipe(dest(OUTPUT.all))
    .pipe(browsersync.stream())
    .pipe(touch());
}

function cleanOutput() {
  return src(OUTPUT.all, { read: false, allowEmpty: true }).pipe(
    clean({ force: true })
  );
}

function pack() {
  return src(OUTPUT.all + "**")
    .pipe(plugin.zip(packageJSON.name + ".wgt"))
    .pipe(dest(OUTPUT.all));
}

function watchDir() {
  watch(SOURCE.styles, parallel("styles"));
  watch(SOURCE.scripts, parallel("scripts"));
  watch(SOURCE.fonts, parallel("fonts"));
  watch(SOURCE.images, parallel("images"));
  watch(SOURCE.html, parallel("html"));
  watch(SOURCE.xml, parallel("xml"));
}

// Browser-Sync watch files and inject changes
function browserSync(done) {
  // Watch these files
  var files = [SOURCE.html];

  browsersync.init(files, {
    server: {
      baseDir: "./output/"
    }
  });

  watch(SOURCE.styles, parallel("styles")).on("change", browsersync.reload);
  watch(SOURCE.scripts, parallel("scripts")).on("change", browsersync.reload);
  watch(SOURCE.images, parallel("images")).on("change", browsersync.reload);
  watch(SOURCE.html, parallel("html")).on("change", browsersync.reload);
  watch(SOURCE.xml, parallel("xml")).on("change", browsersync.reload);

  done();
}

function browserSyncReload(done) {
  browsersync.reload();
  done();
}

const buildProj = series(
  cleanOutput,
  parallel(html, xml, fonts, images, styles, scripts),
  pack
);

const watchTask = series(buildProj, parallel(watchDir, browserSync));

exports.default = buildProj;
exports.images = images;
exports.fonts = fonts;
exports.xml = xml;
exports.html = html;
exports.scripts = scripts;
exports.styles = styles;
exports.watchDir = watchTask;
