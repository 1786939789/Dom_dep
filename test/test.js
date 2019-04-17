var a = document.getElementById('test1');
var b = document.getElementById('test2');
function fun1(){
    console.log('hello world');
}
var c = {
    fun: function(){
        b.addEventListener('click', fun1);
    }
}
a.onclick = c.fun;