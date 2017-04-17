var path = require("path");
var pug = require("pug");
var express = require("express");

module.exports = app => {
    var router = express.Router();

    router.use("/", (req, res, next) => {
        res.renderAdmin = (file, params) => {
            res.setHeader("Content-Type", "text/html");
            res.write(pug.renderFile(file, params));
            res.end();
        }

        console.log(".");
        next();
    })

    router.get("/", (req, res) => {
        //console.log(req.url);
        res.send("/ ADMIN!")
    }).get("/test", (req, res) => {
        ///console.log(req.url, req.db.value().content);
        // res.render(path.join(__dirname, "views/admin.pug"));
        res.renderAdmin(path.join(__dirname, "views/admin.pug"), {
            name: "test"
        });
    })

    app.use("/admin", router);
}
