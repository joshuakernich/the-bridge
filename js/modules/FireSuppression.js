window.FireSuppression = function( nLaunchpad, callbackComplete, nPuzzle ){

	let self = this;
	let slave = new window.PowerDiverter(nLaunchpad, callbackComplete, nPuzzle, true);
	self.$el = slave.$el;

	self.triggerXY = slave.triggerXY;
	self.untriggerXY = slave.untriggerXY;
}