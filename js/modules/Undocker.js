window.Undocker = function( nLaunchpad, callbackComplete, nPuzzle ){

	let self = this;
	self.$el = $('<undocker>');

	let W = 950/50 * 0.7;
	let H = 850/50 * 0.7;
	const GRID = 40;
	const UNIT = 'px';

	let $floorplan = $('<floorplan>').appendTo(self.$el);

	let $svgMap = $(window.FloorplanSVG).css({width:W*GRID+UNIT,height:H*GRID+UNIT});
	$svgMap.appendTo($floorplan);
}