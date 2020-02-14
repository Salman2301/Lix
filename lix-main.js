/*
 * Copyright (c) 2020- David Fajardo
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

const child_process = require("child_process"),
  spawn = child_process.spawn,
  exec = child_process.exec; //using child_process native node module, since it probably loads faster than shelljs version
//keep in mind child_process also has spawn, which can be used to capture/handle data stream

const shell = require("shelljs");

//commands for opening a new terminal window. Can be overridden by changing config.terminal
const terminal = {
  linux: `gnome-terminal`,
  win: `start powershell -WorkingDirectory`,
  darwin: `open -n /Applications/Utilities/Terminal.app`
};

//-----------FUNCTIONS---------------
function projects() {
  return require("./projects.json"); //morphing this into a function means it captures any and all changes to json
}

function autoscan(dir_to_scan) {
  //10x faster parsing with ls -R over find!!
  return shell
    .ls("-R", dir_to_scan)
    .filter(
      o =>
        o.split("src/")[1] && o.split("src/")[1].endsWith("corvid-package.json")
    )
    .map(o => {
      o = o.split("/src/corvid-package.json")[0];
      return {
        location: `${absolute_path(dir_to_scan)}/${o}`.replace("//", "/"), //***IMPORTANT: json structure of the project item that is watched. Changes made here must be made throughout the rest of this script.***
        name: o.split("/").pop(),
        updated: new Date().toJSON()
      };
    });
}

function absolute_path(dir) {
  //gets absolute path of file given relative path
  const home_path = process.env.HOME.split("/").filter(o => o),
    deconst_dir = dir.split("/").filter(o => o);

  return `${process.env.HOME}/${deconst_dir
    .filter((o, ix) => o !== home_path[ix])
    .join("/")}`;
}

function subdirs(project_path, open) {
  project_path += project_path.endsWith("/") ? "" : "/";

  const valid = {
    pages: { path: "src/pages", type: "js" },
    backend: { path: "src/backend", type: "any" },
    public: { path: "src/public", type: "any" },
    lightboxes: { path: "src/lightboxes", type: "js" },
    search: function(prop) {
      const rel_path = project_path + this[prop].path,
        _path_ = absolute_path(rel_path);

      return shell
        .ls("-R", _path_)
        .filter(o =>
          !o.match(/\^*(tsconfig|authorization-config).json$/) &&
          this[prop].type === "any"
            ? o
            : this[prop].type === o.split(".").pop()
        )
        .map(o => {
          const opath = JSON.stringify(_path_ + "/" + o);
          return open
            ? opath
            : {
                path: opath,
                name: o.split(".")[0]
              };
        });
    }
  };

  return open
    ? Object.keys(valid)
        .filter(o => o !== "search")
        .map(o => {
          return valid.search(o).join(" ");
        })
        .join(" ")
    : Object.keys(valid)
        .filter(o => o !== "search")
        .map(o => {
          return valid.search(o);
        });
}

async function revert(snapshot, callback) {
  // DEBUG: totally untested
  const snap_dir = absolute_path(snapshot),
    main_dir = snap_dir.replace(".corvid/snapshots", "src"),
    cp_dir = snap_dir.replace(
      ".corvid/snapshots",
      `replaced ${snap_dir.split("/").pop()}`
    );

  const copied = await shell.cp("-rf", main_dir, cp_dir);
  if (copied.stderr)
    throw new Error(
      `Lix-main.js: Error reverting ${snapshot} at backup process`
    );

  const removed = await shell.rm("-rf", main_dir);
  if (removed.stderr)
    throw new Error(`Lix-main.js: Error reverting ${snapshot} at rm process`);

  const migrated = await shell.cp("-rf", snap_dir, main_dir);
  if (migrated.stderr)
    throw new Error(
      `Lix-main.js: Error reverting ${snapshot} at migration process`
    );

  const purged = await shell.rm("-rf", snap_dir);
  if (removed.stderr)
    throw new Error(
      `Lix-main.js: Error reverting ${snapshot} at purge process`
    );

  return callback(`${snapshot} reverted successfully.`);
}

async function write(file, callback) {
  //rewrites json file with requested changes, not exported from module
  await shell.echo(JSON.stringify(file)).to("projects.json");
  if (callback.func)
    return callback.arg ? callback.func(callback.arg) : callback.func();
  return;
}

//---------------CLASS DEFINITIONS------------------
class Lix {
  constructor() {
    this.isInit = projects().init !== "false"; //for rn setting init to false also means erasing the config, so perhaps we can use Object.freeze() to prevent or write to a different file

    this.init = function(refresh, callback) {
      let init_project = {}; //*** IMPORTANT: determines the JSON file structure. Changes made here must be made to rest of this script.***
      init_project.init = "yes";
      init_project.os = process.platform;
      init_project.dirs = { main: process.env.HOME };
      init_project.updated = new Date().toJSON();
      init_project.projects = [...new Set([...autoscan(process.env.HOME)])];

      if (!refresh) {
        init_project.created = new Date().toJSON();
        init_project.config = {
          terminal: terminal[process.platform],
          editor: "atom"
        };
      } else {
        init_project.created = projects().created;
        init_project.config = JSON.parse(JSON.stringify(projects().config));
      }

      return write(init_project, {
        //writes the above structure to the projects.json file
        func: callback,
        arg: init_project.projects
      });
    };

    if (!this.isInit) return false;
    //error handling in case the json file isn't written

    this.os = process.platform;
    let cloned_projects = JSON.parse(JSON.stringify(projects())); //cloned projects.json [{projects}] array used for rewriting

    this.projects = projects().projects;

    this.dirs = projects().dirs;

    this.dir = arg => {
      /*
      sets or gets the main project directory $lx.dir() || $lx.dir(arg)
      sets if argument is passed
      gets if no argument
      */
      if (!arg) return this.dirs.main;
      cloned_projects.dirs.main = arg;

      const trimmed = cloned_projects.dirs.filter(
        o => cloned_projects.dirs[o] !== arg
      );
      cloned_projects.dirs = new Set(trimmed);

      cloned_projects.updated = new Date.toJSON();
      return write(cloned_projects, () => {});
    };

    this.scan = async function(dir, callback) {
      //scans a directory and returns its {project} data determined in autoscan function above --- not written to projects.json
      const scanned = await autoscan(dir);
      return callback(scanned);
    };

    this.onStart = function() {
      // DEBUG: Totally untested!!
      //watcher function that runs on appstart
      let i = 0;

      function loop(arr) {
        iterate(key, () => {
          i++;
          if (i < arr.length) loop(Object.keys(this.dirs)[i]);
        });
        if (i === arr.length - 1) {
          cloned_projects.updated = new Date().toJSON();
          write(cloned_projects);
          return write(cloned_projects, {
            func: callback("Projects updated cleanly")
          });
        }
      }

      async function iterate(key, call) {
        let _items_ = await this.scan(this.dirs[key]);

        try {
          return _items_.forEach((item, ix) => {
            let _item_ = {
              location: item,
              name: item.split("/").pop(),
              updated: new Date().toJSON()
            };
            cloned_projects.projects = [...new Set(this.projects).add(_item_)];

            if (ix === _items_.length - 1) return call();
          });
        } catch (e) {
          console.error(e);
          throw new Error(`Lix-main.js: Startup scan failure at ${this.dirs[key]}
${e}`);
        }
      }

      loop(Object.keys(this.dirs));
    };

    this.get = function(id) {
      /*
      gets project by name or index and returns its full location path

      QUESTION?? Maybe we can add id field? Idk if that would be useful or not

      */
      if (id === "0") return this.projects[0].location;

      return parseInt(id)
        ? this.projects[id].location
        : this.projects.filter(o => o.name === id)[0].location;
    };

    this.appendDir = function(location) {
      //writes a new directory to watch to projects.json [projects]
      try {
        const new_dir = {
          location: location,
          name: location.split("/").pop()
        };

        cloned_projects.updated = new Date().toJSON();
        cloned_projects.dirs = this.dirs;
        cloned_projects.dirs[new_dir.name] = new_dir.location;

        return write(cloned_projects, { func: () => {} }); //void callback for asynchronous chaining
      } catch (e) {
        console.error(e);
        throw new Error(`Lix-main.js: Error while adding ${location}
${e}`);
      }
    };

    this.rmDir = function(name, callback) {
      //removes directory from [projects] in projects.json
      try {
        const rm_dir = this.dirs[name]
          ? this.dirs[name]
          : Object.keys(this.dirs).filter(
              directory => this.dirs[directory] === name
            )[0];

        if (rm_dir === "main")
          throw new Error("Lix-main.js: Main directory cannot be deleted!");
        delete cloned_projects.dirs[rm_dir];
        cloned_projects.updated = new Date().toJSON();

        return write(cloned_projects, { func: callback() }); //void callback for asynchronous chaining
      } catch (e) {
        console.log(e);
        throw new Error(`Lix-main.js: Error while removing ${name}
${e}`);
      }
    };

    this.config = function(conf) {
      //sets or gets the config object
      if (!conf) return projects().config;
      else if (
        typeof conf === "object" &&
        !Object.is(projects().config, conf)
      ) {
        try {
          cloned_projects.config = conf;

          return write(cloned_projects, { func: () => {} });
        } catch (e) {
          console.error(e);
          throw new Error(`Lix-main.js: Error setting new config
${e}`);
        }
      }

      throw new Error("config not set");
    };

    this.updateAll = function(override, callback) {
      /*
      updates all watched projects

      if truthy override arg is passed, it will use flag --override instead of --remove
      */
      let i = 0;
      const toUpdate = this.projects.map(o => {
        return Object.freeze(o);
      });

      function loop(arr) {
        iterate(arr[i].location, () => {
          i++;
          if (i < arr.length) loop(toUpdate);
        });
        if (i === arr.length - 1) return callback("Projects updated cleanly");
      }

      function iterate(item, call) {
        console.log(item);
        const updating = spawn(
          `npx`,
          ["corvid", "pull", `--${override ? "override" : "move"}`],
          { cwd: item }
        );

        updating.stdout.on("data", data => {
          console.log(`stdout: ${data}`);
        });

        updating.stderr.on("data", data => {
          throw new Error(`Lix-main.js: Error updating ${id}
${data}`);
        });

        updating.on("close", code => {
          return call();
        });
      }

      loop(toUpdate);
    };
  }
}

class Project extends Lix {
  /*
  subclass acts as a selector

  pass a path inside the selector for constructive methods, pass index or name for query/destructive methods
  */
  constructor(id) {
    super();

    this.create = async function(url, dir, opts) {
      /*
      clones a new project, we can merge this with Salman's code somehow

      if opts {auto:true}, project editor is opened immediately upon creation
      */
      try {
        const path = `${dir || "."}/${id}`,
          ready = await shell.mkdir("-p", path);

        if (ready.stderr)
          throw new Error(`Lix-main.js: Error creating new project ${id}
${e}`);

        exec(`npm init -y`, { cwd: path }, () => {
          let args = [opts.debug ? "corvid-debug" : "corvid", "clone", url];

          const downloading = spawn("npx", args, { cwd: path });

          downloading.stdout.on("data", data => {
            console.log(`stdout: ${data}`);
          });

          downloading.stderr.on("data", data => {
            throw new Error(`Lix-main.js: Error downloading ${id}
${data}`);
          });

          downloading.on("close", code => {
            console.log(`${id} is now at ${path}`);
            return opts.auto
              ? process.exit(0)
              : exec("npx corvid open-editor", { cwd: path });
          });
        });
      } catch (e) {
        console.error(e);
        throw new Error(`Lix-main.js: Error creating new project ${id}
${e}`);
      }
    };

    this.open = async function(callback) {
      /*
      opens project by index or name

      if callback calls process.exit(), app should be able to exit cleanly after project is opened
      */
      try {
        const project = await this.get(id);
        exec("npx corvid open-editor", { cwd: project }, () => {
          callback();
        });
      } catch (e) {
        console.error(e);
        throw new Error(`Lix-main.js: Error opening ${id}
${e}`);
      }
    };

    this.openTerminal = async function() {
      const target = await this.get(id),
        emulator = this.config.terminal || terminal[this.os];

      exec(emulator, { cwd: target }, () => process.exit(0));
    };

    this.append = function() {
      //writes an existing project to watch list --- does not clone
      let cloned_projects = JSON.parse(JSON.stringify(projects())); //cloned projects.json [{projects}] array used for rewriting

      try {
        const new_project = {
          location: id,
          name: id.split("/").pop(),
          updated: new Date().toJSON()
        };

        cloned_projects.updated = new Date().toJSON();
        cloned_projects.projects = [...new Set(this.projects).add(new_project)];

        return write(cloned_projects, { func: () => {} });
      } catch (e) {
        console.error(e);
        throw new Error(`Lix-main.js: Error adding new project ${id}
${e}`);
      }
    };

    this.delete = async function() {
      /*
      deletes a watched project's entry in the [projects] array

      deleting the actual project directory would require admin/super permissions since it's recursive
      */
      let cloned_projects = JSON.parse(JSON.stringify(projects())); //cloned projects.json [{projects}] array used for rewriting
      try {
        const toDelete = await this.get(id);
        cloned_projects.projects = this.projects.filter(
          o => o.location !== toDelete
        );

        return write(cloned_projects, { func: () => {} });
      } catch (e) {
        console.error(e);
        throw new Error(`Lix-main.js: Error deleting ${id}
${e}`);
      }
    };

    this.update = async function(override, callback) {
      /*
      updates watched project by name or index

      if truthy override arg is passed, it will use flag --override instead of --remove
      */
      const toUpdate = await this.get(id);

      const updating = spawn(
        `npx`,
        ["corvid", "pull", `--${override ? "override" : "move"}`],
        { cwd: toUpdate }
      );

      updating.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
      });

      updating.stderr.on("data", data => {
        throw new Error(`Lix-main.js: Error updating ${id}
${data}`);
      });

      updating.on("close", code => {
        cloned_projects.updated = new Date.toJSON();
        write(cloned_projects);
        return callback(`Lix-main.js: Update finished with code ${code}`);
      });
    };

    this.getSnapshots = async function(callback) {
      const project = `${await this.get(id)}/.corvid/snapshots`;
      const exists = await shell.cd(project);

      if (exists.stderr) return callback("Lix-main.js: No snapshots yet!");

      const results = spawn("ls", {
        cwd: project
      });

      results.stdout.on("data", data => {
        return callback(
          data
            .toString()
            .split(/\n/)
            .filter(o => o)
        );
      });

      results.stderr.on("data", data => {
        throw new Error(`Lix-main.js: Error querying snapshots for ${id}
${data}`);
      });

      results.on("close", code => {
        return callback("Snapshots folder is empty!");
      });
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
