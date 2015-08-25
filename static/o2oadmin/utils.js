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