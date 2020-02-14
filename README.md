# Lix-cli/Lix JS classes

<br>
Part of module in development for a user-friendly frontend to Wix's Corvid local editor.

## Dependencies

<br>

**corvid-cli** and **corvid-types**: <https://github.com/wix-incubator/corvid>

**shelljs**: <https://github.com/shelljs/shelljs>

`npm i -g npm corvid-cli --save-dev corvid-types shelljs` installs these globally.

If node says it can't find **shelljs** or **child_process** when running, try `export NODE_PATH=$(npm root --quiet -g)`

<br>
<br>
<br>

## Command line usage

<br>
Use the **--help** flag for the following printout:

```shell
--help                    print this dialog
--init                    initial setup if you haven't run lix-cli before
--list                    list all scanned projects
--make [url] [path]       make a new project in the given directory
                          creates a new directory if your path includes
--open [name|index]       open a project by name or index
--refresh                 rescan everything
--pull                    pull a project
--snapshots               list of a project's snapshots
--cli                     open project in a new terminal window
--append [path]           add a project to watched list
--delete                  remove a project from watched list
--config                  get or change your config
--scan [path]             search for projects in given directory
--dirs                    prints your watched directories
--appenddir [path]        adds a directory to watch
--rmdir [path]            removes a directory from watched
```

Let's say you want to clone a new project into your _Documents_ directory:

`node lix-cli.js --make ~/Documents/newproject mysite.wixsite.com`

Once the project is created, the local editor will open by default.

You can issue the **--open** flag without any arguments and you will be prompted to select from a list of your projects. Entering either the index or the name of the project directory are both valid.

`node lix-cli.js --open newproject`

`node lix-cli.js --open 0`

<br>
<br>
<br>

## Script Usage

<br>

You can import either module if you don't need both - keep in mind `$px` is a subclass of `$lx`.

```javascript
//Node.js import
const { $lx, $px } = require("./lix-main.js");

//ES6 import
import { $lx, $px } from "./lix-main.js";
```

<br><br><br>

### \$lx or new Lix()

<br>

This is the parent class, and takes no arguments - in other words it doesn't act like a selector of any sort. Used for all-encompassing queries and changes not specific to any one project.

<br>

`$lx.isInit;`

- Checks if json "init" flag is not "false"

- Returns boolean

`$lx.init(projects => { projects = [{}]; });`

- Creates JSON file if isInit === "false"

- Returns projects array built from user's home directory recursive scan

`$lx.os;`

- Host system's operating system.

- Supported values = linux, win, darwin

`$lx.config();`

- Gets the user's config if no argument is passed

- Sets config if object is passed. i.e. `{ "terminal" : "mate-terminal", "editor": "atom"}`

`$lx.projects;`

- Array of all currently watched projects

`$lx.updateAll(override, () => { void );`

- Updates all projects

- Set override to **true** to override current projects, or **false** to store them as snapshots

`$lx.get(id);`

- Mostly for use by the \$px subclass

- Takes name or index **id** and returns a project's full path

`$lx.dir;`

- Location of default project directory

`$lx.dirs;`

- { name: location } of all watched directories

`$lx.appendDir(dirpath, () => { void });`

- Add a new directory to watch.

`$lx.rmDir(name, () => { void });`

- Removes directory from watched

`$lx.scan(dir, scanned => { scanned = {}; );`

- Scan a directory of your choosing

<br><br><br>

### \$px or new Project(id)

<br>

Subclass to **Lix**. It functions more like a selector. Querying methods will require an existing project, constructive methods will create using the selector argument. **id** indicates \$lx.get() is used to get the project's absolute path.

<br>

`$px(id).create(url, dirpath, {options});`

- Creates a new project in either an existing directory or a new one

- Options = `{ debug: bool, auto: bool }` auto opens project immediately upon creation

- Keep in mind nodejs only accepts one **package-lock.json** per directory

`$px(id).open(() => { void );`

- Calling `process.exit(0);` in the callback separates this process from the local editor cleanly

`$px(id).openTerminal();`

- Opens project directory in a new terminal window.

- Obeys config "terminal" rule

`$px(id).update(override, status => { status = "Sucess/Fail message"; );`

- Updates a single given project

`$px(id).getSnapshots(snapshots => { snapshots = []; });`

- Gets array of all snapshots available for given project

- **WIP:** Will allow reverting a chosen snapshot. In the meantime you can use the subdirs function in **lix-main.js** to scan/open a full snapshot in your text editor.

`$px(dirpath).append();`

- Add the dirpath to the list of watched projects

- Automatically assigns name and updated date

`$px(id).delete();`

- Deletes project from watched list
