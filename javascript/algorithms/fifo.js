var FIFO_Algorithm = function(){
	var turn = 0;
	var simple = new simpleAlgorithm();
	simple.name="FIFO";
	simple.onEvict = function(){
		var pages = getPagesInRAM();
		var oldest = getFlag(pages[0],"created",0);
		var result = 0;
		for(i in pages){
			var created = getFlag(pages[i],"created",0);
			console.log("Created on",created, pages[i]);
			if(oldest>created){
				oldest = created;
				result = parseInt(i);
			}
		}
		return result;
	}
	simple.dumpStatus = function(){
	
		printUI("Queue(page IDs): "+simple.queue().join(", "));	
	}
	simple.onCreate=function(_pageId){
		setFlag(_pageId,"created",turn);
	}
	//if page is swapped in treat it as newly created
	simple.onSwapin = function(_pageId){
		setFlag(_pageId,"created",turn);
	}

	simple.queue = function(){
		var pages = getPagesInRAM();
		var queue = Object.keys(pages).map(
			function(k){
				var page = pages[k];
				var created = getFlag(page,"created",0);
				return {"id":pageId(page),
					"created":created};
			});

		queue.sort(function(o1,o2){
			return o1.created - o2.created;
		});
		var pageIds = queue.map(function(item){
			return item.id;
		});
		return pageIds;
	}

	simple.tableColumns = ["Queue"];
	simple.getStateForTable = function(){
		return simple.queue().map(function(a){
			return {"Queue":a};		
		});
	}

	var defaultOnEvent = simple.onEvent;
	simple.onEvent=function(event){
		turn++;
		defaultOnEvent(event);
	}

	var defaultInit = simple.init;
	
	simple.init=function(){
		defaultInit();
		turn = 0;
	}

	return simple;
}();
