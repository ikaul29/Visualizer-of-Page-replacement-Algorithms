function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var MMU = {
    usedId: [],
    init: function() {
        this.usedId = [];
    },
    getId: function() {
        var tmp = 0;
        while(true) {
            if (this.usedId.indexOf(tmp) == -1) {
                this.usedId.push(tmp);
                break;
            }
            tmp += 1;
        }
        return tmp;
    },
    removeId: function(id) {
        this.usedId.splice(this.usedId.indexOf(parseInt(id)),1);
    }
};

function translateTable() {
    this.table = {}; //{pageId: realId}
    this.init = function(pageCount) {
        this.table = {};
        for (var i=0; i< pageCount; i++) {
            this.table[i] = MMU.getId();
        }
    };
    this.translate = function(pageId) {
        return this.table[pageId];
    };
    this.dealloc = function() {
        for (var i in this.table) {
            MMU.removeId(this.table[i]);
            deletePage(this.table[i]);
        }
    };
}

function process() {
    this.ttl = -1;
    this.pid = -1;
    this.pageTable = -1;
    this.init = function(pid, pageCount, ttl) {
        this.ttl = ttl;
        this.pid = pid;
        this.pageTable = new translateTable();
        this.pageTable.init(pageCount);

        Graphics.enqueueDrawingEvent(function () {
            animateCreateProcess(pid);
        });
    };
    this.makeAction = function() {
        var requestType = Math.floor(2 * Math.random()) ? "read" : "write";
        var virtual_id = Math.floor(Object.keys(this.pageTable.table).length * Math.random());
        var real_id = this.pageTable.translate(virtual_id);
        var offset = Math.floor(Math.random() * pageSize());
        var address = real_id * pageSize() + offset;
        var request = {
		    "pid" : this.pid,
		    "real_id": real_id,
            "type" : requestType,
            "address" : address
        };
	    return request;
    };
    this.endProcess = function() {
        this.pageTable.dealloc();
        delete this.pageTable;

        var pid = this.pid;
        Graphics.enqueueDrawingEvent(function () {
            animateKillProcess(pid);
        });
    };
}

var processMaster = {
    usedPids: [],
    processList: {}, //{process: [endTime,...]}
    init: function() {
        this.processList = {};
        this.usedPids = [];
    },
    createProcess: function() {
        //If max reached do nothing      
        if (Object.keys(this.processList).length == config.processMax) {
            return;
        }
        //50% chance to create new process if min is reached
        if (Object.keys(this.processList).length >= config.processMin) {
            if (getRandomInt(0,100) % 2 == 0) {
                return;
            }
        }
        var tmp = new process();
        var pid = 0;
        var timeOffset = getRandomInt(10, 100); //Min 11, max 99 seconds to live
        while (true) {
            if (this.usedPids.indexOf(pid) == -1) {
                tmp.init(pid, getRandomInt(config.pagePerProcessMin, config.pagePerProcessMax), timeOffset);
                this.usedPids.push(pid);
                break;
            }
            pid += 1;
        }
        this.processList[pid] = tmp;
        console.log("Process ID:" + pid + " created");
        if (Object.keys(this.processList).length < config.processMin) {
            this.createProcess();
        }
    },
    lastActivePID: -1,
    makeTick: function() {
        //Delete old processes
        for (var i in this.processList) {
            if (this.processList[i].ttl == 0) {
                this.processList[i].endProcess();
                console.log("Process ID:" + this.processList[i].pid + " terminated");
                this.usedPids.splice(this.usedPids.indexOf(parseInt(i)), 1);
                delete this.processList[i];
            }
        }

        //Create new process
        this.createProcess();

        //Generate action for an active process
        //Round-robin job scheduling
        var event = null;
        var len = Object.keys(this.processList).length;
        if (len > 0) {
            // Find next process after last active
            var pid = this.lastActivePID + 1;
            while (!(pid in this.processList)) {
                pid++;
                if (pid >= config.processMax) {
                    pid = 0;
                }
            }
            this.lastActivePID = pid;

            // Generate event
            event = this.processList[pid].makeAction();
            this.processList[pid].ttl -= 1;
        }

        return event;
    },
    killAll: function() {
        console.log("Killing all processes");
        for (var i in this.processList) {
            this.processList[i].endProcess();
            console.log("Process ID:"+this.processList[i].pid+" terminated");
            delete this.processList[i];            
        }
        this.usedPids = [];   
        MMU.init(); 
    }
};
