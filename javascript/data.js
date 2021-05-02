//do not modify directly
//only read directly for debug
var data={
	"backless":[],
	"in_ram":{},
	"in_swap":{},
	"flags":{},
"deleteRAMPage" : function(page){
	var thisPage = function(item){
		return equalPages(page,item);	
	};

	var keyInRAM = findKeyFor(data.in_ram, thisPage);
	if(keyInRAM != null){
		delete data.in_ram[keyInRAM];
		data.backless=data.backless.filter(function(item){
			return item.page_id != page.page_id;
		});
	}
},
"deleteSWAPPage" : function(page){
	var thisPage = function(item){
		return equalPages(page,item);	
	};
	
	var keyInSwap = findKeyFor(data.in_swap, thisPage);
	if(keyInSwap != null){
		delete data.in_swap[keyInSwap];
		data.backless=data.backless.filter(function(item){
			return item.page_id != page.page_id;
		});
	}
},
"clear" : function(){
	data.backless=[];
	data.in_ram={};
	data.in_swap={};
	data.flags={};
}
};

var nextPageIdVal = 1;
function nextPageId(){
	return nextPageIdVal++;
}

function comparePages(page1,page2){
	return pageId(page_id) - pageId(page_id);
}

function equalPages(page1,page2){
	return pageId(page2) == pageId(page1);
}

function pageId(page){
	if(typeof page === "number"){
		return page;	
	} else {
		return page.page_id;
	}
}

function findKeyFor(obj,filter_func){
	for (var key in obj) {
		var der = filter_func(obj[key]);
		if(der){
			return key;
		}
	}
	return null;
}

Array.prototype.getUniqueBy = function(id_func){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(id_func(this[i]))) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
};
