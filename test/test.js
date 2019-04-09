// function fun2(){
//     console.log('hello world');
// }
// function fun3(){    
//     b.addEventListener('click', fun2);
// }
// function fun1(){
//        fun3()
// }
// var a = document.getElementById('test1');
// var b = document.getElementById('test2');
// var c = document.getElementById('test3');
// var fun4 = fun1;
// a.onclick = fun4;
// c.onclick = function(evt){
//     b.removeEventListener('click', fun2);
// }
function fun1(){
    console.log('hello world');
}
document.addEventListener.call(a, 'click', fun1);
document.addEventListener.apply(a, ['click', fun1]);