var msgs;
var jsonFetched = false;
var ytKey;
var jsonPath;
var currUrl;
var msgGone = false;

async function extractVideoID(url){
    var currUrl = url;
    return new Promise(async (resolve, reject) => {
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = currUrl.match(regExp);
        if ( match && match[7].length == 11 ){
            var url = "https://www.googleapis.com/youtube/v3/videos?part=id%2Csnippet&id=" + match[7] + "&key=" + ytKey;
            var jsonDat = await remoteRequest(url);
            jsonDat = JSON.parse(jsonDat);
            var title = jsonDat.items[0].snippet.localized.title;
            var img = "http://img.youtube.com/vi/" + match[7] + "/0.jpg"
            var resp = [title, img];
            resolve(resp);
        }else{
            resolve(false);
        }
    });
}

function remoteRequest(url) {
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.overrideMimeType("application/json");
        request.open('GET', url, false);
        request.onreadystatechange = () => {
            if (request.readyState == 4 && request.status == "200") {
                resolve(request.response);
            } else {
                reject("Request Grab Failed!");
            }
        }
        request.send();
    })
}

async function loadIn() {
    var envars = await remoteRequest('vars.json')
    envars = JSON.parse(envars);
    ytKey = envars.ytAPIKey;
    jsonPath = envars.msgFileName;
    var jsonObj = await remoteRequest(jsonPath);
    msgs = JSON.parse(jsonObj);
    jsonFetched = true;
}

async function getJson() {
    $.getJSON("allmess.json", (json) => {msgs = json;});
}

function newTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
  }

function divChange(div, property, value) {
    $(div).css(property, value);
}

function divPulse(div) {
    //$(div).css("transition", "0.1s");
    //$(div).css("transform", "scale(1.075)");
    divChange(div, "transition", "0.1s");
    divChange(div, "transform", "scale(1.05)")
    var reverse = setTimeout(divChange, 100, div, "transform", "scale(1)")
}

async function newMsg() {
    if (jsonFetched == false) {swal("Error!", "Messages have not loaded!", "error");} else {
        if (msgGone == false) {
            $("#infomsg").css("transition", "1s");
            $("#infomsg").css("margin-top", "8vh");
            $("#infomsg").css("opacity", "0");
            msgGone = true;
        }
        divPulse("#msgbody");
        $("#msgimg").attr("src", "");
        var len = msgs.messages.length;
        var num = Math.floor((Math.random() * len) + 1);
        var msg = msgs.messages[num].content;
        var picurl = msgs.messages[num].author.avatarUrl;
        $("#profpic").attr("src", picurl);
        var name = msgs.messages[num].author.name;
        $("#nametext").html(name);
        try {
            var imgurl = msgs.messages[num].attachments[0].url;
        } catch {
            var imgurl = "";
        }
        $("#msgtext").html(msg);
        $("#msgtext").css("color", "whitesmoke");
        $("#msgimg").attr("src", imgurl);
        if (msg !== "") {
            var ytResp = await extractVideoID(msg);
            if (ytResp !== false) {
                var vidName = ytResp[0];
                var picAddr = ytResp[1];
                $("#msgimg").attr("src", picAddr);
                $("#msgtext").html(vidName);
                $("#msgtext").css("color", "lightskyblue");
                $("#msgimg").css("margin-top", "0px");
                $("#msgimg").attr("onclick", 'newTab("' + msg + '")');
            } else {
                $("#msgimg").attr("onclick", "");
                $("#msgimg").css("margin-top", "-16px");
            }
        }
        //$("#msgtext").css("color", "whitesmoke");
    }   
}

function runStart() {
    getJson();
    newMsg();
}

document.addEventListener('keyup', function(e){
    if (e.keyCode === 32) {newMsg()};
});