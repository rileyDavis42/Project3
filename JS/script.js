//JavaScript
let course;
let course_holes;
let players = [];
let scorecard = $("#scorecard");
let can = false;
let tee_type;
let totalYardage = 0;
scorecard.css('border', 'none');

function addPlayer(){
    let obj = $("#newName");
    let name = obj.val();
    for(let i = 0; i < players.length; i++){
        if(name === players[i]){
            alertMessage("No two players can have the same name!");
            return;
        }
    }
    obj.val("");
    players.push(name);
    $("#displayPlayers").append("<li>" + name + "<i class=\"fas fa-trash-alt\" onclick=\"deletePlayer(" + players.length + ")\"></i></li>");
}

function deletePlayer(index){
    players = players.splice(index, 1);
    let krana = $("#displayPlayers");
    krana.empty();
    for(let i = 0; i < players.length; i++){
        krana.append("<li>" + players[i] + "<i class=\"fas fa-trash-alt\" onclick=\"deletePlayer(" + i + ")\"</li></li>");
    }
}

function updateCourse(){
    let display = $("#displayCourse");
    display.removeAttr("style");
    display.find("h3").html(course["name"]);
    tee_type = $("#tee_type").val();
    let avg = 0;
    for(let i = 0; i < course_holes.length; i++){
        avg += course_holes[i]["teeBoxes"][tee_type]["par"];
        totalYardage += course_holes[i]["teeBoxes"][tee_type]["yards"];
    }
    avg /= course_holes.length;
    $("#averagePar").html(avg);
    $("#totalYards").html(totalYardage);
}

function importData(){
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
        if(httpRequest.readyState === XMLHttpRequest.DONE){
            can = true;
            let response = JSON.parse(httpRequest.response);
            course = response["data"];
            course_holes = course["holes"];
            let courseID = $("#courseID");
            updateCourse();
        }
        else if(httpRequest.status === 404 && !$("#dialog").length){
            can = false;
        }
    };
    httpRequest.open('GET', 'https://golf-courses-api.herokuapp.com/courses/' + $('#courseID').val(), true);
    httpRequest.send();
}

function startGame(){
    if(players.length < 1){
        alertMessage("Please add a player...");
        return;
    }
    if(!can){
        alertMessage("Please select a course...");
        return;
    }
    $("#topContent").empty();
    let holes = [];
    let yardages = [];
    let handicaps = [];
    for(let i = 0; i < course_holes.length; i++){
        let hole = course_holes[i]["teeBoxes"][tee_type];
        holes.push(hole["par"]);
        yardages.push(hole["yards"]);
        handicaps.push(hole["hcp"]);
    }
    let blur = $("#blur");
    blur.css("background", "#87CEFA url('" +course["thumbnail"] + "') no-repeat fixed center");
    blur.css("background-size", "cover");
    scorecard.prepend("<button id='reset' onclick='reset()'>Reset</button>");
    scorecard.prepend("<h1>" + course["name"] + "</h1>");
    initiate(holes, yardages, handicaps);
}

function initiate(holes, yardages, handicaps){
    let emptyScores = [];
    let width = 100 / (holes.length + 1);
    let table = $("#table");
    let holesArr = $("#holes");
    let totalPar = 0;
    let totalHandicap = 0;
    table.css('display', 'table');
    scorecard.css('border', '');
    $('head').append("<style>th,tr,td{width: " + width + "%; overflow-x: hidden}</style>");
    for(let i = 0; i < holes.length; i++){
        holesArr.append("<th>" + (i + 1) + "</th>");
        emptyScores.push("<td></td>");
    }
    holesArr.append("<th>Total</th>");
    for(let i = 0; i < players.length; i++){
       table.append("<tr class='player'><td>" + players[i] + "</td>" + emptyScores + "<td class='totalScore'></td></tr>");
    }
    table.append("<tr id='par'><td>PAR</td></tr>");
    let par = $("#par");
    table.append("<tr id='yards'><td>Yards</td></tr>");
    let yards = $("#yards");
    table.append("<tr id='handicap'><td>Handicap</td></tr>");
    let handicap = $("#handicap");
    for(let i = 0; i < holes.length; i++){
        par.append("<td>" + holes[i] + "</td>");
        totalPar += holes[i];

        yards.append("<td>" + yardages[i] + "</td>");

        handicap.append("<td>" + handicaps[i] +"</td>");
        totalHandicap += handicaps[i];
    }
    par.append("<td>" + totalPar +"</td>");
    yards.append("<td>" + totalYardage + "</td>");
    handicap.append("<td>" + totalHandicap + "</td>");
    turn(0, 0, holes);

}
function turn(player, hole, holes) {
    calcTotal();
    let row = $("tbody").children().eq(player + 1);
    let cell = row.children().eq(hole + 1);
    if (cell.attr('class') !== 'totalScore') {
    cell.empty();
    row.css("background-color", "#FFFF00");
    cell.attr("contenteditable", "true");
    cell.css("white-space", "nowrap");
    cell.focus();

    row.children().eq(hole + 1).on("keydown", function (event) {
        if (event.keyCode === 13 || event.keyCode === 9) {
            event.preventDefault();

            if (isNaN(cell.html()) || cell.html().length < 1) {
                cell.empty();
                turn(player, hole, holes);
            }

            else {
                let updatePlayers = "['" + players[0] + "'";
                let par = holes[hole];
                let score = cell.html() - par;
                let val = "pos";
                if (score <= 0) {
                    val = "neg";
                }
                cell.html(cell.html() + " | <span class='" + val + "'>" + score + "</span>");

                row.css("background-color", "#FFFFFF");
                cell.css("background-color", "unset");
                for (let i = 1; i < players.length; i++) {
                    updatePlayers = updatePlayers + ", '" + players[i] + "'";
                }
                updatePlayers = updatePlayers + "]";
                cell.attr("contenteditable", false);

                if (player === players.length - 1) {
                    turn(0, hole + 1, holes);
                }
                else {
                    turn(player + 1, hole, holes);
                }
            }
        }
    });
    }
}

function calcTotal(){
    let tbody = $("tbody");
    let name = "";
    let finished = true;
    for(let i = 1; i < tbody.children().length - 3; i++){
        let row = tbody.children().eq(i);
        let hits = [];
        let scores = [];
        name = row.children().eq(0).html();
        for(let j = 1; j < row.children().length - 1; j++){
            let cell = row.children().eq(j);
            if(cell.html().length > 1){
                let str = cell.html().split(' | ');

                let hit = parseInt(str[0]);

                let score = parseInt(str[1].split('>')[1].split('<')[0]);

                hits.push(hit);
                scores.push(score);
            }
            else{
                finished = false;
            }
        }
        let totalHits = 0;
        let totalScores = 0;

        for(let j = 0; j < hits.length; j++){
            totalHits += hits[j];
        }
        for(let j = 0; j < scores.length; j++){
            totalScores += scores[j];
        }
        let val = "pos";
        if(totalScores <= 0){
            val = "neg";
        }

        row.children().last().html(totalHits + " | <span class='" + val + "'>" + totalScores + "</span>");

        if(finished){
            status(row.children().eq(0).html(), totalScores);
        }
    }
}

function status(name, score){
    if(score > 0){
        alertMessage("Better luck next time " + name + "!");
    }
    else{
        alertMessage("Good game " + name + "!");
    }
}

function alertMessage(message){
    $("#dialog").remove();
    $("body").prepend("" +
        "<dialog id='dialog' open>" +
        "<p>" + message + "</p>" +
        "</dialog>");
    setTimeout(function () {
        $("#dialog").css('opacity', '0');
    }, 2000);
    setTimeout(function(){
        $("#dialog").remove();
    }, 5000);
}

function reset(){
    $("#scorecard").html("<table id=\"table\">\n" +
        "        <tr id=\"holes\">\n" +
        "            <th class=\"player\"></th>\n" +
        "        </tr>\n" +
        "    </table>");
    startGame();
}