// Init
var gulp = require("gulp");

// Plugins
var colors = require("colors");
var less = require("gulp-less");
var merge = require("streamqueue");
var concat = require("gulp-concat");
var templateCache = require("gulp-angular-templatecache");

// Compile less
gulp.task("less", () =>
    gulp
    .src("less/**/*.less")
    .pipe(concat("jssy.less"))
    .pipe(less())
    .pipe(gulp.dest("./build/css")))

// Build static resources
gulp.task("resources", () =>
    gulp
    .src("src/web/resources/**/*")
    .pipe(gulp.dest("./build")))

// Build Javascript and Angular Template Cache
gulp.task("app", () => {
    return merge({
                objectMode: true
            },
            // Merge js libraries
            gulp.src("web/lib/**/*.js"),
            // Merge Angular templates
            gulp.src("web/app/**/*.html").pipe(templateCache("app.templates.js", {
                standalone: true
            })),
            // Merge Angular app
            gulp.src("web/app/**/*.js"))
        // Merge all js files to bundle
        .pipe(concat("jssy.js", {
            newLine: "\n;"
        }))
        // Save it to js/ directory
        .pipe(gulp.dest("build/js"));
})

// Watch Files For Changes
gulp.task("watch", () => {
    gulp.watch("web/app/**/*", ["app"]);
    gulp.watch("web/resources/**/*", ["resources"]);
    gulp.watch("less/**/*.less", ["less"]);
    gulp.watch("lib/**/*", []);
})

// Default Task (Build and start Webserver)
gulp.task("dev", ["default", "watch"], () => {
    service.start();
})

// Default Task
gulp.task("default", ["less", "resources", "app"]);

/*
 * Service controller (dev)
 */
var spawn = require("child_process").spawn;
var service = {
    node: null,
    start: function() {
        // Stop if running
        this.stop();

        // Start it
        this.node = spawn("node", ["test/dev/dev"], {
            stdio: "inherit"
        })

        this.node.on("close", function(code) {
            if (code) {
                log("App crashed".red);
            }
        })

        log("App started".green);
    },
    stop: function() {
        // If running, stop it
        if (this.node) {
            this.node.kill();
            this.node = null;
            log("App stopped".yellow);
        }
    }
}

// Log helper
function log(msg) {
    console.log("[" + new Date().toString().split(" ")[4].gray + "]", msg);
}
