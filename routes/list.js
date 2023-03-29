var express = require('express');
var router = express.Router();

const db = require('better-sqlite3')('./db/graduate.db');
const yaml = require('js-yaml');
const fs   = require('fs');

db.pragma('journal_mode = WAL');



/* GET home page. */
router.get('/', function(req, res, next) {
  
  // // let professors = db.prepare('SELECT * FROM professors').all();
  // let professors = db.prepare("SELECT DISTINCT p.name FROM professors p JOIN students s ON ',' || s.professor_ids || ',' LIKE '%,' || p.professor_id || ',%'").all();
  // professors = professors.map((p) => { return p.name; });
  
  // let departments = new Set();
  // let output = new Set();
  // for(ps of professors){
  //   let de = db.prepare('SELECT * FROM professors WHERE name  = ?').get(ps);
  //   // console.log(de);
  //   de.departments.split(',').forEach(departments.add, departments);
  //   output.add(de);
  // }
  // // let departments = professors
  // //                     .map(professor => professor.departments.split(',')) // split departments string into an array
  // //                     .flat() // flatten the nested arrays
  // //                     .map(department => department.trim()) // remove any leading/trailing spaces
  // //                     .filter((department, index, array) => array.indexOf(department) === index); // remove duplicates
  // // console.log(output);

  const doc = yaml.load(fs.readFileSync('./db/list.yml', 'utf8'));
  let output = doc['output'];
  let departments = doc['departments'];

  res.render('list', { title: 'Labook', professors: [...output], departments: [...departments] });
});

module.exports = router;
