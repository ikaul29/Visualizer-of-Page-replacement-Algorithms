var visualObjects = { // Handlers for main graphical objects (CPU / Memory / Pagefile / etc.)
    memorySlots : {},
    pagefileSlots : {}
};

var visualConfig = {
    // Texts
    procTextOffsetY: 0,
    procTextFontSize: 30,
    procSpacing: 60,

    cpuTextOffsetY: 0,
    cpuTextFontSize: 30,
    cpuBorderWidth: 0,

    ramTextOffsetY: 0,
    ramTextFontSize: 30,
    ramBorderWidth: 0,

    pfTextOffsetY: 0,
    pfTextFontSize: 30,
    pfBorderWidth: 0,

    // Processes
    procOffsetX: 0,
    procOffsetY: 40,
    procWidth: 150,
    singleProcHeight: 30,
    singleProcFontSize: 15,

    // CPU
    cpuURL: 'assets/images/cpu-optimized.jpg',
    cpuWidth: 100,
    cpuHeight: 100,
    cpuOffsetX: 160,
    cpuOffsetY: 125,
    cpuPadding: 5,
    cpuBorderRadius: 5,

    // RAM
    ramWidth: 200,
    ramHeight: 300,
    ramOffsetX: 350,
    ramOffsetY: 40,
    ramPadding: 5,
    ramSpacing: 7, // Inner spacing between frames
    ramBorderRadius: 5,

    // Pagefile
    pfWidth: 200,
    pfHeight: 350,
    pfOffsetX: 700,
    pfOffsetY: 40,
    pfPadding: 5,
    pfSpacing: 7,
    pfBorderRadius: 5,

    // Slots/frames
    slotBorderWidth: 3,
    slotBorderRadius: 3,

    // Colors
    cpuColor: '#dddddd',
    cpuBorderColor: '#000000',
    memoryColor: '#dddddd',
    memoryBorderColor: '#000000',
    pagefileColor: '#dddddd',
    pagefileBorderColor: '#000000',

    memorySlotColor: 'transparent',
    pagefileSlotColor: 'transparent',

    // TODO: pick colors for all supported processes
    procColors: {
         0 : '#F03E16',
         1 : '#9000D2',
         2 : '#2FDA1F',
         3 : '#6F020E',
         4 : '#FF0099', //done
         5 : '#2299FF', 
         6 : '#AB0939', 
         7 : '#FF9900',
         8 : '#2E2417',
         9 : '#82DF1F',
        10 : '#040438',
        11 : '#4EFCDD',
        12 : '#E80966',//
        13 : '#BD8ABF',
        14 : '#1D1F18',
        15 : '#FF24E2',
        16 : '#A0EEF2',
        17 : '#E6A0F2',//
        18 : '#318CE8',
        19 : '#117788' //done
    }
};

function initVisualConfig() {
    // Align vertically
    //visualConfig.cpuOffsetY = canvas.getHeight() / 2 - visualConfig.cpuHeight / 2;
    //visualConfig.ramOffsetY = canvas.getHeight() / 2 - visualConfig.ramHeight / 2;
    //visualConfig.pfOffsetY = canvas.getHeight() / 2 - visualConfig.pfHeight / 2;
}

function clearGraphics() {
    visualObjects = {};
    visualObjects.memorySlots = {};
    visualObjects.pagefileSlots = {};
    Graphics.clearDrawingEventQueue();
    canvas.clear();
}

// Redraw / revalidate the visuals
function updateGraphics() {
    drawProcesses();
    drawCPU();
    drawMemory();
    drawPagefile();

    Graphics.processDrawingEventQueue();

    canvas.renderAll();
}

var Graphics = {
    GridConfig : {
        4 : {rows : 4, cols : 1},
        8 : {rows : 8, cols : 1},
        16 : {rows : 8, cols : 2},
        32 : {rows : 8, cols : 4},
        64 : {rows : 8, cols : 8},
        128 : {rows : 16, cols : 8},
        256 : {rows : 16, cols : 16},
        512 : {rows : 32, cols : 16},
        1024 : {rows : 32, cols : 32}
    },

    MemorySlot : fabric.util.createClass(fabric.Rect, {
        initialize : function (pid, position) {
            this.pid = pid;

            var vc = visualConfig;

            var rows = visualConfig.ramRows;
            var cols = visualConfig.ramCols;
            console.assert(rows * cols === pageSlotsInRAM());

            // Main parameters
            this.left = Graphics.MemorySlot.calculateOffsetX(position);
            this.top = Graphics.MemorySlot.calculateOffsetY(position);

            if (position % cols === cols - 1) {
                this.width = vc.ramOffsetX + vc.ramWidth - this.left - vc.ramPadding - vc.slotBorderWidth;
            } else {
                this.width = Graphics.MemorySlot.calculateOffsetX(position + 1)
                    - Graphics.MemorySlot.calculateOffsetX(position)
                    - vc.slotBorderWidth
                    - vc.ramSpacing;
            }
            this.height = Graphics.MemorySlot.calculateOffsetY(position + cols)
                - Graphics.MemorySlot.calculateOffsetY(position)
                - vc.slotBorderWidth
                - vc.ramSpacing;

            // Look and feel
            this.rx = vc.slotBorderRadius;
            this.ry = vc.slotBorderRadius;
            this.fill = vc.memorySlotColor;
            this.strokeWidth = vc.slotBorderWidth;
            this.stroke = vc.procColors[this.pid];

            this.selectable = false;
        }
    }),
    PagefileSlot : fabric.util.createClass(fabric.Rect, {
        initialize : function (pid, position) {
            this.pid = pid;

            var vc = visualConfig;
            var cols = vc.pfCols;

            // Main parameters
            this.left = Graphics.PagefileSlot.calculateOffsetX(position);
            this.top = Graphics.PagefileSlot.calculateOffsetY(position);

            if (position % cols === cols - 1) {
                this.width = vc.pfOffsetX + vc.pfWidth - this.left - vc.pfPadding - vc.slotBorderWidth;
            } else {
                this.width = Graphics.PagefileSlot.calculateOffsetX(position + 1)
                    - Graphics.PagefileSlot.calculateOffsetX(position)
                    - vc.slotBorderWidth
                    - vc.pfSpacing;
            }
            this.height = Graphics.PagefileSlot.calculateOffsetY(position + cols)
                - Graphics.PagefileSlot.calculateOffsetY(position)
                - vc.slotBorderWidth
                - vc.pfSpacing;

            // Look and feel
            this.rx = vc.slotBorderRadius;
            this.ry = vc.slotBorderRadius;
            this.fill = vc.pagefileSlotColor;
            this.strokeWidth = vc.slotBorderWidth;
            this.stroke = vc.procColors[this.pid];

            this.selectable = false;
        }
    }),
    CPU : fabric.util.createClass(fabric.Rect, {
        initialize: function () {
            this.left = visualConfig.cpuOffsetX;
            this.top = visualConfig.cpuOffsetY;
            this.width = visualConfig.cpuWidth;
            this.height = visualConfig.cpuHeight;
            this.fill = visualConfig.cpuColor;
            this.stroke = visualConfig.cpuBorderColor;
            this.strokeWidth = visualConfig.cpuBorderWidth;
            this.rx = visualConfig.cpuBorderRadius;
            this.ry = visualConfig.cpuBorderRadius;
            this.selectable = false;
        }
    }),
    RAM : fabric.util.createClass(fabric.Rect, {
        initialize: function () {
            this.left = visualConfig.ramOffsetX;
            this.top =  visualConfig.ramOffsetY;
            this.width =  visualConfig.ramWidth;
            this.height = visualConfig.ramHeight;
            this.fill = visualConfig.memoryColor;
            this.stroke = visualConfig.memoryBorderColor;
            this.strokeWidth = visualConfig.ramBorderWidth;
            this.rx = visualConfig.ramBorderRadius;
            this.ry = visualConfig.ramBorderRadius;
            this.selectable = false;
        }
    }),
    SWAP : fabric.util.createClass(fabric.Rect, {
        initialize: function () {
            this.left = visualConfig.pfOffsetX;
            this.top = visualConfig.pfOffsetY;
            this.width = visualConfig.pfWidth;
            this.height = visualConfig.pfHeight;
            this.fill = visualConfig.pagefileColor;
            this.stroke = visualConfig.pagefileBorderColor;
            this.strokeWidth = visualConfig.pfBorderWidth;
            this.rx = visualConfig.pfBorderRadius;
            this.ry = visualConfig.pfBorderRadius;
            this.selectable = false;
        }
    }),
    CustomText : fabric.util.createClass(fabric.Text, {
        initialize: function(text, options) {
            this.callSuper('initialize', text, options);
            this.left -= this.width / 2;
            this.selectable = false;
        }
    }),
    Process : fabric.util.createClass(fabric.Text, {
        initialize: function(pid, options) {
            var text = 'P' + pid;
            this.callSuper('initialize', text, options);

            this.left = visualConfig.procOffsetX + visualConfig.procWidth / 2 - this.width / 2;
            if (pid < 10) {
                this.left -= visualConfig.procSpacing / 2;
                this.top = visualConfig.procOffsetY + pid * visualConfig.singleProcHeight;
            } else {
                this.left += visualConfig.procSpacing / 2;
                this.top = visualConfig.procOffsetY + (pid - 10) * visualConfig.singleProcHeight;
            }
            this.fontSize = visualConfig.singleProcFontSize;
            this.fill = visualConfig.procColors[pid];

            this.selectable = false;
        }
    }),

    drawingEventQueue : []
};

Graphics.MemorySlot.calculateOffsetX = function (position) {
    var vc = visualConfig;
    var cols = vc.ramCols;
    var mainSpace = vc.ramWidth - 2 * vc.ramPadding - (cols - 1) * vc.ramSpacing;
    var singleWidth = mainSpace / cols + vc.ramSpacing;
    return vc.ramOffsetX + vc.ramPadding + (position % cols) * singleWidth;
};

Graphics.MemorySlot.calculateOffsetY = function (position) {
    var vc = visualConfig;
    var rows = vc.ramRows;
    var cols = vc.ramCols;
    var row = Math.floor(position / cols);
    return vc.ramOffsetY + vc.ramPadding
        + Math.floor(row * (vc.ramHeight - 2 * vc.ramPadding) / rows)
        + vc.ramSpacing / 2;
};

Graphics.PagefileSlot.calculateOffsetX = function (position) {
    var vc = visualConfig;
    var cols = vc.pfCols;
    var mainSpace = vc.pfWidth - 2 * vc.pfPadding - (cols - 1) * vc.pfSpacing;
    var singleWidth = mainSpace / cols + vc.ramSpacing;
    return vc.pfOffsetX + vc.pfPadding + (position % cols) * singleWidth;
};

Graphics.PagefileSlot.calculateOffsetY = function (position) {
    var vc = visualConfig;
    var rows = vc.pfRows;
    var cols = vc.pfCols;
    var row = Math.floor(position / cols);
    return vc.pfOffsetY + vc.pfPadding
        + Math.floor(row * (vc.pfHeight - 2 * vc.pfPadding) / rows)
        + vc.pfSpacing / 2;
};

Graphics.enqueueDrawingEvent = function(callback) {
    this.drawingEventQueue.push(callback);
};

Graphics.processDrawingEventQueue = function () {
    var eventsToProcess = this.drawingEventQueue.length;
    while (eventsToProcess--> 0) {
        var callback = this.drawingEventQueue[0];

        if (config.waitForGraphics) {
            // Stop processing for now
            return;
        } else {
            // Process right now
            //console.log('Processing drawingEvent ' + " -> " + callback);
            callback();
        }

        this.drawingEventQueue.shift();
    }
};

Graphics.clearDrawingEventQueue = function () {
    this.drawingEventQueue = [];
};

function drawProcesses() {
    if (visualObjects.processes === undefined) {
        var procText = new Graphics.CustomText('Processes', {
            left: visualConfig.procOffsetX + visualConfig.procWidth / 2,
            top:  visualConfig.procTextOffsetY,
            fontSize: visualConfig.procTextFontSize
        });
        visualObjects.procText = procText;
        canvas.add(procText);

        visualObjects.processes = {};
    }

    //for (var i = 0; i < config.processMax; i++) {
    //    if (i in visualObjects.processes) {
    //        if (canvas.getObjects().indexOf(visualObjects.processes[i]) === -1) {
    //            var p = new Graphics.Process('P' + i, {
    //                left: visualConfig.procOffsetX + visualConfig.procWidth / 2,
    //                top: visualConfig.procOffsetY + i * visualConfig.singleProcHeight,
    //                fontSize: visualConfig.singleProcFontSize
    //            });
    //            canvas.add(p);
    //        }
    //    }
    //}
}

function drawCPU() {
    if (visualObjects.CPU === undefined) {
        visualObjects.CPU = "will be defined in a moment";

        if (visualConfig.cpuURL) {
            fabric.Image.fromURL(visualConfig.cpuURL, function(img) {
                img.scaleToWidth(visualConfig.cpuWidth);
                img.set('left', visualConfig.cpuOffsetX);
                img.set('top', visualConfig.cpuOffsetY);
                img.setCoords();
                img.selectable = false;
                canvas.add(img);
                visualObjects.CPU = img;
            });
        } else {
            var CPU = new Graphics.CPU();
            visualObjects.CPU = CPU;
            canvas.add(CPU);
        }

        var cpuText = new Graphics.CustomText('CPU', {
            left: visualConfig.cpuOffsetX + visualConfig.cpuWidth / 2,
            top:  visualConfig.cpuTextOffsetY,
            fontSize: visualConfig.cpuTextFontSize
        });

        visualObjects.cpuText = cpuText;
        canvas.add(cpuText);
    }
}

function drawMemory() {
    if (visualObjects.RAM === undefined) {
        var RAM = new Graphics.RAM();
        
        var ramText = new Graphics.CustomText('RAM', {
            left: visualConfig.ramOffsetX + visualConfig.ramWidth / 2,
            top:  visualConfig.ramTextOffsetY,
            fontSize: visualConfig.ramTextFontSize
        });
        
        visualObjects.RAM = RAM;
        visualObjects.ramText = ramText;
        
        canvas.add(RAM);
        canvas.add(ramText);
    }
}

function drawPagefile() {
    if (visualObjects.Pagefile === undefined) {
        var Pagefile = new Graphics.SWAP();
        
        var pfText = new Graphics.CustomText('SWAP', {
            left: visualConfig.pfOffsetX + visualConfig.pfWidth / 2,
            top:  visualConfig.pfTextOffsetY,
            fontSize: visualConfig.pfTextFontSize
        });
        
        visualObjects.Pagefile = Pagefile;
        visualObjects.pfText = pfText;
        
        canvas.add(Pagefile);
        canvas.add(pfText);
    }
}

function getAnimationDuration() {
    return 500 / config.speed;
}

function getAnimationEasing() {
    return fabric.util.easeInOutCubic;
}

function animateCreatePage(pid, memorySlot) {
    console.assert(pid in visualObjects.processes, "Error: process " + pid + " does not exist!");
    console.assert(!(memorySlot in visualObjects.memorySlots), "Error: overwriting memory slot " + memorySlot);

    var slot = new Graphics.MemorySlot(pid, memorySlot);
    console.log('New slot created: ', pid, memorySlot, slot);
    visualObjects.memorySlots[memorySlot] = slot;
    canvas.add(slot);
    canvas.renderAll();
}

function animateDeletePage(memorySlot, pagefileSlot) {
    if (memorySlot in visualObjects.memorySlots) {
        canvas.remove(visualObjects.memorySlots[memorySlot]);
        delete visualObjects.memorySlots[memorySlot];
    }

    if (pagefileSlot in visualObjects.pagefileSlots) {
        canvas.remove(visualObjects.pagefileSlots[pagefileSlot]);
        delete visualObjects.pagefileSlots[pagefileSlot];
    }

    canvas.renderAll();
}

function animatePageHit(memorySlot) {
    console.assert(memorySlot in visualObjects.memorySlots, "Error: page hit in empty slot -> " + memorySlot);

    var pid = visualObjects.memorySlots[memorySlot].pid;
    console.assert(pid in visualObjects.processes, "Error: process " + pid + " does not exist!");
    var target = new Graphics.MemorySlot(pid, memorySlot);

    var slot = visualObjects.memorySlots[memorySlot];

    var expansionQuotient = 1.2;

    var x = slot.width;
    var y = slot.height;
    var newWidth = expansionQuotient * x;
    var newHeight = expansionQuotient * y;
    slot.left -= (newWidth - x) / 2;
    slot.top -= (newHeight - y) / 2;
    slot.width = newWidth;
    slot.height = newHeight;

    graphicsStarted();

    visualObjects.memorySlots[memorySlot].animate({
        left: target.left,
        top: target.top,
        width: target.width,
        height: target.height
    }, {
        duration: getAnimationDuration(),
        onChange : canvas.renderAll.bind(canvas),
        onComplete : function () {
            graphicsDone(); // Resume normal execution
        },
        easing : getAnimationEasing()
    });
}

function animateRamToSwap(memorySlot, pagefileSlot) {
    console.log('Animating RAM to SWAP ' + memorySlot + ' --> ' + pagefileSlot);

    console.assert(!(pagefileSlot in visualObjects.pagefileSlots), "Error: slot " + pagefileSlot + " in pagefile is not empty!");
    console.assert(memorySlot in visualObjects.memorySlots, "Error: slot " + memorySlot + " in memory is empty!");

    var pid = visualObjects.memorySlots[memorySlot].pid;
    console.assert(pid in visualObjects.processes, "Error: process " + pid + " does not exist!");
    var target = new Graphics.PagefileSlot(pid, pagefileSlot);

    graphicsStarted(); // Sleep infinitely - rely on onComplete() event to awaken

    visualObjects.memorySlots[memorySlot].animate({
        left: target.left,
        top: target.top,
        width: target.width,
        height: target.height
    }, {
        duration: getAnimationDuration(),
        onChange: canvas.renderAll.bind(canvas),
        onComplete: function () {
            canvas.remove(visualObjects.memorySlots[memorySlot]);
            // Warning: self-destruction
            delete visualObjects.memorySlots[memorySlot];

            visualObjects.pagefileSlots[pagefileSlot] = target;
            canvas.add(visualObjects.pagefileSlots[pagefileSlot]);

            canvas.renderAll();

            graphicsDone(); // Resume normal execution
        },
        easing: getAnimationEasing()
    });
}

function animateSwapToRam(memorySlot, pagefileSlot) {
    console.log('Animating SWAP to RAM ' + pagefileSlot + ' --> ' + memorySlot);

    console.assert(!(memorySlot in visualObjects.memorySlots), "Error: slot " + memorySlot + " in memory is not empty!");
    console.assert(pagefileSlot in visualObjects.pagefileSlots, "Error: slot " + pagefileSlot + " in pagefile is empty!");

    var pid = visualObjects.pagefileSlots[pagefileSlot].pid;
    console.assert(pid in visualObjects.processes, "Error: process " + pid + " does not exist!");
    var target = new Graphics.MemorySlot(pid, memorySlot);

    graphicsStarted(); // Sleep infinitely - rely on onComplete() event to awaken

    visualObjects.pagefileSlots[pagefileSlot].animate({
            left : target.left,
            top : target.top,
            width : target.width,
            height : target.height
        }, {
            duration: getAnimationDuration(),
            onChange : canvas.renderAll.bind(canvas),
            onComplete : function () {
                canvas.remove(visualObjects.pagefileSlots[pagefileSlot]);
                // Warning: self-destruction
                delete visualObjects.pagefileSlots[pagefileSlot];
                visualObjects.memorySlots[memorySlot] = target;
                canvas.add(visualObjects.memorySlots[memorySlot]);

                canvas.renderAll();

                graphicsDone(); // Resume normal execution
            },
            easing : getAnimationEasing()
        }
    );
}

function animateEvent(event) {
    var pid = event.pid;
    var type = event.type;
    var address = event.address;

    if (visualObjects.eventText !== undefined) {
        canvas.remove(visualObjects.eventText);
        canvas.renderAll();
    }

    visualObjects.eventText = new Graphics.CustomText('P' + pid + ' ' + type + ' ' + address, {
        left : visualConfig.cpuOffsetX + visualConfig.cpuWidth / 2,
        top : 100,
        fontSize : 20
    });

    canvas.add(visualObjects.eventText);
    canvas.renderAll();

    visualObjects.eventText.animate({
        left : visualObjects.eventText.left
    }, {
        duration: getAnimationDuration(),
        onChange : canvas.renderAll.bind(canvas),
        easing : getAnimationEasing()
    });
}

function animateCreateProcess(pid) {
    console.log('CREATING PROCESS ' + pid);
    console.assert(!(pid in visualObjects.processes), "Error: process " + pid + " already exists");

    visualObjects.processes[pid] = new Graphics.Process(pid);
    canvas.add(visualObjects.processes[pid]);
    canvas.renderAll();
}

function animateKillProcess(pid) {
    console.log('KILLING PROCESS ' + pid);
    console.assert(pid in visualObjects.processes, "Error: tried killing non-existing process " + pid);

    canvas.remove(visualObjects.processes[pid]);
    delete visualObjects.processes[pid];
    canvas.renderAll();
}
