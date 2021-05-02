var randomAlgorithm = function(){
	var simple = new simpleAlgorithm();
	simple.onEvict = function(){
		return Math.floor(Math.random()*pageSlotsInRAM());
	}
	simple.name="Random";
	return simple;
}();
