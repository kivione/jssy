var path = require("path");
var pug = require("pug");
var express = require("express");

module.exports = app => {
    var router = express.Router();

    router.use("/", (req, res, next) => {
        res.renderAdmin = (file, params) => {
            res.setHeader("Content-Type", "text/html");
            res.write(pug.renderFile(path.join(__dirname, "../../web/views/" + file + ".pug"), params));
            res.end();
        }

        next();
    })

    router.get("/", (req, res) => {
        res.send("/ ADMIN!")
    }).get("/test", (req, res) => {
        res.renderAdmin("admin", {
            name: "test"
        });
    }).get("/login", (req, res) => {
        res.renderAdmin("login");
    })

    app.use("/admin", router);
}
