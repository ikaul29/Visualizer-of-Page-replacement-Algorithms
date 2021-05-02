startbtn = $("#start");
pausebtn = $("#pause");
stopbutn = $("#stop");
resetbtn = $("#reset");
fuckoffbtn = undefined;
var params;
$(function () {
    //ONLOAD SET PARAMS TO DEFAULT;
    stopbutn.hide();
    pausebtn.hide();
    enableSliders();
    clearStats();
});

function printUI(text) {
    var maxSize = 8;
    var row = "<p><span>> </span>" + text + "</p>";
    $("#console-out").append(row);
    if ($("#console-out p").length > maxSize) {
        $("#console-out p").first().remove();
    }
}

function checkValidness(onstart){
    if (onstart === true){
        var framesInRam = params.frameCount;
        if (framesInRam > 1024){
            $("#modal-text").text("Max supported page count is 1024. " +
            "Please increase page size or decrease RAM amount!");
            $('#myModal').modal("show");
            return false;
        }
        var framesInSwap = Math.floor(params.swapSize / params.frameSize);
        if (framesInSwap > 1024){
            $("#modal-text").text("Max supported SWAP size is 1024 pages. " +
            "Please increase page size or decrease SWAP size!");
            $('#myModal').modal("show");
            return false;
        }
    } else {
        //Not implemented yet;
    }
    return true;


}
function setFreeRam(num){
    freeMemStat = num;

    var maxMemSise = $('#ramsize').val();
    var ram = num;

    var percent = (ram/maxMemSise)*100;
    // Round to 2 digits after comma
    percent = Math.floor(percent * 100) / 100;
    var label = percent + "%";
    $("#freeMemStat").text(label);
}
function setPagePoolStat(num){
    pagedPoolStat = num;

    var swapSize = $('#swapsize').val()
    var frameSize = $('#framesize').val()
    var swapPageCount = swapSize/frameSize;

    var percent = (pagedPoolStat/swapPageCount)*100;
    // Round to 2 digits after comma
    percent = Math.floor(percent * 100) / 100;
    var label = percent+"%";
    $("#pagePoolStat").text(label);
}
function setPageHitStat(num){
    pageHitStat = num;
    $("#pageHitStat").text(num);
}
function setPageFaultStat(num){
    pageFaultStat = num;
    $("#pageFaultStat").text(num);
}
function incPageFault(){
    pageFaultStat++;
    setPageFaultStat(pageFaultStat)
    return pageFaultStat;
}
function incPageHit(){
    pageHitStat++
    setPageHitStat(pageHitStat);
    return pageHitStat;
}

function clearStats(){
    freeMemStat = 0;
    pagedPoolStat = 0;
    pageHitStat = 0;
    pageFaultStat = 0;
    $("#pageFaultStat").text(pageFaultStat);
    $("#pageHitStat").text(pageHitStat);
    $("#pagePoolStat").text(pagedPoolStat);
    $("#freeMemStat").text(freeMemStat);

    setFreeRam($('#ramsize').val());
    setPagePoolStat(0);
}

$(window).resize(function () {
    canvas.setWidth($("#canvasrow").width());
});

$(".algo-link").click(function () {
    $("#algoinput").val($(this).attr("data-algo"));
    $(".algo-text").text($(this).html());
});
$(".reset-all").click(function () {
//Reset All UI;

});

startbtn.click(function () {

    params = {
        "algoNumber": parseInt($("#algoinput").val()),
        "ramSize": parseInt($("#ramsize").val()),
        "frameSize": parseInt($("#framesize").val()),
        "frameCount": parseInt($("#framecount").val()),
        "virtMemSize": parseInt($("#virtmemsize").val()),
        "swapSize": parseInt($("#swapsize").val()),
        "speed": parseInt($("#speedinput").val()*100)/100,
        "processMin": parseInt($("#processmin").val()),
        "processMax": parseInt($("#processmax").val()),
        "pagePerProcessMin": parseInt($("#processPageCountMin").val()),
        "pagePerProcessMax":parseInt($("#processPageCountMax").val())
    };

    if (checkValidness(true) != true){
        printUI("Param validation failed. Start canceled!");
        return;
    }
    //if (params.frameCount > 1024) {
    //    $("#myModal").modal("show");
    //    alert("Max supported frame count is 1024.!!!@#$%^!");
    //    return;
    //}
    //if (params.virtMemSize < params.ramSize) {
    //    alert("Virtual memory must be same or bigger then RAM!!!@#$%^!");
    //    return;
    //}
    console.log("StartingAlgo:", params);
    startAlgo(params);
    startbtn.hide();
    stopbutn.show();
    pausebtn.attr("data-started", 1);
    pausebtn.children().first().first().text("Pause");
    pausebtn.children().first().removeClass("glyphicon-play").addClass("glyphicon-pause");
    pausebtn.show();
    clearStats();
    disableGUI();
});
        
stopbutn.click(function () {
    stopAlgo();
    startbtn.show();
    pausebtn.hide();
    pausebtn.attr("data-started", 0);
    enableGUI();
});
pausebtn.click(function () {
    if ($(this).attr("data-started") == 1) {
        pauseAlgo();
        $(this).attr("data-started", 0);
        $(this).children().first().first().text("Unpause");
        pausebtn.children().first().removeClass("glyphicon-pause").addClass("glyphicon-play");
        console.log("PAUSED");
    } else {
        unpauseAlgo();
        $(this).attr("data-started", 1);
        $(this).children().first().first().text("Pause");
        pausebtn.children().first().removeClass("glyphicon-play").addClass("glyphicon-pause");
        console.log("UNPAUSED");
    }
});
resetbtn.click(function () {
    resetSimulation();
    resetGUI();
});



function resetGUI() {
    clearStats();
    enableGUI();
    pausebtn.hide();
    stopbutn.hide();
    startbtn.show();
    $("#ex6SliderVal").text("512 KB");
    $("#ex7SliderVal").text("32 KB");
    $("#ex8SliderVal").text("1024 KB");
    $("#ex9SliderVal").text("2048 KB");
    $("#framecount-label").text("16");
    $("#ex1SliderVal").text("3" + "X");
    $("#speedinput").val(3);

    $("#ramsize").val("512");
    $("#framesize").val("32");
    $("#virtmemsize").val("512");
    $("#swapsize").val("2048");
    $("#framecount").val("16");

    $("#processmin").val("1");
    $("#processmax").val("8");
    $("#processPageCountMin").val("1");
    $("#processPageCountMax").val("5");


    ex6Slider.destroy();
    //ex6Slider = new Slider("#ex6");// $("#ex6").slider();
    ex7Slider.destroy();
    //ex7Slider = new Slider("#ex7");/
    ex8Slider.destroy();
    //ex8Slider = new Slider("#ex8");
    ex9Slider.destroy();
    ex12bSlider.destroy();
    ex1Slider.destroy();
    ex13bSlider.destroy();
    //ex9Slider = new Slider("#ex9");
    enableSliders();

};
function enableGUI() {
    $(".ui-lockable").removeClass("disabled");
    $(".slider.ui-lockable").each(function (i, obj) {
        $(obj).parent().find(".slider").removeClass("slider-disabled");
    });
}
function disableGUI() {
    $(".ui-lockable").addClass("disabled");
    $(".slider.ui-lockable").each(function (i, obj) {
        $(obj).parent().find(".slider").addClass("slider-disabled");
    });
}

function enableSliders() {

    // Speed Slider
    ex1Slider = new Slider("#ex1");
    ex1Slider .on("slide", function (slideEvt) {
        speed = slideEvt.value;
        if (speed < 1) {
            speed = 1 / Math.pow(2, Math.abs(speed - 1));
        }
        if (speed < 10){
            $("#ex1SliderVal").text(speed + "X");
            $("#speedinput").val(speed);
            $("#speed").val(speed);
            setStep(speed);
        } else if (speed == 10){
            $("#ex1SliderVal").text("MAX");
            $("#speedinput").val(500);
            $("#speed").val(500);
            setStep(500);
        }
        checkValidness();
    });

//Process count slider
    ex12bSlider = new Slider("#ex12b", { id: "slider12b", min: 1, max: 20, range: true, value: [1, 8] });
    ex12bSlider.on("slide", function(slideEvt) {
        var range = slideEvt.value;
        $('#processmin').val(range[0]);
        $('#processmax').val(range[1]);
        checkValidness();
    });
//Page count per process slider
    ex13bSlider = new Slider("#ex13b", { id: "slider13b", min: 1, max: 64, range: true, value: [1, 5] });
    ex13bSlider.on("slide", function(slideEvt) {
        var range = slideEvt.value;
        $('#processPageCountMin').val(range[0]);
        $('#processPageCountMax').val(range[1]);
        checkValidness();
    });
// Ram size Slider
    ex6Slider = new Slider("#ex6");// $("#ex6").slider();
    ex6Slider.on("slide", function (slideEvt) {
        var ramsliderVal = slideEvt.value;
        var virtmemslider = $("#ex8");//.attr("data-slider-value");
        //virtmemsize
        console.log("ram > virt", ramsliderVal + " > " + virtmemslider.val());
        //if (ramsliderVal > virtmemslider.attr("data-slider-value")){
        //    virtmemslider.attr("data-slider-value", ramsliderVal);
        //    virtmemslider.attr("data-slider-min", ramsliderVal);
        //    $("#ex8").slider().destroy().slider();
        //} else {
        //    virtmemslider.attr("data-slider-min", ramsliderVal);
        //}

        var ram = Math.pow(2, slideEvt.value); //KB;
        $('#ramsize').val(ram);
        var label = kbToLabel(ram);
        $("#ex6SliderVal").text(label);

        console.log($('#ramsize').val() + " div " + $('#framesize').val());
        var framecount = $('#ramsize').val() / $('#framesize').val();
        console.log("framecount: ", framecount);
        $("#framecount").val(framecount);
        $(".framecount-label").text(framecount);

        console.log($("#framecount").val());
        checkValidness();
    });

//Frame size slider
//$("#ex7").slider();
    ex7Slider = new Slider("#ex7");
    ex7Slider.on("slide", function (slideEvt) {
        var ram = Math.pow(2, slideEvt.value); //KB;
        $('#framesize').val(ram);
        var label = kbToLabel(ram);
        $("#ex7SliderVal").text( label);

        console.log($('#ramsize').val() + " div " + $('#framesize').val());
        var framecount = $('#ramsize').val() / $('#framesize').val();
        console.log("framecount: ", framecount);
        $("#framecount").val(framecount);
        $(".framecount-label").text(framecount);

        console.log($("#framecount").val());
        checkValidness();
    });


//Virtualmem size slider
    ex8Slider = new Slider("#ex8");
    ex8Slider.on("slide", function (slideEvt) {
        var ram = Math.pow(2, slideEvt.value); //KB;
        $('#virtmemsize').val(ram);
        var label = kbToLabel(ram);
        $("#ex8SliderVal").text(label);

        $(".virtmemsize-label").text(label);
        checkValidness();
    });

//Swap size slider
    ex9Slider = new Slider("#ex9");
    ex9Slider.on("slide", function (slideEvt) {
        var ram = Math.pow(2, slideEvt.value); //KB;
        $('#swapsize').val(ram);
        var label = kbToLabel(ram);

        $("#ex9SliderVal").text(label);

        $(".swapsize-label").text(label);
        checkValidness();
    });
}

function outOfMemoryShow(){
    $(".bsod img").width($("body").width())
    $(".bsod").show();
    $(".bsod img").click(function(){
        outofMemoryHide();
    });
}
function outofMemoryHide(){
    startbtn.show();
    pausebtn.hide();
    pausebtn.attr("data-started", 0);
    pausebtn.children().first().first().text("Unpause");
    pausebtn.children().first().removeClass("glyphicon-pause").addClass("glyphicon-play");
    enableGUI();
    $(".bsod").hide();
}
function kbToLabel(kbCount){
    var label = " KB";
    var kb = kbCount
    if (kb > 2048) {
        label = " MB";
        kb = kb / 1024;
    }
    ; // Now we MB
    if (kb > 2048) {
        label = " GB";
        kb = kb / 1024;
    }
    ; // Now we GB;
    kb = Math.round(kb*100)/100;

    label = kb + label;
    return label;
}

//for state table
var table = document.getElementById("state_table");
var tableHeaderNames=[];

var tabblje = $("#table-content");
function clearTable(){
	//table.tBodies[0].innerHTML="";
    tabblje.empty();
}

function setTableHeader(header){
	clearTable();
	tableHeaderNames = header;
}
function addCell(row, data){
    row.append("<div class='cell-elem'>"+data+"</div>");
}
var hrows;
function setTableRows(rows) {
    clearTable();

    hrows = Array();
    //insert "headers"

    tabblje.append("<div class='row data-row well well-sm' data-rownum='all-data'></div>");
    hrows =  $(".data-row[data-rownum='all-data']");
    header = $("<div></div>");
    for (i = 0; i < tableHeaderNames.length; i++) {
        //tabblje.append("<div class='row data-row well well-sm' data-rownum='"+tableHeaderNames[i]+"'></div>");
        //hrows[tableHeaderNames[i]] = $(".data-row[data-rownum='"+tableHeaderNames[i]+"'");// tabblje.append("<div class='row data-row' data-rownum='"+i+"'></div>");
        //hrows[tableHeaderNames[i]].append("<div class='row'><span class='col-xs-2 table-row-header'>"+tableHeaderNames[i]+"</span></div>");
        header.append(tableHeaderNames[i]+"<br/>");
    }
    hrows.append("<span class='col-xs-2 table-row-header cell-elem'>"+header.html()+"</span>");
    hrows.append("<div class='row'></div>");
    //console.log("new table rows", hrows);

    //console.log(rows);
    for (i = 0; i < rows.length; i++) {
        var items = rows[i];
        var cell = "";
        for (j in items) {
            var columnIndex = tableHeaderNames.indexOf(j);
            if (columnIndex >= 0) {
                //console.log("addinCellTo"+j,hrows[j]);
                cell += items[j]+" <br/>";
            }
        }
        addCell(hrows, cell);
    }
}