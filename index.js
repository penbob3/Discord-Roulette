var msgs;
var jsonFetched = false;
var ytKey;
var jsonPath;
var currUrl;
var msgGone = false;
var muted = false;
var isSettingUp = false;
var justImg = false;
var justText = false;

function togSettings() {
    if (isSettingUp == false) {
        isSettingUp = true;
        $("#settingsmenu").removeClass("close");
        $("#settingsmenu").addClass("open");
    } else {
        isSettingUp = false;
        $("#settingsmenu").removeClass("open");
        $("#settingsmenu").addClass("close");
    }
}

function togJustImg() {
    if (justImg == false) {
        justImg = true;
        if (justText== true) {togJustText()}
        $("#imgonlycheck").attr("src", "check.png");
    } else {
        justImg = false;
        $("#imgonlycheck").attr("src", "uncheck.png");
    }
}

function togJustText() {
    if (justText == false) {
        justText = true;
        if (justImg== true) {togJustImg()}
        $("#textonlycheck").attr("src", "check.png");
    } else {
        justText = false;
        $("#textonlycheck").attr("src", "uncheck.png");
    }
}

function getFile() {
    var fileUpload = document.getElementById("jsonin").files[0];
    var realfile = new FileReader;
    realfile.onload = () => {
        msgs = JSON.parse(realfile.result);
        jsonFetched = true;
    }
    realfile.readAsText(fileUpload);
}

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

function togMute() {
    if (muted == true) {
        muted = false;
        $("#mutepic").attr("src", "mute.png")
    } else {
        muted = true;
        $("#mutepic").attr("src", "unmute.png")
    }
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

async function loadIn() {
    var envars = await remoteRequest('vars.json');
    console.log(envars);
    envars = JSON.parse(envars);
    ytKey = envars.ytAPIKey;
    console.log(envars);
    //Add Stuff Here
    //msgs = JSON.parse(jsonObj);
    console.log(msgs);
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
    if (jsonFetched == false) {swal("Error!", "Local JSON file not selected!", "error");} else {
        if (msgGone == false) {
            $("#infomsg").css("transition", "1s");
            $("#infomsg").css("margin-top", "8vh");
            //Activate the line below when JSON loads
            $("#infomsg").css("opacity", "0");
            msgGone = true;
        }
        if (muted == false) {
            var audio = new Audio('notif.mp3');
            audio.play();
        }
        divPulse("#msgbody");
        $("#msgimg").attr("src", "");
        var len = msgs.messages.length;
        if (justImg == true) {
            do {
                var num = Math.floor((Math.random() * len) + 1);
                try {
                    var imgurl = msgs.messages[num].attachments[0].url;
                } catch {
                    var imgurl = "";
                }
            } while (imgurl == "");
        } else if (justText == true) {
            do {
                var num = Math.floor((Math.random() * len) + 1);
                try {
                    var imgurl = msgs.messages[num].attachments[0].url;
                } catch {
                    var imgurl = "";
                }
            } while (imgurl !== "");
        } else {
            var num = Math.floor((Math.random() * len) + 1);
            try {
                var imgurl = msgs.messages[num].attachments[0].url;
            } catch {
                var imgurl = "";
            }
        }
        var timestamp = msgs.messages[num].timestamp;
        var timedate = new Date(timestamp);
        var time = formatAMPM(timedate);
        var date = timedate.getDate() + "/" + timedate.getMonth() + "/" + timedate.getFullYear();
        var fullString = date + " at " + time;
        $("#timetext").html(fullString);
        var msg = msgs.messages[num].content;
        var picurl = msgs.messages[num].author.avatarUrl;
        $("#profpic").attr("src", picurl);
        var name = msgs.messages[num].author.name;
        $("#nametext").html(name);
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

document.addEventListener('keyup', function(e){
    if (e.keyCode === 32) {e.preventDefault(); newMsg()};
});