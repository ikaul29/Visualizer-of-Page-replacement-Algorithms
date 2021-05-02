var MFU_Algorithm = function(){

	var simple = new simpleAlgorithm();

	simple.onEvict = function(){
		var pages = getPagesInRAM();
		var mostUsed = getFlag(pages[0],"used",0);
		var result = 0;
		for(i in pages){
			var used = getFlag(pages[i],"used",0);
			console.log("Used ",used," times",pages[i]);

			if(mostUsed<used){
				mostUsed = used;
				result = parseInt(i);
			}
		}
		return result;
	}

	var defaultOnEvent = simple.onEvent;
	
	//if page is swapped in treat it as newly created
	simple.onSwapin = function(_pageId){
		setFlag(pageId,"used",0);
	}
	simple.onEvent=function(event){
		var pageId = addressToPageId(event.address);
		defaultOnEvent(event);
		var used = getFlag(pageId,"used",0);
		setFlag(pageId,"used",used+1);
	}
	simple.tableColumns = ["Page id","Used"];
	simple.getStateForTable = function(){
		var pages = getPagesInRAM();
		var queue = Object.keys(pages).map(
			function(k){
				var page = pages[k];
				var used = getFlag(page,"used",0);
				return {"Page id":pageId(page),
					"Used":used};
			});

		queue.sort(function(o1,o2){
			return o1.Used - o2.Used;
		});
		return queue;
	}
   	simple.dumpStatus = function(){
		var queue = simple.getStateForTable();
		var displayable = queue.map(function(item){
			return item["Page id"]+"->"+item.Used;
		})
		printUI("Map of pageId -> times used "+(displayable.join(" ; ")));	
	}

	simple.name="MFU";
	return simple;
}();
