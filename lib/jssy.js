var fs = require("fs");
var _ = require("lodash");
var path = require("path");
var lowdb = require("lowdb");
var assert = require("assert");
var express = require("express");

// Init express app
var app = express();

// Create service instance
var jssy = {};

// Load default middleware catalog
var middleware = require("./middleware");

// Init model
jssy.model = {
    routes: [],
    middlewares: []
}

// 
jssy.init = options => {
    // Init options
    jssy.options = _.extend({}, options);

    // Asserts
    assert(jssy.options.db);

    // Init db
    jssy.db = lowdb(jssy.options.db);

    // Init default middleware
    jssy.pre("init", express.static(path.join(__dirname, "admin/public")));
    jssy.pre("init", express.static(jssy.options.public || "public"));
    jssy.pre("init", (req, res, next) => {
        req.db = jssy.db;
        next();
    })

    // Init default middleware
    jssy.in("init", middleware.init);
    jssy.in("render", middleware.render);
    jssy.in("error", jssy.options.http404 || middleware.http404);
}

// 
jssy.routes = (fn) => jssy.model.routes.push(fn);

// 
jssy.in = (type, fn) => jssy.middleware(type, fn, "in");

// 
jssy.pre = (type, fn) => jssy.middleware(type, fn, "pre");

// 
jssy.post = (type, fn) => jssy.middleware(type, fn, "post");

// 
jssy.middleware = (type, fn, step) => jssy.model.middlewares.push({
    step: step || "in",
    type: type,
    fn: fn
})

// 
jssy.build = (type, spec) => {
    // Build steps array
    var steps = spec ? [spec] : ["pre", "in", "post"];

    // Query middlewares for this type and step
    _.each(steps, step => _.each(jssy.model.middlewares, middleware => {
        if (middleware.type == type && middleware.step == step) {
            app.use(middleware.fn);
        }
    }))
}

//
jssy.import = dir => {
    // Scan given directory for files
    _.each(fs.readdirSync(dir), file => {
        var filename = path.join(dir, file);
        var slug = path.basename(filename, path.extname(file));
        if (fs.statSync(filename).isFile()) {
            jssy.routes(app => app.get("/" + slug, (req, res, next) => {
                res.view = filename;
                next();
            }))
        }
    })
}

// 
jssy.start = cb => {
    // Configure app
    app.set("views", jssy.options.views || "views");
    app.set("view engine", jssy.options.viewEngine || "pug");

    // Build 'init' middlewares
    jssy.build("init");

    // Build 'init' middlewares
    jssy.build("routes", "pre");
    _.each(jssy.model.routes, fn => fn(app));
    _.each(middleware.routes, fn => fn(app));
    jssy.build("routes", "post");

    // Build 'init' middlewares
    jssy.build("render");

    // Build 'init' middlewares
    jssy.build("error");

    // Start server
    app.listen(jssy.options.port || process.env.PORT || 3000, cb);
}

// Return service instance
module.exports = jssy;
