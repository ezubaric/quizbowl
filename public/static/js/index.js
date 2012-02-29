var baseURL = "http://ec2-50-19-22-175.compute-1.amazonaws.com:80/api";


var searchData;
var searchInMiddle = true;
var curOffset;
var dao;
var loginToggled = false;
bridge = new Bridge({host: '50.19.22.175', port: 8091, apiKey: "abcdefgh"});
  bridge.ready(function(){
    console.log("bridge ready");
    bridge.getService('dao',function(obj){
      console.log("dao ready");
      window.dao = obj;
      dao = obj;
    });
    bridge.joinChannel('ticker',{push:function(obj){
      console.log(obj);
      }});
  });
$(document).ready( function() {
  $("#loginBox").hide();
  $("#login").click(function(){
      console.log("toggle");
      $("#loginBox").toggle();
      loginToggled = true;
    });
  /*$('body').click(function(e) {
    if (!($(e.target).is("#loginBox")||$(e.target).is("#login"))) {
      $("#loginBox").hide();
    }
  });*/
  $("#home-search-input").keypress( function(event) {
    if (event.which == 13) {
      homeSearch({'offset':0,answer: $("#home-search-input").val()});
    }
  });

  $("#home-search-button").click( function() {homeSearch({'offset':0,answer: $("#home-search-input").val()}) });

  loadAdvancedSearch();


});

var homeSearch = function(obj) {
  $("#home-search-loading").css("visibility", "visible");
  var params = parseSearch(obj.answer);
  $('body,html').animate({scrollTop: 0});
  params.offset = obj.offset;
  search(params);
}
var search = function(params) {
  dao.search(params,
  //jQuery.getJSON(baseURL + "/tossup.search?callback=?",params ,
  function(response) {
    $("#home-search-loading").css("visibility", "hidden");
    if(searchInMiddle) {
      homeMoveSearchToTop();
      $("#home-result-refine").css("visibility", "visible");
      $("#home-results-wrapper").css("visibility", "visible");
      $("#home-form").append('<div id="home-advance-search"><a>Advanced Search</a></div>');
      $("#home-advance-search").click(openAdvanceSearch);
    }
    homeLoadResults(response);
  });
}
var POSSIBLE_PARAMS=["year", "tournament", "difficulty", "round","category", "random", "limit", "answer", "question", "condition"];
var parseSearch = function(answer){
  var parameters = {};
  var terms = answer.trim();
  term = /[a-zA-Z]+:/g;
  params = terms.split(term);
  if (params.length > 1)
    for (i = 0; i < params.length; i++) {
      value = params[i].trim();
      if (value != "" && value.length != 0) {
        param = terms.substring(0, terms.indexOf(":"))
          .trim();
        if (POSSIBLE_PARAMS.indexOf(param)!=-1) {
          if (value.match('".*".*')) {

            value = value.substring(1, value.indexOf("\"", 1));
            terms = terms.substring(terms.indexOf("\"",
                  terms.indexOf(value)) + 1);
          } else {
            if (value.indexOf(" ") != -1) {

              value = value.substring(0, value.indexOf(" "));

              terms = terms.substring(terms.indexOf(" ",
                    terms.indexOf(value)));

            } else {
              terms = terms.substring(terms.indexOf(value)
                  + value.length);

            }

          }

          parameters[param] = value.trim();
        }
      }
    }
  if (parameters.answer === undefined)
    parameters.answer = terms;
  return parameters;
}

var homeMoveSearchToTop = function() {
  $("#home-title").css('margin', '26px 40px')
    .css('font-size', '34px')
    .css('float', 'left')
    .css('text-shadow', '2px 2px 4px rgba(0, 0, 0, .25), 0px -3px 4px white');
  $("#home-form").css('float', 'left')
    .css('margin', '17px 0')
    $("#home-search-field").css('float', 'left')
    .css('padding-top', '4px')
    .css('margin', '0 5px 0 10px');
  $("#home-search-button").css('float', 'left')
    .css('margin', '3px 0');
  $("#home-form").css('width', '850px');
  searchInMiddle = false;
};

var homeLoadResults = function(response) {
  curOffset = parseInt(response.offset);
  results = response.results;
  var resultContainer = $("#home-results");
  resultContainer.html("");
  var resultDiv, curResult, info, source;
  var start, end, count;
  count = response.count;
  if( results.length == 0) {
    resultContainer.html("There were no results for your query.");
  } else {
    start = parseInt(parseInt(response.offset) + 1);
    end = parseInt(parseInt(response.offset) + results.length);
    resultContainer.append('<div id="home-result-quantity">Displaying '+ start +"-"+end+' results of '+count+'</div>');
  }
  for(var i = 0; i < results.length; i++) {
    var curResult = results[i];
    var r = results;
    resultContainer.append('<div id="home-result' + i + '" class="home-result"></div>');
    resultDiv = $("#home-result" + i);
    resultDiv.append('<div class="home-result-source"></div>');
    resultDiv.append('<div class="home-result-info"></div>');
    source = $('#home-result'+i+" .home-result-source");
    source.append('<span class="home-result-year">'+curResult.year+" </span>");
    source.append('<span class="home-result-tournament">'+curResult.tournament+": </span>");
    source.append('<span class="home-result-round">'+curResult.round+",  </span>");
    source.append('<span class="home-result-question-num">Question #'+curResult.question_num+"</span>");

    var rating = curResult.rating == null ? 0 : curResult.rating;


    info = $("#home-result" + i + " .home-result-info");
    info.append('<span class="home-result-category" id = "category'+i+'"><a>'+curResult.category + ' </a></span>');
    (function(){
      var x = i;
    $("#category"+x).click(function(){
      $("#home-search-input").val("category:\""+r[x].category+"\"");
      homeSearch({offset:0,answer:$("#home-search-input").val()});
    });
    info.append('<span class="home-result-difficulty" id = "difficulty'+i+'"><a>'+curResult.difficulty+' </a></span>');
    $("#difficulty"+x).click(function(){
      $("#home-search-input").val("difficulty:\""+r[x].difficulty+"\"");
      homeSearch({offset:0,answer:$("#home-search-input").val()});
    });
    })();
    resultDiv.append('<div class="home-result-question">'+curResult.question+'</div>');
    resultDiv.append('<div class="home-result-answer">Answer: '+curResult.answer+'</div>');
  }
  if( start-1 > 0 ) {
    resultContainer.append('<div id="home-result-back"><a>Back</a></div>');
    $('#home-result-back').click(function() {
      homeSearch({offset:curOffset-10,answer:$("#home-search-input").val()});;
    }); 
  }

  if( end < count) { 
    resultContainer.append('<div id="home-result-next"><a>Next</a></div>');
    $('#home-result-next').click(function() {
      homeSearch({offset:curOffset+10,answer:$("#home-search-input").val()}); 
    });
  }

};


var openAdvanceSearch = function() {
  $("#home-advance").css("visibility", "visible");
  $("#home-advance").css("opacity", 0);
  $("#home-advance").animate({"height": "130px", "opacity": 1});
};

var loadAdvancedSearch = function() {
  jQuery.getJSON(baseURL+"/data?callback=?", function(e) {
    searchData = e.data;
    for( var x = 0; x < searchData.categories.length; x++) {
      $("#home-advance-category").append("<option>"+searchData.categories[x]+"</option>");
    }

    for(var x = 0; x < searchData.difficulties.length; x++) {
      $("#home-advance-difficulty").append("<option>"+searchData.difficulties[x]+"</option>");
    }

    for(var x = 0; x < searchData.years.length; x++) {
      $("#home-advance-year").append("<option>"+searchData.years[x]+"</option>");
    }

    for(var x = 0; x < searchData.tournaments.length; x++) {
      $("#home-advance-tournament").append("<option>"+searchData.tournaments[x]+"</option>");
    }
  });

};
