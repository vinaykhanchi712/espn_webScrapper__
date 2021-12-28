const request= require("request");
const cheerio= require("cheerio");
const ScorecardObj= require("./scorecard")

function getAllMatchesLink(url){
    request(url,function(err,response,html){
        if(err){
            console.log(err);
        }
        else{
            extractScoreLink(html);
        }
    })
}
function extractScoreLink(html){
    let $= cheerio.load(html);
    let scorecardEle=$("a[data-hover='Scorecard']");
    for( let i=0;i<scorecardEle.length;i++){
        let link=$(scorecardEle[i]).attr("href");
        let fullLink= "https://www.espncricinfo.com"+link;
        //console.log(fullLink);
        ScorecardObj.ps(fullLink);


    }

}

module.exports = {
    gAlmatch:getAllMatchesLink
}