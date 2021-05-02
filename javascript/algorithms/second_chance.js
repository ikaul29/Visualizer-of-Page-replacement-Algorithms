var eventlist = [];

var second_chance = function(){
	var simple = new simpleAlgorithm();
	simple.name = "Second Chance";
	var defaultOnEvent = simple.onEvent;
	
	simple.onEvict = function() {
	    while(true) {
	        var count = getFlag(eventlist[0],"count",0);
		console.log(" count ", count," events ", eventlist);
	        if (count > 0) {
	            var tmp = eventlist[0];
	            eventlist.shift();
	            eventlist.push(tmp);
	            setFlag(tmp, "count",0);
	        } else {
	            var tmp = eventlist[0];
	            eventlist.shift();

		    /*var pages = getPagesInRAM();
	            var z = findRAMPageById(tmp);
	            for(i in pages) {
	                if (pages[i] == z) {
	                    return parseInt(i);
	                }
	            }*/
		    
		    //maybe better
		    var result = findRAMSlotByPageId(tmp);
		    //page still exists
		    if(result!=-1){
	            	return result;
		    }
	        }
	    }
	}

    simple.dumpStatus = function(){
	printUI("Queue(page IDs): "+eventlist.join(", "));
	var secondChanceFor = eventlist.filter(function(id){
		var count = getFlag(id,"count",0);
		return count > 0;
	});
	printUI("Second is available for chance for : "+secondChanceFor.join(", "));
    }
	simple.tableColumns = ["Queue","Second chance"];
   	simple.getStateForTable = function(){
		var mapped = eventlist.map(function(id){
			var second = (getFlag(id,"count",0)>0)? "X" : "";
			return {"Queue": id,
				"Second chance":second};		
		});
		return mapped;
	}

    simple.onEvent = function(event) {
        var pageId = addressToPageId(event.address);
        if (eventlist.indexOf(pageId) == -1) {
            eventlist.push(pageId);
        }
        var count = getFlag(pageId,"count",0);
	defaultOnEvent(event);
	setFlag(pageId,"count", count+1);
    }
	
    var defaultInit = simple.init;

    simple.init = function() {
	defaultInit();
        eventlist = [];
    }
    
    return simple;
}();
