var a = {b: 'hello', c: {f: 'world'}};
var d = a;
d.b = 'hell';
d.c.parent = a;
console.log(a.c.parent.b);