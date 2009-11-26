function currency(value, digits) {
	value = value || 0;
	digits = digits || 2;
	
	var multiplier = Math.pow(10, digits);
	
	return '$' + (Math.round( value * multiplier) / multiplier).toFixed(digits);
}