var msgs;
var users;
var jsonFetched = false;
var ytKey;
var jsonPath;
var currUrl;
var msgGone = false;
var muted = false;
var isSettingUp = false;
var justImg = false;
var justText = false;
var hideName = false;
var shownMsgs = []
var currUserID = ''

function selectUser(id) {
    console.log('Selecting: ' + id)

    var num
    for (i = 0; i < users.length; i++) {
        if (users[i].id == id) {
            num = i
        }
    }

    $("#user" + num).toggleClass("selectedpfp")
    //document.getElementById("a" + id).classList.add("selectedpfp")
    var name = ''
    for (i = 0; i < users.length; i++) {
        if (users[i].id == id) {
            name = users[i].name
        }
    }

    $("#currusertext").text("Only showing messages from " + name)
    currUserID = id
}

function deselectUser(id) {
    console.log('Deselecting: ' + id)
    var num
    for (i = 0; i < users.length; i++) {
        if (users[i].id == id) {
            num = i
        }
    }
    $("#user" + num).toggleClass("selectedpfp")
    //document.getElementById("a" + id).classList.remove("selectedpfp")
    $("#currusertext").text("Currently showing all messages")
    currUserID = ''
}

function showOnly(id) {
    if (id == false || id == currUserID) {
        console.log("Already selected!")
        deselectUser(id)
        shownMsgs = msgs.messages
    } else {
        if (currUserID != '') {deselectUser(currUserID)}
        selectUser(id)
        shownMsgs = []
        for (i = 0; i < msgs.messages.length; i++) {
            if (msgs.messages[i].author.id == currUserID) {
                shownMsgs.push(msgs.messages[i])
            }
        }
    }
}

function listUsers(posts) {
    var usersl = []
    usersl.push(posts[0].author)
    for (i = 1; i < posts.length; i++) {
        var found = false
        for (u = 0; u < usersl.length; u++) {
            if (posts[i].author.id == usersl[u].id) {
                found = true
                break
            }
        }
        if (found == false && posts[i].author.isBot == false) {
            console.log(posts[i].author)
            usersl.push(posts[i].author)
        }
    }
    return usersl
}

function displayUsers(locusers) {
    $("#userbar").html("")
    for (i = 0; i < locusers.length; i++) {
        $("#userbar").append('<img class="selectpfp" src="' + locusers[i].avatarUrl + '" title="' + locusers[i].name + '" id="user' + i + '" onclick="showOnly(' + locusers[i].id + ')">')
    }
}

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
        $("#imgonlycheck").attr("src", "public/check.png");
    } else {
        justImg = false;
        $("#imgonlycheck").attr("src", "public/uncheck.png");
    }
}

function togJustText() {
    if (justText == false) {
        justText = true;
        if (justImg== true) {togJustImg()}
        $("#textonlycheck").attr("src", "public/check.png");
    } else {
        justText = false;
        $("#textonlycheck").attr("src", "public/uncheck.png");
    }
}

function togHideName() {
    if (hideName== false) {
        hideName = true;
        $("#hidenamecheck").attr("src", "public/check.png");

        $("#profpic").toggleClass("opacnone");
        $("#namebox").toggleClass("opacnone");

        $('#namepiccombo').toggleClass('namepiccomboclass')

    } else {
        hideName = false;
        $("#hidenamecheck").attr("src", "public/uncheck.png");

        $("#profpic").toggleClass("opacnone");
        $("#namebox").toggleClass("opacnone");

        $('#namepiccombo').toggleClass('namepiccomboclass')
    }
}

function getFile() {
    var fileUpload = document.getElementById("jsonin").files[0];
    var realfile = new FileReader;
    realfile.onload = () => {
        currUserID = ''
        $("#currusertext").text("Currently showing all messages")
        msgs = JSON.parse(realfile.result);
        jsonFetched = true;
        shownMsgs = msgs.messages
        users = listUsers(msgs.messages)
        console.log(users)
        displayUsers(users)
        $('#curruserbar').removeClass('hidden')
        $('#userbar').removeClass('hidden')
        swal("Success!", "Loaded " + msgs.messages.length + " messages!", "success")
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
        $("#mutepic").attr("src", "public/mute.png")
    } else {
        muted = true;
        $("#mutepic").attr("src", "public/unmute.png")
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

function fadeInGuide() {
    $("#guide").fadeIn();
}

async function loadIn() {
    var timed = setTimeout(fadeInGuide, 500);
    var envars = await remoteRequest('vars.json');
    envars = JSON.parse(envars);
    ytKey = envars.ytAPIKey;
   
    (function() {
        function scrollHorizontally(e) {
            e = window.event || e;
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            document.getElementById('userbar').scrollLeft -= (delta * 45); // Multiplied by 40
            e.preventDefault();
        }
        if (document.getElementById('userbar').addEventListener) {
            // IE9, Chrome, Safari, Opera
            document.getElementById('userbar').addEventListener('mousewheel', scrollHorizontally, false);
            // Firefox
            document.getElementById('userbar').addEventListener('DOMMouseScroll', scrollHorizontally, false);
        } else {
            // IE 6/7/8
            document.getElementById('userbar').attachEvent('onmousewheel', scrollHorizontally);
        }
    })();
}

function newTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
  }

function divChange(div, property, value) {
    $(div).css(property, value);
}

function divPulse(div) {
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
            var audio = new Audio('public/notif.mp3');
            audio.play();
        }
        divPulse("#msgbody");
        $("#msgimg").attr("src", "");
        var len = shownMsgs.length;
        if (justImg == true) {
            do {
                var num = Math.floor((Math.random() * len) + 1);
                try {
                    var imgurl = shownMsgs[num].attachments[0].url;
                } catch {
                    var imgurl = "";
                }
            } while (imgurl == "");
        } else if (justText == true) {
            do {
                var num = Math.floor((Math.random() * len) + 1);
                try {
                    var imgurl = shownMsgs[num].attachments[0].url;
                } catch {
                    var imgurl = "";
                }
            } while (imgurl !== "");
        } else {
            var num = Math.floor((Math.random() * len) + 1);
            try {
                var imgurl = shownMsgs[num].attachments[0].url;
            } catch {
                var imgurl = "";
            }
        }
        var timestamp = shownMsgs[num].timestamp;
        var timedate = new Date(timestamp);
        var time = formatAMPM(timedate);
        var date = timedate.getDate() + "/" + timedate.getMonth() + "/" + timedate.getFullYear();
        var fullString = date + " at " + time;
        $("#timetext").html(fullString);
        var msg = shownMsgs[num].content;
        var picurl = shownMsgs[num].author.avatarUrl;
        $("#profpic").attr("src", picurl);
        var name = shownMsgs[num].author.name;
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