//const url="https://www.espncricinfo.com/series/ipl-2020-21-1210595/mumbai-indians-vs-chennai-super-kings-1st-match-1216492/full-scorecard";
const request= require("request");
const cheerio= require("cheerio");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");


// venue date opponent runs balls fours sixes
function processScorecard(url){
    request(url,cb);
} 

function cb(err,response,html){
    if(err){
        console.log(err);
    }
    else{
        extractMatchDetail(html);
    }
}
function extractMatchDetail(html){
    let $=cheerio.load(html);
    let date = $(".header-info .description");
    let result = $(".match-header-container .status-text");
    //console.log(date.text());
    //console.log(result.text());
    let stringArr= date.text().split(",");
    let venue= stringArr[1].trim();
    let d= stringArr[2].trim();
    result= result.text();

    let innings= $(".card.content-block.match-scorecard-table .Collapsible");
    //let htmlstring= "";
    for(let i=0;i<innings.length;i++){
        //htmlstring += $(innings[i]).html();
        let teamName= $(innings[i]).find("h5").text();
        teamName= teamName.split("INNINGS")[0].trim();
        let oidx= i==0?1:0;
        let opName= $(innings[oidx]).find("h5").text();
        opName= opName.split("INNINGS")[0].trim();
        //console.log(`${venue}| ${d} | ${teamName} | ${opName} | ${result}`);
        let cInning= $(innings[i]);
        let allRows =cInning.find(".table.batsman tbody tr");
        for(let j=0;j<allRows.length;j++){
            let allCol=$(allRows[j]).find("td");
            let isWorthy=$(allCol[0]).hasClass("batsman-cell");

            if(isWorthy==true){
                //console.log(allCol.text());
                let playerName=$(allCol[0]).text().trim();
                let runs= $(allCol[2]).text().trim();
                let balls= $(allCol[3]).text().trim();
                let fours= $(allCol[5]).text().trim();
                let sixes= $(allCol[6]).text().trim();
                let sr= $(allCol[7]).text().trim();

                console.log(`${playerName}| ${runs}| ${balls}| ${fours} ${sixes}| ${sr}`);
                processPlayer(teamName , playerName ,runs,balls,fours,sixes,sr,opName,venue,d,result);
            }
        }
    }
    //console.log(htmlstring);

    
}
function processPlayer(teamName , playerName ,runs,balls,fours,sixes,sr,opName,venue,d,result){
    let teamPath= path.join(__dirname,"ipl",teamName);
    dirCreater(teamPath);
    let filePath= path.join(teamPath,playerName+ ".xlsx");
    let content= excelReader(filePath,playerName);
    let playerObj={
        teamName,
        playerName,
        runs,
        balls,
        fours,
        sixes,
        sr,
        opName,
        venue,
        d,
        result
    }
    content.push(playerObj);
    excelwriter(filePath,content,playerName);


}
function dirCreater(filePath){
    if(fs.existsSync(filePath)==false){
        fs.mkdirSync(filePath);
    }

}
function excelwriter(filePath,json,sheetName){
    let newWB= xlsx.utils.book_new();
    let newWS= xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB,newWS,sheetName);
    xlsx.writeFile(newWB,filePath);
}

function excelReader(filePath,sheetName){
    if(fs.existsSync(filePath)==false){
        return [];
    }
    let wb= xlsx.readFile(filePath);
    let excelData= wb.Sheets[sheetName];
    let ans= xlsx.utils.sheet_to_json(excelData);
    return ans;
}


module.exports={
    ps:processScorecard
}