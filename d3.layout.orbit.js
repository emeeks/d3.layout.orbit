d3.layout.orbit = function() {
	var currentTickStep = 0;
	var orbitNodes;
	var orbitSize = [1,1];
	var nestedNodes;
	var flattenedNodes = [];
	var tickRadianStep = 0.004363323129985824;
    var orbitDispatch = d3.dispatch('tick');
    var tickInterval;
    var orbitalRings = [];
    var orbitDepthAdjust = function() {return 2.95};
    var childrenAccessor = function(d) {return d.children};
    var tickRadianFunction = function() {return 1};
    var fixedOrbitArray = [99];
    var orbitMode = "flat";


	function _orbitLayout() {

		return _orbitLayout;
	}

	_orbitLayout.mode = function(_mode) {
		//Atomic, Solar, other?
		if (!arguments.length) return orbitMode;

		if (_mode == "solar") {
			fixedOrbitArray = [1]
		}
		if (_mode == "atomic") {
			fixedOrbitArray = [2,8]
		}
		if (_mode == "flat") {
			fixedOrbitArray = [99]
		}
		orbitMode = _mode;
		if (Array.isArray(_mode)) {
			fixedOrbitArray = _mode;
			orbitMode = "custom";
		}
		return this
	}

	_orbitLayout.start = function() {
		//activate animation here
		tickInterval = setInterval(
			function() {
			currentTickStep++;
			flattenedNodes.forEach(function(_node){
				if (_node.parent) {
					_node.x = _node.parent.x + ( (_node.ring) * Math.sin( _node.angle + (currentTickStep * tickRadianStep * tickRadianFunction(_node))) );
					_node.y = _node.parent.y + ( (_node.ring) * Math.cos( _node.angle + (currentTickStep * tickRadianStep * tickRadianFunction(_node))) );
				}
			})
			orbitalRings.forEach(function(_ring) {
				_ring.x = _ring.source.x;
				_ring.y = _ring.source.y;
			})
			orbitDispatch.tick();
		}, 
		10);
	}

	_orbitLayout.stop = function() {
		//deactivate animation here
		clearInterval(tickInterval);
	}

	_orbitLayout.speed = function(_degrees) {
		if (!arguments.length) return tickRadianStep / (Math.PI / 360);
		tickRadianStep = tickRadianStep = _degrees * (Math.PI / 360);
		return this;
	}

	_orbitLayout.size = function(_value) {
		if (!arguments.length) return orbitSize;
		orbitSize = _value;
		return this;
		//change size here
	}

	_orbitLayout.revolution = function(_function) {
		//change ring size reduction (make that into dynamic function)
		if (!arguments.length) return tickRadianFunction;
		tickRadianFunction = _function;
		return this
	}

	_orbitLayout.orbitSize = function(_function) {
		//change ring size reduction (make that into dynamic function)
		if (!arguments.length) return orbitDepthAdjust;
		orbitDepthAdjust = _function;
		return this
	}

	_orbitLayout.orbitalRings = function() {
		//return an array of data corresponding to orbital rings
		if (!arguments.length) return orbitalRings;
		return this;
	}

	_orbitLayout.nodes = function(_data) {
    	if (!arguments.length) return flattenedNodes;
    	nestedNodes = _data;
    	calculateNodes();
		return this;
	}

	_orbitLayout.children = function(_function) {
    	if (!arguments.length) return childrenAccessor;
    	
    	//Probably should use d3.functor to turn a string into an object key
    	childrenAccessor = _function;
    	return this;


	}

    d3.rebind(_orbitLayout, orbitDispatch, "on");

	return _orbitLayout;
	function calculateNodes() {
	    orbitalRings = [];
			orbitNodes = nestedNodes;

			orbitNodes.x = orbitSize[0] / 2;
			orbitNodes.y = orbitSize[1] / 2;
			orbitNodes.ring = orbitSize[0] / 2;
			orbitNodes.depth = 0;

			flattenedNodes.push(orbitNodes);

			traverseNestedData(orbitNodes);

		function traverseNestedData(_node) {

			if(childrenAccessor(_node)) {
				var y = 0;
				var totalChildren = childrenAccessor(_node).length;
				var _rings = 0;
				var _total_positions = 0;
				var _p = 0;
				while (_total_positions < totalChildren) {
					if (fixedOrbitArray[_p]) {
						_total_positions += fixedOrbitArray[_p];
					}
					else {
						_total_positions += fixedOrbitArray[fixedOrbitArray.length - 1];						
					}
					_p++;
					_rings++;
				}

				while (y < totalChildren) {
					var _pos = 0;
					var _currentRing = 0;
					var _p = 0;
					var _total_positions = 0;

				while (_total_positions <= y) {
					if (fixedOrbitArray[_p]) {
						_total_positions += fixedOrbitArray[_p];
					}
					else {
						_total_positions += fixedOrbitArray[fixedOrbitArray.length-1];						
					}

						_p++;
						_currentRing++;
				}

				var ringSize = fixedOrbitArray[fixedOrbitArray.length-1];

				if (fixedOrbitArray[_currentRing-1]) {
					ringSize = fixedOrbitArray[_currentRing-1];
				}

					if (_node.parent) {
						var _ring = {source: _node, x: _node.x, y: _node.y, r: _node.parent.ring / orbitDepthAdjust(_node) * (_currentRing / _rings)};
					}
					else {
						var _ring = {source: _node, x: _node.x, y: _node.y, r: (orbitSize[0] / 2) * (_currentRing / _rings)};
					}


					var thisPie = d3.layout.pie().value(function(d) {return childrenAccessor(d) ? 4 : 1});
					var piedValues = thisPie(childrenAccessor(_node).filter(function(d,i) {return i >= y && i <= y+ringSize-1}));

					for (var x = y; x<y+ringSize && x<totalChildren;x++) {
						childrenAccessor(_node)[x].angle = ((piedValues[x - y].endAngle - piedValues[x - y].startAngle) / 2) + piedValues[x - y].startAngle;

						childrenAccessor(_node)[x].parent = _node;
						childrenAccessor(_node)[x].depth = _node.depth + 1;

						childrenAccessor(_node)[x].x = childrenAccessor(_node)[x].parent.x + ( (childrenAccessor(_node)[x].parent.ring / 2) * Math.sin( childrenAccessor(_node)[x].angle ) );
						childrenAccessor(_node)[x].y = childrenAccessor(_node)[x].parent.y + ( (childrenAccessor(_node)[x].parent.ring / 2) * Math.cos( childrenAccessor(_node)[x].angle ) );

						childrenAccessor(_node)[x].ring = _ring.r;

						flattenedNodes.push(childrenAccessor(_node)[x]);
						traverseNestedData(childrenAccessor(_node)[x]);
					}
					orbitalRings.push(_ring);
					y+=ringSize;
				}

			}
		}

	}

}