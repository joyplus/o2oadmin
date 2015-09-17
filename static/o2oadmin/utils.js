function numberFormater(val, row) {
    if (val > 0) {
        return (val * 100).toFixed(2);
    }

    return 0;
}

function adDateFormatter(value) {
    var d = new Date(value);
    return d.format('yyyy-MM-dd');
}

$.fn.datebox.defaults.formatter = function(date){
    var y = date.getFullYear();
    var m = date.getMonth()+1;
    var d = date.getDate();
    //return m+'/'+d+'/'+y;
    return y + '-' + m + '-' + d;
}

$.fn.datebox.defaults.parser = function(s){
    if (!s) return new Date();
    var ss = (s.split('-'));
    var y = parseInt(ss[0],10);
    var m = parseInt(ss[1],10);
    var d = parseInt(ss[2],10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)){
        return new Date(y,m-1,d);
    } else {
        return new Date();
    }
}