var _ = require("lodash");

module.exports = {
    //
    init: (req, res, next) => {
        // Init locals
        res.locals = {
            _: _,
            db: req.db,
            nav: _.sortBy(_.union(req.db.get("content").filter(item => item.nav).cloneDeep().value(), req.db.get("nav").cloneDeep().value()), ["order", "id", "title"])
        }

        next();
    },

    //
    render: (req, res, next) => {
        // Estimate current nav node
        _.each(res.locals.nav, node => {
            node.active = node.id == (res.node || res.view);
        })

        // Render view?
        if (res.view) {
            res.render(res.view, res.locals);
        } else {
            next();
        }
    },

    // 
    http404: (req, res) => {
        res.status(404).send("Resource not found: " + req.url);
    },

    //
    routes: {
        admin: require("./admin/routes"),

        //
        default: app => app.get("/:id", (req, res, next) => {
            // View already set?
            if (res.view) {
                return next();
            }

            // Query content by id
            var content = req.db.get("content").find({
                id: req.params.id
            }).value();

            // Set active nav node
            res.node = (content && content.node) || req.params.id;

            // If content, apply it to locales
            if (content) {
                res.locals.content = content;
                res.view = content.view || content.type;
            }

            // Next
            next();
        }),

        //
        home: app => app.get("/", (req, res) => {
            // Query home node
            var home = req.db.get("content").find({
                home: true
            }).value();

            // Redirect to home node
            res.redirect("/" + ((home && home.id) || "home"));
        })
    }
}
