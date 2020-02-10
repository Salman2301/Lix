const shell = require("shelljs");

const projects = dir_to_scan =>
  shell
    .find(dir_to_scan)
    .filter(
      o =>
        o.endsWith(".corvid") &&
        o.indexOf(".corvid") === o.lastIndexOf(".corvid")
    )
    .map(o => {
      o = o.split("/.corvid")[0];
      return JSON.stringify({
        location: o,
        name: o.split("/").pop(),
        "date added": new Date()
      });
    });

module.exports = projects;
