var someObject = {
    'part1' : {
        'name': 'Part 1',
        'size': '20',
        'qty' : '50'
    },
    'part2' : {
        'name': 'Part 2',
        'size': '15',
        'qty' : '60'
    },
    'part3' : [
        {
            'name': 'Part 3A',
            'size': '10',
            'qty' : '20'
        }, {
            'name': 'Part 3B',
            'size': '5',
            'qty' : '20'
        }, {
            'name': 'Part 3C',
            'size': '7.5',
            'qty' : '20'
        }
    ]
};

var result;
var part1name = "part1.name";
var part2quantity = "part2.qty";
var part3name1 = "part3.0.name";
var pparr = [part1name, part2quantity, part3name1];

// Alnitak
Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    while (a.length) {
        var n = a.shift();
        if (n in o) {
            o = o[n];
        } else {
            return;
        }
    }
    return o;
};

console.time('Object.byString');
console.log(Object.byString(someObject, part1name));
console.log(Object.byString(someObject, part2quantity));
console.log(Object.byString(someObject, part3name1));
console.timeEnd('Object.byString');

// Felix King
function getProperty(obj, prop) {
    var parts = prop.split('.'),
        last = parts.pop(),
        l = parts.length,
        i = 1,
        current = parts[0];

    while((obj = obj[current]) && i < l) {
        current = parts[i];
        i++;
    }

    if(obj) {
        return obj[last];
    }
}

console.time('getProperty');
console.log(getProperty(someObject, part1name));
console.log(getProperty(someObject, part2quantity));
console.log(getProperty(someObject, part3name1));
console.timeEnd('getProperty');

// Shanimal
function _eval(obj, path) {
    try {
        return eval("obj." + path);
    } catch(e) {
        return undefined;
    }
}

console.time('eval');
for(var i = 0; i < 100; i++){
    console.log(_eval(someObject, part1name));
    console.log(_eval(someObject, part2quantity));
    console.log(_eval(someObject, "part3[0].name"));
}
console.timeEnd('eval');


// TheZver
/**
 * Retrieve nested item from object/array
 * @param {Object|Array} obj
 * @param {String} path dot separated
 * @param {*} def default value ( if result undefined )
 * @returns {*}
 */
function path(obj, path, def) {

    for(var i = 0,path = path.split('.'),len = path.length; i < len; i++){
        if(!obj || typeof obj !== 'object') return def;
        obj = obj[path[i]];
    }

    if(obj === 'undefined') return def;
    return obj;
}

console.time('path');
console.log(path(someObject, part1name));
console.log(path(someObject, part2quantity));
console.log(path(someObject, part3name1));
console.timeEnd('path');

// Spiegg

Object.resolve = function(path, obj) {
    return [obj || self].concat(path.split('.')).reduce(function(prev, curr) {
        return prev[curr];
    });
};

var a = [];

console.time('Object.resolve');
for(var i = 0; i < 100; i++){
    console.log(Object.resolve(part1name, someObject));
    console.log(Object.resolve(part2quantity, someObject));
    console.log(Object.resolve(part3name1, someObject));
}
console.timeEnd('Object.resolve');

console.time('notation');
for(var i = 0; i < 100; i++){
  for(var j = 0; j<pparr.length; j++) {
    var str = pparr[j].split(".");
    if (str.length === 1) {
      console.log(someObject[str[0]]);
    } else if (str.length === 2) {
      console.log(someObject[str[0]][str[1]]);
    } else if (str.length === 3) {
      console.log(someObject[str[0]][str[1]][str[2]]);
    }
  }
}
console.timeEnd('notation');
