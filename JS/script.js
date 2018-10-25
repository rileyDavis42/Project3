//JavaScript

function initiate(players, holes){
    let emptyScores = ["<td></td>"];
    let width = 100 / (holes.length + 1);
    let table = $("#table");
    let holesArr = $("#holes");
    $('head').append("<style>th,tr,td{width: " + width + "%; overflow-x: hidden}</style>");
    for(let i = 0; i < holes.length; i++){
        holesArr.append("<th>" + (i + 1) + "</th>");
        emptyScores.push("<td></td>");
    }
    holesArr.append("<th>Total</th>");
    for(let i = 0; i < players.length; i++){
       table.append("<tr class='player'><td>" + players[i] + "</td>" + emptyScores + "</tr>");
    }
    table.append("<tr id='par'><td>PAR</td></tr>");
    let par = $("#par");
    for(let i = 0; i < holes.length; i++){
        par.append("<td>" + holes[i] + "</td>");
    }
    par.append("<td></td>");
    turn(0, 0, players, holes);

}
function turn(player, hole, players, holes){
    let row = $("tbody").children().eq(player + 1);
    let cell = row.children().eq(hole + 1);
    cell.empty();
    row.css("background-color", "#FFFF00");
    cell.attr("contenteditable", "true");
    cell.css("white-space", "nowrap");
    cell.focus();

    row.children().eq(hole + 1).on("keydown", function (event) {
        if(event.keyCode === 13 || event.keyCode === 9){
            event.preventDefault();
            if(isNaN(cell.html())){
                turn(player, hole, players, holes);
            }

            else{
                let updatePlayers = "['" + players[0] + "'";
                let par = holes[hole];
                let score = cell.html() - par;
                let val = "pos";
                if(score <= 0){
                    val = "neg";
                }
                cell.html(cell.html() + " | <span class='" + val + "'>" + score + "</span>");

                row.css("background-color", "#FFFFFF");
                cell.css("background-color", "unset");
                for(let i = 1; i < players.length; i++){
                    updatePlayers = updatePlayers + ", '" + players[i] + "'";
                }
                updatePlayers = updatePlayers + "]";
                cell.attr("onclick", "turn(" + player + ", " + hole + ", " + updatePlayers + ", " + holes.toString() + ")");

                if(player === players.length - 1){
                    turn(0, hole + 1, players, holes);
                }
                else{
                    turn(player + 1, hole, players, holes);
                }
            }
        }
    });
}