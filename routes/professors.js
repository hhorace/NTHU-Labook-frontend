var express = require('express');
var router = express.Router();

const db = require('better-sqlite3')('./db/graduate.db');
db.pragma('journal_mode = WAL');


/* GET users listing. */
router.get('/:professor_name', function(req, res, next) {
  let professors = db.prepare('SELECT * FROM professors').all();
  professors = professors.map((p) => { return p.name; });

  let name = req.params.professor_name;
  if(professors.includes(name)){
    let sql = "SELECT * FROM students "+
              "JOIN professors ON (',' || students.professor_ids || ',') LIKE ('%,' || CAST(professors.professor_id AS TEXT) || ',%') "+
              `WHERE professors.name = '${name}'`+
              'ORDER BY CAST(students.graduate_year AS INT) DESC, students.date DESC';
    let result = db.prepare(sql).all();

    sql = "SELECT * FROM students "+
          "JOIN professors ON (',' || students.professor_ids || ',') LIKE ('%,' || CAST(professors.professor_id AS TEXT) || ',%') "+
          `WHERE professors.name = '${name}' AND students.note LIKE '%博' AND students.date NOT LIKE 'not found' AND students.period NOT LIKE '(竹教大學號無法計算)' `+
          "ORDER BY students.date ASC";
    let result_PHD = db.prepare(sql).all();
    let PHD_period_arr = result_PHD.map(e => { return parseFloat(e['period']) });
    let graph_data_PHD = result_PHD.map(e => {
      let date = e['date'].split('-');
      let yyyy = (parseInt(date[0]) < 1911) ? (parseInt(date[0])+1911).toString() : date[0];
      let mm = parseInt(date[1]).toString().padStart(2, '0');
      let dd =  parseInt(date[2]).toString().padStart(2, '0');
      return {x: `${yyyy}-${mm}-${dd}`, y: parseFloat(e['period'])}
    });
    graph_data_PHD.sort((a, b) => new Date(a.x) - new Date(b.x));

    sql = "SELECT * FROM students "+
          "JOIN professors ON (',' || students.professor_ids || ',') LIKE ('%,' || CAST(professors.professor_id AS TEXT) || ',%') "+
          `WHERE professors.name = '${name}' AND students.note NOT LIKE '%博' AND students.date NOT LIKE 'not found' AND students.period NOT LIKE '(竹教大學號無法計算)'  `+
          "ORDER BY students.date ASC";
    let result_master = db.prepare(sql).all();
    let master_period_arr = result_master.map(e => { return parseFloat(e['period']) });
    let graph_data_master = result_master.map(e => {
      let date = e['date'].split('-');
      let yyyy = (parseInt(date[0]) < 1911) ? (parseInt(date[0])+1911).toString() : date[0];
      let mm = parseInt(date[1]).toString().padStart(2, '0');
      let dd =  parseInt(date[2]).toString().padStart(2, '0');
      return {x: `${yyyy}-${mm}-${dd}`, y: parseFloat(e['period'])}
    });
    graph_data_master.sort((a, b) => new Date(a.x) - new Date(b.x));
    // console.log(graph_data_master);

    let graph_data = {master: graph_data_master, PHD: graph_data_PHD};


    let keyword_c_obj = result.map(e=>{return e['keyword_c']})
                              .map(e=>{return e.split('、')})
                              .flat()
                              .reduce((cnt, cur) => (cnt[cur] = cnt[cur] + 2 || 1, cnt), {});
    
    let keyword_e_obj = result.map(e=>{return e['keyword_e']})
                              .map(e=>{return e.split('、')})
                              .flat()
                              .join(' ')
                              .toUpperCase()
                              .split(' ')
                              .reduce((cnt, cur) => (cnt[cur] = cnt[cur] + 1 || 1, cnt), {});
    let merge_obj = {
        ...keyword_c_obj,
        ...keyword_e_obj
    };

    let sort_keyword_e_arr = Object.keys(merge_obj)
                                    .map((key) => [key, merge_obj[key]])
                                    .filter(n => n[1] > 1);
    
    while (sort_keyword_e_arr.length<30){
      let keys = Object.keys(merge_obj).map((key) => [key, merge_obj[key]]).filter(n => n[1] == 1);
      let random = keys.length * Math.random() << 0;
      sort_keyword_e_arr.push([keys[random][0], 2]); // make 1s to 2, s.t. font-size in cloud belance
    }                               
    
    sort_keyword_e_arr.sort(function(i, j) { return i[1] - j[1]; });

    res.render('professor', { 
      title: name, 
      result: result,
      PHD_period_arr: PHD_period_arr,
      master_period_arr: master_period_arr,
      data: graph_data,
      sort_keyword_e_arr: sort_keyword_e_arr
    });
  }
  else
    res.send('Professor not found');
});

module.exports = router;
