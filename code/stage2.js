var fs = require('fs');
// Breadth-First Traversal----设置父亲节点
function BreadthTraversal(tree){
    var queue = [], parentNode = null, node = tree;
    node.parent = parentNode;
    queue.push(node);
    while(queue.length > 0){
        node = queue.shift();
        parentNode = node;
        if(!node || node.type === undefined)    continue;   //叶子节点
        var traver = travers[node.type];
        // 子节点入队
        if(Array.isArray(traver)){
            for(var t of traver){
                if(Array.isArray(node[t])){
                    for(var n of node[t]){
                        n.parent = parentNode;
                        queue.push(n);
                    }
                }else{
                    if(!node[t])   continue;
                    node[t].parent = parentNode;
                    queue.push(node[t]);
                }
            }
        }else{
            if(Array.isArray(node[traver])){
                for(var n of node[traver]){
                    n.parent = parentNode;
                    queue.push(n);
                }
            }else{
                if(!node[traver])   continue;
                node[traver].parent = parentNode;
                queue.push(node[traver]);
            }
        }
    }
}
// Depth-First Traversal---且从左向右遍历
function DepthTraversal(node){
    var stack = [], returnArr = [];
    stack.push(node);
    while(stack.length > 0){
        var node = stack.pop();
        if(!node || node.type === undefined){ //叶子节点
            returnArr.push(node);
            continue;
        }else if(node.type === 'BlockStatement'){
            return returnArr;
        }
        var traver = travers[node.type];
        // 子节点入栈
        if(Array.isArray(traver)){
            for(var i=traver.length-1; i>=0; --i){
                var t = traver[i];
                if(Array.isArray(node[t])){
                    for(var j=node[t].length-1; j>=0; --j){
                        stack.push(node[t][j]);
                    }
                }else{
                    stack.push(node[t]);
                }
            }
        }else{
            if(Array.isArray(node[traver])){
                for(var i=node[traver].length-1; i>=0; --i){
                    stack.push(node[traver][i]);
                }
            }else{
                stack.push(node[traver]);
            }
        }
        if(node.type === 'MemberExpression'){
            returnArr.push('|');
        }
    } 
    return returnArr;
}
// 获取最外层函数
function GetOuterFuntion(node){
    while(node.parent){
        if(node.parent.type === 'FunctionDeclaration'){
            return node.parent.id.name;
        }
        node = node.parent;
    }
    return '';
}
// 判断是否为js事件
function isEvent(name){
    for(var i in eventList){
        if(name === eventList[i] || name === 'on'+eventList[i])   
            return true;
    }
    return false;
}
// 遍历array从0至index处，找到最初值
function GetOriginalValue(array, index, oldValue){
    var status = 1; //0-无变化 1-新值变化
    var i = 0, newValue = oldValue;
    while(status){
        status = 0;
        for(var i=0; i <= index; ++i){
            if(array[i].Assign != undefined && array[i].Assign[0] === newValue){
                newValue = array[i].Assign[1];
                status = 1;
            }
        }
    }
    return newValue;
}
// Print all facts by traversing CFG-tree
//访问下级
var travers = {
    'Program': 'body', 
    'VariableDeclaration': 'declarations', 
    'VariableDeclarator': ['id', 'init'], 
    'Identifier': 'name',
    'CallExpression': ['callee', 'arguments'], 
    'MemberExpression': ['object', 'property'],
    'Literal': 'value', 
    'ExpressionStatement': 'expression', 
    'AssignmentExpression': ['left', 'right'], 
    'FunctionExpression': ['params', 'body'],
    'BlockStatement': 'body',
    'ObjectExpression': 'properties',
    'Property': ['key', 'value'], 
    'ForStatement': ['init', 'test', 'update', 'body'], 
    'UpdateExpression': ['operator', 'argument'],
    'BinaryExpression': ['operator', 'left', 'right'],
    'WhileStatement': ['test', 'body'],
    'DoWhileStatement': ['body', 'test'],
    'SwitchStatement': ['disscriminant', 'cases'],
    'SwitchCase': ['test', 'consequent'],
    'BreakStatement': 'label',
    'ReturnStatement': 'argument',
    'FunctionDeclaration': ['id', 'params', 'body'],
    'IfStatement': ['test', 'consequent', 'alternate'],
    'NewExpression': ['callee', 'arguments'],
    'LogicalExpression': ['left', 'right'],
    'UnaryExpression': 'argument',
    'ArrayExpression': 'elements'
}
// 事件
var eventList = ['click', 'dbclick','keypress', 'keydown', 'keyup'
                , 'hover', 'submit', 'change', 'focus', 'blur'
                , 'Store', 'resize', 'scroll', 'unload', 'mousedown'
                , 'mousemove', 'mouseout', 'mouseover', 'mouseup'];
module.exports = {
    GetFacts: function(cfg){
        var facts = []; //事实
        var stack = []; //存放节点，用于深度搜索遍历
        stack.push(cfg);
        //深度遍历
        BreadthTraversal(cfg); //预处理，添加父节点
        while(stack.length > 0){
            var node = stack.pop();
            if(!node || node.type === undefined)    continue;
            var traver = travers[node.type];
            // 子节点入栈
            if(Array.isArray(traver)){ //多个子节点，下同
                for(var i=traver.length-1; i>=0; --i){
                    var t = traver[i];
                    if(Array.isArray(node[t])){
                        for(var j=node[t].length-1; j>=0; --j){
                            stack.push(node[t][j]);
                        }
                    }else{
                        stack.push(node[t]);
                    }
                }
            }else{ //单个子节点
                if(Array.isArray(node[traver])){
                    for(var i=node[traver].length-1; i>=0; --i){
                        stack.push(node[traver][i]);
                    }
                }else{
                    stack.push(node[traver]);
                }
            }
            // 当前生成facts
            if(node.type === 'AssignmentExpression' || node.type === 'VariableDeclarator'){ 
                var returnArr = DepthTraversal(node), arr = [];
                if(returnArr[2] === 'document' && returnArr[3] === 'getElementById'){ //Dom
                    arr = [returnArr[0], returnArr[4]];
                    facts.push({Dom: arr});
                }else{
                    if(returnArr.length >= 3){ //Store || Load
                        if(returnArr[0] === '|'){ //Load
                            arr = [returnArr[1], returnArr[2], returnArr[3], GetOuterFuntion(node)];
                            // arr[2] = GetOriginalValue(facts, facts.length-1, arr[2]);
                            facts.push({Load: arr});
                        }else if(returnArr[1] === '|'){ //Store
                            arr = [returnArr[0], returnArr[2], returnArr[3], GetOuterFuntion(node)];
                            facts.push({Store: arr});
                        }
                    }else{ //Assign
                        arr = returnArr;
                        // arr[1] = GetOriginalValue(facts, facts.length-1, arr[1]);
                        facts.push({Assign: arr});
                    }
                }
            }else if(node.type === 'FunctionDeclaration'){
                var returnArr = DepthTraversal(node), arr = {FunDecl: [], Formal: []};
                var outerFuntionName = GetOuterFuntion(node);
                arr.FunDecl = [returnArr[0], outerFuntionName];
                for(var i=1; i<returnArr.length; ++i){
                    var formal = [i, returnArr[i]];
                    arr.Formal.push(formal);
                }
                facts.push(arr);
            }else if(node.type === 'CallExpression'){
                var returnArr = DepthTraversal(node), arr = {Call: [], Actual: []};
                var outerFuntionName = GetOuterFuntion(node);
                if(returnArr[0] === '|'){
                    arr.Call = [returnArr[1], returnArr[2], outerFuntionName];
                    for(var i=3; i<returnArr.length; ++i){
                        var actual = [i-2, returnArr[i]];
                        arr.Actual.push(actual);
                    }
                }else{
                    arr.Call = [null, returnArr[0], outerFuntionName];
                    for(var i=1; i<returnArr.length; ++i){
                        var actual = [i, returnArr[i]];
                        arr.Actual.push(actual);
                    }
                }
                facts.push(arr);
            }
        } 
        // 遍历基础facts得到事件绑定与解绑facts
        for(var i=0; i<facts.length; ++i){
            if(facts[i].Load != undefined && isEvent(facts[i].Load[1])){ //a.onclick=fun;
                if(facts[i].Load[2] === null){ //解绑
                    facts.splice(i+1, 0, {DomRemove: [facts[i].Load[0], facts[i].Load[1].slice(2), facts[i].Load[2], facts[i].Load[3]]});
                }else{
                    facts.splice(i+1, 0, {DomInstall: [facts[i].Load[0], facts[i].Load[1].slice(2), facts[i].Load[2], facts[i].Load[3]]});
                }
            }else if(facts[i].Call != undefined && (facts[i].Call[1].slice(3) === 'EventListener' || facts[i].Call[1].slice(6) === 'EventListener') && isEvent(facts[i].Actual[0][1])){ //a.addEventListener()
                if(facts[i].Call[1].slice(0, 3) === 'add'){ //绑定
                    facts.splice(i+1, 0, {DomInstall: [facts[i].Call[0], facts[i].Actual[0][1], facts[i].Actual[1][1], facts[i].Call[2]]});
                }else{
                    facts.splice(i+1, 0, {DomRemove: [facts[i].Call[0], facts[i].Actual[0][1], facts[i].Actual[1][1], facts[i].Call[2]]});
                }
            }
        }
        fs.writeFileSync('facts.txt', JSON.stringify(facts));
        return facts;
    }
}