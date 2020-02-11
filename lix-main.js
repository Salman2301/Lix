/*
 * Copyright (c) 2020- David Fajardo
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

const child_process = require("child_process"),
  exec = child_process.exec;
const os = require("os");
const find = require("./shelljs-master/src/find.js");

//-----------FUNCTIONS---------------
const projects = () => {
  return require("./projects.json");
};

function autoscan(dir_to_scan) {
  return find(dir_to_scan)
    .filter(
      o =>
        o.endsWith(".corvid") &&
        o.indexOf(".corvid") === o.lastIndexOf(".corvid") &&
        o.split("/.corvid") !== os.homedir()
    )
    .map(o => {
      o = o.split("/.corvid")[0];
      return {
        location: o,
        name: o.split("/").pop(),
        updated: new Date().toJSON()
      };
    });
}

async function write(file, callback) {
  await shell.echo(JSON.stringify(file)).to("projects.json");
  if (callback.func)
    return callback.arg ? callback.func(callback.arg) : callback.func();
  return;
}

//---------------CLASS DEFINITIONS------------------
class Lix {
  constructor() {
    this.isInit = projects()["init"] !== "false";

    this.init = function(callback) {
      let init_project = {};
      init_project["init"] = "true";
      init_project["os"] = os.platform();
      init_project["dirs"] = { main: os.homedir() };
      init_project["created"] = new Date().toJSON();
      init_project["updated"] = new Date().toJSON();
      init_project["projects"] = [...new Set([...autoscan(os.homedir())])];

      return write(init_project, {
        func: callback,
        arg: init_project["projects"]
      });
    };

    if (!this.isInit) return false;

    this.os = projects()["os"];
    let cloned_projects = JSON.parse(JSON.stringify(projects()));

    this.projects = projects()["projects"];

    this.dirs = projects()["dirs"];
    this.dir = this.dirs["main"];

    this.scan = async function(dir, callback) {
      const scanned = await autoscan(dir);
      return callback(scanned);
    };

    this.get = function(id) {
      return parseInt(id)
        ? this.projects[id]["location"]
        : this.projects.filter(o => o["name"] === id)[0].location;
    };

    this.appendDir = function(location) {
      const new_dir = {
        location: location,
        name: location.split("/").pop()
      };

      cloned_projects["updated"] = new Date().toJSON();
      cloned_projects["dirs"] = new Set(this.dirs);
      cloned_projects["dirs"][new_dir.name] = new_dir.location;

      return write(cloned_projects, { func: () => {} });
    };

    this.rmDir = function(name) {
      const rm_dir =
        this.dirs[name] ||
        Object.values(this.dirs).filter(directory => directory === name)[0];

      cloned_projects["projects"] = new Set(this.dirs).delete(
        this.dirs[rm_dir]
      );

      return write(cloned_projects, { func: () => {} });
    };
  }
}

class Project extends Lix {
  constructor(id) {
    super();

    this.create = function(url, dir, opts) {
      const path = `${dir || "."}/${id}`;
      exec(`mkdir ${path}`, () => {
        exec(`cd ${path} && npm init -y`, () => {
          if (!opts.auto) {
            console.log(`${id} is now at ${path}`);
            return process.exit(0);
          }

          let args = `npx corvid clone ${url}`;
          if (opts.debug) args += " --debug";
          try {
            exec(args, { cwd: path }, () => {
              return this(id).open();
            });
          } catch (e) {
            console.error(e);
            throw e;
          }
        });
      });
    };

    this.open = async function(callback) {
      let project = await this.get(id);
      exec("npx corvid open-editor", { cwd: project }, () => {
        callback();
      });
    };

    this.append = function() {
      const new_project = JSON.stringify({
        location: id,
        name: id.split("/").pop(),
        updated: new Date().toJSON()
      });

      cloned_projects["updated"] = new Date().toJSON();
      cloned_projects["projects"] = [
        ...new Set(this.projects).add(new_project)
      ];

      return write(cloned_projects, { func: () => {} });
    };

    this.delete = function() {
      const rm_dir = this.projects.filter(o => o.location === id)[0];
      cloned_projects["projects"] = [...new Set(this.projects).delete(rm_dir)];

      return write(cloned_projects, { func: () => {} });
    };
  }
}

//-------------EXPORTS----------------
const $lx = new Lix(),
  $px = arg => {
    return new Project(arg);
  };

module.exports = {
  $lx,
  $px
};
