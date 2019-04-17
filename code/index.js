var fs = require('fs');
var stage1 = require('./stage1');
var stage2 = require('./stage2');
var stage3 = require('./stage3');
var cfgRelated = require('./cfg');
var benchmarks = ['case1', 'case2', 'case3', 'case4', '3dmodel', 
                'ball_pool', 'chinabox', 'cosmos', 'cubuild', 'frog',
                'fullhouse', 'gallony', 'hanoi', 'harehound', 'lady',
                'match', 'pearlski', 'sokoban', 'speedyeater', 'wormy'];
for(var i=0; i<benchmarks.length; ++i){
    console.log(benchmarks[i])
    var start = Date.now();
    var fileName = '../benchmarks/' + benchmarks[i] + '/index.js';
    var code = fs.readFileSync(fileName).toString();    //get code
    var normalized = stage1.phase0(code);   //normalized code
    var cfg = cfgRelated.makeCFG(normalized);   // buid CFG using JS_WALA
    cfgRelated.buildDominatorTrees(cfg, true);  // build dominator tree using JS_WALA
    var facts = stage2.GetFacts(cfg);   // get facts
    stage3.DomDepAnalysis(facts);   //dep analysis
    var end = Date.now();
    var duration = (end - start) / 1000;
    console.log(duration + 's');
}