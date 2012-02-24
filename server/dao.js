var Client = require('mysql').Client;
var client = new Client();
var Dao = function(host, user, password, database){
  client.host = host;
  client.user = user;
  client.password = password;
  client.database = database;
  this.search = function(obj, callback) {
    var query = "";
    if (obj['condition']!==undefined && obj['answer']!==undefined){
      if (obj['condition']=="all"){
        query += "(t.answer like '%" + obj['answer'].replace(/ /g,'%') +"%' or t.question like '%" + obj['answer'].replace(/ /g,'%')+"%')";	
      }
    } else {
      if (obj['answer']!==undefined){
        query += "(t.answer like '%" + obj['answer'].replace(/ /g,'%')+"%')";
      } else {
        query += "(t.answer like '%%')";
      }
      if (obj['question'] !== undefined){
        query += " and (t.question like '%" + obj['question'].replace(/ /g,'%') + "%')";
      }
    }
    if (obj['tournament']!==undefined){
      query = add_query_term(query,'t.tournament',obj['tournament'],'like');
    }
    if (obj['round']!==undefined){
      query = add_query_term(query,'t.round',obj['round'],'like');
    }
    if (obj['year']!==undefined){
      query = add_query_term(query,'t.year',obj['year'],'=');
    }
    if (obj['category']!==undefined){
      query = add_query_term(query,'t.category',obj['category'],'like');
    }
    if (obj['questionNum']!==undefined){
      query = add_query_term(query,'t.question_num',obj['questionNum'],'like');
    }
    if (obj['difficulty']!==undefined){
      query = add_query_term(query,'t.difficulty',obj['difficulty'],'like');
    }
    query += " group by t.pKey";
    if (obj['random']!==undefined){
      if (obj['random']=='true'){
        if (obj['limit']!==undefined){
          query += " order by rand() limit "+obj['limit'];
        } else {
          query += " order by rand() limit 1";
        }
      }
    } else {	
      if (obj['limit']!==undefined){
        query += " limit "+obj['limit'];
      } else {
        query += " order by year desc, tournament asc, round asc,question_num asc";
      }
    }
    if (obj['username']!==undefined){
      querystring = 'select t.tournament,t.year,t.question, t.answer, t.round, t.question_num, t.difficulty, t.pKey,t.category, t.accept, sum(r.rating) rating,(select rating from ratings where user="'+obj['username']+'" and question=t.pKey) user_rating from tossups t left outer join ratings r on t.pKey = r.question where '+query;
    } else {
      querystring = 'select t.tournament,t.year,t.question, t.answer, t.round, t.question_num, t.difficulty, t.pKey,t.category, t.accept, sum(r.rating) rating from tossups t left outer join ratings r on t.pKey = r.question where '+query;
    }
    client.query(querystring,function selectCb(err,results,fields){
        if (!err) {
        callback(results);
        } else{ 
        callback(err);
        }
        });
  }
}
var util = {
escapeSql:function(str) {
            return str;
          }
}
exports.Dao = Dao;