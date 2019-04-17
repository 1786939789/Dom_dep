console.time('time');
var fs = require('fs');
var fileName = '../test/test.js';

var code = fs.readFileSync(fileName).toString();

var stage1 = require('./stage1');
var stage2 = require('./stage2');
var stage3 = require('./stage3');
var cfgRelated = require('./cfg');

// run stage1 and make normalized code
var normalized = stage1.phase0(code);
// console.log(normalized);
// buid CFG using JS_WALA
var cfg = cfgRelated.makeCFG(normalized);
// build dominator tree using JS_WALA
cfgRelated.buildDominatorTrees(cfg, true);
// get facts and dep analysis
var facts = stage2.GetFacts(cfg);
stage3.DomDepAnalysis(facts);
console.timeEnd('time');