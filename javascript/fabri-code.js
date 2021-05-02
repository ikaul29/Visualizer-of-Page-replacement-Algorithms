$(function () {
	
		// Obtain a canvas drawing surface from fabric.js
		canvas = new fabric.Canvas('c');
  		canvas.setHeight(400);
		canvas.setWidth($("#canvasrow").width()); //was 800 ;d
		
		initVisualConfig();

		//function observeNumeric(property) {
		//    document.getElementById(property).onchange = function() {
		//	console.log(this.value);
		//      //canvas.renderAll();
		//    };
		//}
		//function observeNumeric2(property) {
		//    document.getElementById(property).onchange = function() {
		//	console.log(document.getElementById('ramsize').value)
		//      //canvas.item(1)['angle'] = this.value * 10;
		//      //canvas.renderAll();
		//    };
		//}
		//// Get value from speed slider
		//observeNumeric('ex1');
		//// Get value from ram slider
		//observeNumeric2('ex6');
		
        
        // Initial canvas graphics
        updateGraphics();
	}); 
