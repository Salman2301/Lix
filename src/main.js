console.log("hello world!");

const serverUrl = "http://127.0.0.1:8905";

$( document ).ready(init);

function init() {
    refreshSiteList() 

    // events

    $("#btn-create-site").click(function() {
        console.log("clicked!!");
        let folderName = $('#inFolderName').val();
        let siteUrl = $('#inSiteUrl').val();

        let url = `${serverUrl}/corvid/createApp?folderName=${folderName}&siteUrl=${siteUrl}`;

        fetch(url ,{mode:"no-cors"})
        .then(res=>{
            console.log(res);
            if(res.ok) {
                return res.json();
            } else {
                handleError(`Status is not okay`)
            }
        })
        .then(data=>{
            refreshSiteList();
        });

    });
}


function refreshSiteList() {
    // get JSON from server
    // generate card html

    let url = `${serverUrl}/corvid/list`;
    console.log("url : " , url);
    fetch(url,{mode:"no-cors"})
    .then(res=>{
        console.log(res);
        if(res.ok) {
            return res.json();
        } else {
            handleError(`Status is not okay`)
        }
    })
    .then(data=>{
        console.log(data);
        let sitesHTML = [];
        const sitesEl = $("#sites");
        sitesEl.innerHTML = ""; // empty all the sites
        data.forEach(site=>{
            sitesHTML.innerHTML +="\n"+ cardHTMLTemplate(site);
        });
        console.log(sitesHTML);
        $(sitesEl).append(sitesHTML.join(''));
    });
    
}


function handleError(msg) {
    console.log("handle Error here : ", msg);
}

var cardHTMLTemplate = (data) => `<div class="col-sm-3 mx-auto mx-2" id="card-site-id-${data.slug}">
<div class="card">
    <img src="./assets/image/default.png" class="card-img-top" alt="site image">
    <div class="card-body">
        <h5 class="card-title">${data.siteName || "No site Name"}</h5>
        <p class="card-text"><small class="text-muted">${data.timeAgo || "-"}</small></p>
        <button href="#" class="btn btn-primary"><img class="svg-white" src="./assets/icons/edit.svg"> OPEN
            EDITOR</button>
        <button href="#" class="btn btn-primary"><img class="svg-white"
                src="./assets/icons/download-cloud.svg">PULL</button>

        <button href="#" class="btn btn-danger"><img class="svg-white"
                src="./assets/icons/trash-2.svg">DELETE</button>
    </div>
</div>
</div>`;