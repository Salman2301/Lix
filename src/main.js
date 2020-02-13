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

        $('#createSiteModal').modal('hide');
        console.log("site is downloading...");
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

    $('#sites').on('click', '.btn-open-editor',function(e){
        console.log("clicked :" , this);
        let folderName = this.getAttribute("folder-name");
        if(!folderName) {
            console.log("something went wrong.\n delete and add the site once again.");
            return;
        }
        let url = `${serverUrl}/corvid/openEditor?folderName=${folderName}`;

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
            // refreshSiteList();
            console.log("opening editor.");
        });

    });

    btnActionClick("pull");
    btnActionClick("push");
    btnActionClick("delete");

    function btnActionClick(action) {
        console.log("actions");
        $('#sites').on('click', `.btn-${action}`,function(e){
            console.log("clicked :" , this);
            let folderName = this.getAttribute("folder-name");
            if(!folderName) {
                console.log("something went wrong.\n delete and add the site once again.");
                return;
            }
            let url = `${serverUrl}/corvid/${action}?folderName=${folderName}`;

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
                // refreshSiteList();
                console.log("editor actions : " , action);
            });

        })
    }
}


async function refreshSiteList() {
    try {
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
            
            let sitesHTML = "";
            let sitesEl = $("#sites")[0];
            sitesEl.innerHTML = ""; // empty all the sites
            data.forEach(site=>{
                sitesHTML = sitesHTML + ("\n"+ cardHTMLTemplate(site));
                // console.log(sitesHTML, ("\n"+ cardHTMLTemplate(site)));
            });
            console.log("working :" , sitesHTML);
            sitesEl.innerHTML = sitesHTML;
        });
        
        
    } catch (error) {
        console.log("ERROR : " ,error.message);
    }
}


function handleError(msg) {
    console.log("handle Error here : ", msg);
}

var cardHTMLTemplate = (data) => `<div class="col-sm-4 mx-auto mx-2" id="card-site-id-${data.slug}">
<div class="card">
    <img src="./assets/image/default.png" class="card-img-top" alt="site image">
    <div class="card-body">
        <h5 class="card-title">${data.siteName || "No site Name"}</h5>
        <p class="card-text"><small class="text-muted">${data.timeAgo || "-"}</small></p>
        <button href="#" folder-name=${data.slug} class="btn btn-primary btn-open-editor"><img class="svg-white" src="./assets/icons/edit.svg"> OPEN
            EDITOR</button>
        <div class="dropdown show d-inline-flex">
            <a class="btn btn-secondary dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <img class="svg-white" src="./assets/icons/more-vertical.svg">
            </a>
            
            <div class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                <button folder-name=${data.slug} class="dropdown-item btn-push"><img class="svg-white mr-3"
                src="./assets/icons/upload-cloud.svg">Push</button>
                <button folder-name=${data.slug} class="dropdown-item btn-push"><img class="svg-white mr-3"
                src="./assets/icons/download-cloud.svg">Pull</button>
                <button folder-name=${data.slug}  class="dropdown-item btn-delete" ><img class="svg-white mr-3"
                src="./assets/icons/trash-2.svg">Delete</button>
            </div>
        </div>
    </div>
</div>
</div>`;