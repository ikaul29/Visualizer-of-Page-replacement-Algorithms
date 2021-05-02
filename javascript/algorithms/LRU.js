var LRU_Algorithm = function(){
	var turn = 0;
	var simple = new simpleAlgorithm();
	simple.onEvict = function(){
		var pages = getPagesInRAM();
		var oldestLU = getFlag(pages[0],"last_use",0);
		var result = 0;
		for(i in pages){
			var LU = getFlag(pages[i],"last_use",0);;
			console.log("Last usage",LU,pages[i]);
			if(LU === undefined){
				return parseInt(i);
			}
			if(oldestLU>LU){
				oldestLU = LU;
				result = parseInt(i);
			}
		}
		return result;
	}
	var defaultOnEvent = simple.onEvent;
	simple.onEvent=function(event){
		turn++;
		var pageId = addressToPageId(event.address);
		defaultOnEvent(event);
		setFlag(pageId,"last_use",turn);
	}
	simple.tableColumns = ["Page id","Last used"];
   	simple.getStateForTable = function(){
		var pages = getPagesInRAM();
		var queue = Object.keys(pages).map(
			function(k){
				var page = pages[k];
				var last_use = getFlag(page,"last_use",0);
				return {"Page id":pageId(page),
					"Last used":last_use};
			});

		queue.sort(function(o1,o2){
			return o1["Last used"] - o2["Last used"];
		});
		return queue;
	}
   	simple.dumpStatus = function(){
		var queue = simple.getStateForTable();
		var displayable = queue.map(function(item){
			return item["Page id"]+"->"+item["Last used"];
		})
		printUI("Map of pageId -> times used "+(displayable.join(" ; ")));	
	}
	simple.name="LRU";
	return simple;
}();
