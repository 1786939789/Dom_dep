// 获取对象所绑定的Dom元素id
function GetDom(array, objectName){    
    for(var i=0; i<array.length; ++i){
        if(array[i].Dom != undefined && array[i].Dom[0] === objectName){
            return array[i].Dom[1];
        }
    }
    return objectName;
}
// 是否函数嵌套调用引起绑定或解绑依赖
function IsNestCall(array, functionName1, functionName2){
    var i = 0;
    while(true){
        for(i=0; i<array.length; ++i){
            if(array[i].Call != undefined){
                if(array[i].Call[1] === functionName1 && array[i].Call[2] === functionName2)    
                    return true;
                else if(array[i].Call[1] === functionName1){
                    functionName1 = array[i].Call[2];
                    break;
                }
            }
        }
        if(i === array.length)  return false;
    }
}
// functionName1 = funtionName2  -from 0 to index
function IsEqual(array, functionName1, functionName2, index){
    if(functionName1 === functionName2) return true;
    var tempFunctionName = [functionName1, ''], flag = true, lastIndex=0;
    while(flag){
        flag = false;
        for(var i=0; i<index; ++i){
            if(array[i].Assign != undefined && array[i].Assign[0] === tempFunctionName[0] && tempFunctionName[1] === ''){
                tempFunctionName = [array[i].Assign[1], ''];
                flag = true;
                lastIndex = i;
            }else if(array[i].Store != undefined && array[i].Store[0] === tempFunctionName[0]){
                tempFunctionName = [array[i].Store[1], array[i].Store[2]];
                flag = true;
                lastIndex = i;
            }else if(array[i].Load != undefined && array[i].Load[0] === tempFunctionName[0] && array[i].Load[1] === tempFunctionName[1]){
                tempFunctionName = [array[i].Load[2], ''];
                flag = true;
                lastIndex = i;
            }
        }
        index = lastIndex;
        if(tempFunctionName[0] === functionName2)   return true;
    }
    return false;
    
} 
// 输出绑定或者解绑依赖关系
function PrintDep(o1, e1, o2, e2, dep){
    console.log('===============================');
    console.log(o1);
    console.log(e1);
    console.log(o2);
    console.log(e2);
    console.log(dep);
}
module.exports = {
    DomDepAnalysis: function(facts){
        // 遍历所有事实获取绑定和解绑依赖 DomInstall(o1, e1, fun1, fun2);DomInstall(o2, e2, fun3, fun4);
        for(var i=0; i<facts.length; ++i){
            if(facts[i].DomInstall != undefined || facts[i].DomRemove != undefined){
                var array = facts[i].DomInstall || facts[i].DomRemove; 
                var funcLocation = array[3]; //绑定或者解绑所在的函数内部
                for(var j=0; j<facts.length; ++j){
                    if(facts[j].DomInstall != undefined && IsNestCall(facts, array[3], facts[j].DomInstall[2])){ //fun4 in fun1
                        PrintDep(GetDom(facts, facts[j].DomInstall[0]), facts[j].DomInstall[1], GetDom(facts, array[0]), array[1], facts[i].DomInstall===undefined?'Remove':'Install');
                    }else if(facts[j].DomInstall != undefined && IsEqual(facts, facts[j].DomInstall[2], funcLocation, j)){ //fun1 = fun4
                        PrintDep(GetDom(facts, facts[j].DomInstall[0]), facts[j].DomInstall[1], GetDom(facts, array[0]), array[1], facts[i].DomInstall===undefined?'Remove':'Install');
                    }
                }
            }
        }
    }
}