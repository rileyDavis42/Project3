//JavaScript
function initiate(players, holes){
    let emptyScores = [];
    let width = 100 / (holes.length + 1);
    let table = $("#table");
    $('head').append("<style>th,tr,td{width: " + width + "%; overflow-x: hidden}</style>");
    for(let i = 0; i < holes.length; i++){
        $("#holes").append("<th>" + (i + 1) + "</th>");
        emptyScores.push("<td></td>");
    }
    for(let i = 0; i < players.length; i++){
        table.append("<tr class='player'><td>" + players[i] + "</td>" + emptyScores + "</tr>");
    }
    table.append("<tr id='par'><td>PAR</td></tr>");
    for(let i = 0; i < holes.length; i++){
        $("#par").append("<td>" + holes[i] + "</td>");
    }
    turn(0, 0, players, holes);

}

function turn(player, hole, players, holes){
    let row = $("tbody").children().eq(player + 1);
    let cell = row.children().eq(hole + 1);
    row.css("background-color", "#FFFF00");
    cell.css("background-color", "#00FF00");
    cell.attr("contenteditable", "true");
    cell.css("white-space", "nowrap");
    cell.focus();

    row.children().eq(hole + 1).on("keydown", function (event) {
        if(event.keyCode === 13){
            event.preventDefault();
            cell.attr("contenteditable", "false");
            row.css("background-color", "#FFFFFF");
            cell.css("background-color", "unset");
            if(player === players.length - 1){
                turn(0, hole + 1, players, holes);
            }
            else{
                turn(player + 1, hole, players, holes);
            }
        }
    });
}