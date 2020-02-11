# Lix-cli/Lix JS classes

Part of module in development for a user-friendly frontend to Wix's Corvid local editor.

## Dependencies

**corvid-cli** and **corvid-types**: https://github.com/wix-incubator/corvid

**shelljs**: https://github.com/shelljs/shelljs

## Command line usage

Use the **--help** flag for the following printout:

```shell
--init                    initial setup if you haven't run lix-cli before--list                    list all scanned projects--make [path] [url]       make a new project in the given directory                              creates a new directory if your path includes--open [name|index]       open a project by name or index--refresh                 rescan everything--help                    print this dialog
```

Let's say you want to clone a new project into your *Documents* directory:

`node lix-cli.js --make ~/Documents/newproject mysite.wixsite.com`

Once the project is created, the local editor will open by default.

You can issue the **--open** flag without any arguments and you will be prompted to select from a list of your projects. Entering either the index or the name of the project directory are both valid.

`node lix-cli.js --open newproject`

`node lix-cli.js --open 1`

## Import Usage

You can import either module if you don't need both - keep in mind `$px` is a subclass of `$lx`.

```javascript
//Node.js importconst { $lx, $px } = require("./lix-main.js");//ES6 importimport { $lx, $px } from "./lix-main.js";
```

### \$lx or new Lix()

This is the parent class, and takes no arguments - in other words it doesn't act like a selector of any sort.

```javascript
$lx.appendDir(location); //add a new directory to watch//void callback for asynchronous chaining$lx.dir;    //returns location of default project directory$lx.dirs;    //returns {name:location} of all watched directories $lx.get(id);    //mostly here for use by the $px subclass//however you can send it either index or dirname and it will return//that project's location$lx.init(callback);    //creates JSON file if isInit === "false"// returns projects array built from user's home directory recursive scan$lx.isInit; //checks if json "init" flag is not false.//if you want to force a refresh on appstart, set "init" to false$lx.os; //returns host system's OS$lx.projects;    //returns array of all currently watched projects$lx.rmDir(name|location); //removes directory from watched//void callback for asynchronous chaining$lx.scan(dir, callback);    //scan a directory of your choosing//returns {location:"dirpath", name:"dirname", updated:"date"}
```

### \$px or new Project(arg)

Subclass to `$lx`. It functions more like a selector. Querying methods will require an existing project, constructive methods will create using the selector arg.

```javascript
 $px(dirpath).append();    //this will add the dirpath to the list of //watched projects. Automatically assigns name and updated date$px(name).create(url, dirpath, {opts});    //creates a new project in //either an existing directory or a new one. Obviously node cannot //install multiple in one directory.//{debug:bool, auto:bool} auto opens project immediately upon creation$px(dirpath).delete();    //removes project from watched list$px(name|index).open(callback);    //opens a project using either name or //index for convenience. It uses $lx.get method.//callback is handy in case you want to kill the host app but keep //local editor/electron open
```
