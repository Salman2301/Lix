# Lix (**Work in Progress**)
Lix is a Local Wix Editor Application for Mac, Linux and Windows OS, powered by [Electron](https://github.com/electron/electron) and [Corvid](https://github.com/wix-incubator/corvid).<br>
Lix helps to manage multiple wix sites (add, delete, pull or push) and it's open source and MIT license. so, Feel free to contribute, share code or knowledge.

# Tech Stacks
### Fronted
1. jquery
2. HTML, CSS

### Backend
1. nodejs
2. shelljs
3. express

### Application
1. [Electron](https://github.com/electron/electron)

### CLI
1. [corvid](https://github.com/wix-incubator/corvid)

# Open the terminal and run the following commands
1. to download this repo run `git clone https://github.com/Salman2301/Lix.git`.
2. run `cd Lix` to go to Lix folder and run `npm install` to install all the dependencies.
3. run `npm i -g electron` to install electron globally.
4. run `npm start` to start the application.

Lix should be opened and working 
<br>
and server should be running in port `8905`
<br>

**Server Base URL**  
```
http://localhost:8905
```
**Path available**
```
/corvid/pull?folderName=siteName
/corvid/push?folderName=siteName
/corvid/delete?folderName=siteName
/corvid/createApp?folderName=siteName&siteUrl=https://username.wixsite.com/site
/corvid/list
```
# TODO
- [ ] Hot reload electron application
- [ ] `/corvid` route should provide details about the Path avaiable and Error message
- [ ] `/corvid/list` a shell scripts need to be written to track and generate JSON in `.lix.json` file



# Release
Please Visit the release page to download the application for linux, mac, windows once it's ready!.

Created by [Salman2301](https://salman2301.com)
<br>
# Thanks to contributors
1.  [scott purslowe](https://github.com/Infuze-Designs)

### Reference
Lix is an application based on corvid-cli and corvid-types <br>
visit link below to know more about corvid and wix <br>
[https://github.com/wix-incubator/corvid](https://github.com/wix-incubator/corvid) <br>
[Wix](https://wix.com) <br>
