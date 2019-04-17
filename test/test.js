function fun2(){
    console.log('hello world');
}
var a = document.getElementById('test1');
var b = document.getElementById('test2');
var c = {
    fun1: function(){
        b.addEventListener('click', fun2);
    }
}
a.onclick = c.fun1;