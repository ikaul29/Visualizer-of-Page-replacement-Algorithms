/*
CPU+RAM+Swap file
*/

/*** Global variables ***/
var config = {}; // Animation configuration
var statsObj = {
    freeRam:0,
    pagePool:0,
    pageHits:0,
    pageFaults:0
}; //Statistics object;

function startAlgo(params) {
	console.log("Simulation started:", params);

	console.assert(config.speed !== 0, "Error: speed is set to zero, expect division by zero exceptions!");

	config.ramSize = params.ramSize;
	config.virualMemorySize = params.virtMemSize;
	config.frameSize = params.frameSize;
	config.frameCount = params.frameCount;
	config.swapSize = params.swapSize;
	config.speed = params.speed;
	config.algo = params.algoNumber;
	config.waitUntilTimeStamp = -1;
	config.processMax = params.processMax;
	config.processMin = params.processMin;
    config.pagePerProcessMin = params.pagePerProcessMin;
    config.pagePerProcessMax = params.pagePerProcessMax;

	var algo = params.algoNumber;
	if (algo == 0) { //FIFO/FCSF
		config.algo = FIFO_Algorithm
	} else if (algo == 1) { //Second-chance
		config.algo = second_chance
	} else if (algo == 2) { //LRU
		config.algo = LRU_Algorithm
	} else if (algo == 3) { //LFU
		config.algo = LFU_Algorithm
    } else if (algo == 6) { //MFU
        config.algo = MFU_Algorithm
    } else if (algo == 4) { //MRU
        config.algo = MRU_Algorithm
	} else if (algo == 5) { //Random
		config.algo = randomAlgorithm
	}
	statsObj.freeRam = config.ramSize;
	statsObj.pageHits=0;
    	statsObj.pageFaults=0;

	// Clear previously created objects
	clearGraphics();

	visualConfig.ramRows = Graphics.GridConfig[pageSlotsInRAM()].rows;
	visualConfig.ramCols = Graphics.GridConfig[pageSlotsInRAM()].cols;
	visualConfig.pfRows = Graphics.GridConfig[pageSlotsInSWAP()].rows;
	visualConfig.pfCols = Graphics.GridConfig[pageSlotsInSWAP()].cols;

	// Redraw everything anew
	updateGraphics();

	var init = config.algo.init;
	if (init && !config.initialised) {
		init();
		config.initialised = true;
	}

	setStep(params.speed);
	unpauseAlgo();
}

function setStep(speed){
	config.speed = speed;
	if(config.timer){
		unpauseAlgo();
	}
}

function graphicsStarted() {
	config.waitForGraphics = true;
}

function graphicsDone() {
	config.waitForGraphics = false;
}

function pauseAlgo(){
	var timer = config.timer;
	clearTimeout(timer);
	delete config.timer;
}

function unpauseAlgo(){
	//timer already started
	if(config.timer){
		pauseAlgo();
	}
	//do the first tick
	//simulationTick();
	//enqueue the next ticks
	var step = 1000/config.speed;
	config.timer = setInterval(function(){simulationTick()},step);
}

function stopAlgo(){
	pauseAlgo();
	config.initialised = false;
	processMaster.killAll();
	data.clear();
	updateGraphics();
}

//increases time by one timeunit
function simulationTick(){
	updateGraphics();
	if (config.waitForGraphics) {
		//console.log('Sleeping...');
		return;
	}
	var onEvent = algorithm().onEvent;
	var event = processMaster.makeTick();
	if(event != null){
		onEvent(event);
	}
   	updateStatistics();
}

function resetSimulation(){
	stopAlgo();
	clearGraphics();
	updateGraphics();
}

function algorithm(){
	return config.algo;
}

function pageSlotsInRAM(){
	return config.frameCount;
}

function getFreeRAMSlot(){
	var pages = getPagesInRAM();
	for (var i = 0; i < pageSlotsInRAM(); i++) {
		if (!(i in pages)) {
			return i;
		}
	}
	return -1;
}

function getPagesInRAM(){
	// slot_nr:page
	return data.in_ram;
}

function pageSlotsInSWAP(){
	return Math.floor(config.swapSize / config.frameSize);
}

function pageSize(){
	return config.frameSize;
}

function getFreeSWAPSlot(){
	var pages = getPagesInSWAP();
	for (var i = 0; i < pageSlotsInSWAP(); i++) {
		if (!(i in pages)) {
			return i;
		}
	}
	return -1;
}

function getPagesInSWAP(){
	return data.in_swap;
}

function getAllPages(){
	var aggregate = data.backless;
	for (var slot in data.in_swap) {
		aggregate.push(data.in_swap[slot])
	}
	for (var slot in data.in_ram) {
		aggregate.push(data.in_ram[slot])
	}
	return aggregate.getUniqueBy(pageId);
}

// possible flags (use others if needed)
// dirty, valid
// these flags should be included in page table if used

function setFlag(page,flagName,value){
	var flags = data.flags[pageId(page)];
	if(flags===undefined){
		flags = {};	
	}
	flags[flagName]=value;
	data.flags[pageId(page)]=flags;
}

function getFlag(page,flagName,defaultValue){
	var flags = data.flags[pageId(page)];
	if(flags===undefined){
		return defaultValue;
	}
	var value = flags[flagName];
	if(value===undefined){
		return defaultValue;
	}
	return value;
}

function pageHit(pageId){
	statsObj.pageHits++;
	console.log("Page hit!",{"pageId":pageId});
}

//swapout
function writePageToSwap(page,swapSlot){
	if(0<=swapSlot && swapSlot<pageSlotsInSWAP()){
	console.log("page "+pageId(page)+" TO SWAP slot "+swapSlot);
		data.in_swap[swapSlot]=page;
	}
}

//swapin
function writePageToRAM(page,ramSlot){
	if(0<=ramSlot && ramSlot<pageSlotsInRAM()){
	console.log("page "+pageId(page)+" TO RAM slot "+ramSlot);
		data.in_ram[ramSlot]=page;
	}
}

function movePageFromRamToSwap(page, swapSlot) {
	var flags = data.flags[pageId(page)];
	writePageToSwap(page, swapSlot);
	deletePageFromRAM(page);
}

function movePageFromSwapToRam(page, ramSlot) {
	var flags = data.flags[pageId(page)];
	writePageToRAM(page, ramSlot);
	deletePageFromSWAP(page);
}

function findRAMPageById(id){
	var pages = getPagesInRAM();
	for(i in pages){
		if(pageId(pages[i])==id){
			return pages[i];
		}
	}
	return null;
}

function findSWAPPageById(id){
	var pages = getPagesInSWAP();
	for(i in pages){
		if(pageId(pages[i])==id){
			return pages[i];
		}
	}
	return null;
}

function findRAMSlotByPageId(id){
	var pages = getPagesInRAM();
	for(i in pages){
		if(pageId(pages[i])==id){
			return parseInt(i);
		}
	}
	return -1;
}

function findSWAPSlotByPageId(id){
	var pages = getPagesInSWAP();
	for(i in pages){
		if(pageId(pages[i])==id){
			return parseInt(i);
		}
	}
	return -1;
}

//delete page from both RAM and SWAP, also remove flags
function deletePage(page){
	var id = pageId(page);
	var ramPageId = findRAMSlotByPageId(id);
	var pfPageId = findSWAPSlotByPageId(id);
	Graphics.enqueueDrawingEvent(function () {
		animateDeletePage(ramPageId, pfPageId);
	});

	data.deleteRAMPage(page);
	data.deleteSWAPPage(page);
	delete data.flags[id];
}

function deletePageFromRAM(page){
	data.deleteRAMPage(page);
}

function deletePageFromSWAP(page){
	data.deleteSWAPPage(page);
}

//create a page but do not assign it any memory
function createBacklessPage(pageId){
	return {
		"page_id":pageId,
		"min_address":pageId * pageSize(),
		"max_address":(pageId+1) * pageSize()
	};
}

function addressToPageId(address){
	return Math.floor(address/pageSize());
}

function createPage(ramSlot,pageId){
	var page = createBacklessPage(pageId);
	writePageToRAM(page,ramSlot);
	return page;
}
function updateStatistics(){
    setFreeRam(config.ramSize-(Object.keys(getPagesInRAM()).length)*pageSize());
    setPagePoolStat(Object.keys(getPagesInSWAP()).length);
    setPageHitStat(statsObj.pageHits);
    setPageFaultStat(statsObj.pageFaults);
}
