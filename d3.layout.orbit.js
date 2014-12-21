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

	function _orbitLayout() {

		return _orbitLayout;
	}

	_orbitLayout.mode = function() {
		//Atomic, Solar, other?
	}

	_orbitLayout.start = function() {
		//activate animation here
		tickInterval = setInterval(
			function() {
			currentTickStep++;
			flattenedNodes.forEach(function(_node){
				if (_node.parent) {
					_node.x = _node.parent.x + ( (_node.parent.ring / 2) * Math.sin( _node.angle + (currentTickStep * tickRadianStep * tickRadianFunction(_node))) );
					_node.y = _node.parent.y + ( (_node.parent.ring / 2) * Math.cos( _node.angle + (currentTickStep * tickRadianStep * tickRadianFunction(_node))) );
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
		var _data = nestedNodes; 
	//If you have an array of elements, then create a root node (center)
		//In the future, maybe make a binary star kind of thing?
		if (!childrenAccessor(_data)) {
			orbitNodes = {key: "root", values: _data}
			childrenAccessor(orbitNodes).forEach(function (_node) {
				_node.parent = orbitNodes;
			})
		}
		//otherwise assume it is an object with a root node
		else {
			orbitNodes = _data;
		}
			orbitNodes.x = orbitSize[0] / 2;
			orbitNodes.y = orbitSize[1] / 2;
			orbitNodes.deltaX = function(_x) {return _x}
			orbitNodes.deltaY = function(_y) {return _y}
			orbitNodes.ring = orbitSize[0] / 2;
			orbitNodes.depth = 0;

			flattenedNodes.push(orbitNodes);

			traverseNestedData(orbitNodes)

		function traverseNestedData(_node) {
			if(childrenAccessor(_node)) {
				var thisPie = d3.layout.pie().value(function(d) {return childrenAccessor(d) ? 4 : 1});
				var piedValues = thisPie(childrenAccessor(_node));

				orbitalRings.push({source: _node, x: _node.x, y: _node.y, r: _node.ring / 2});

				for (var x = 0; x<childrenAccessor(_node).length;x++) {

					childrenAccessor(_node)[x].angle = ((piedValues[x].endAngle - piedValues[x].startAngle) / 2) + piedValues[x].startAngle;

					childrenAccessor(_node)[x].parent = _node;
					childrenAccessor(_node)[x].depth = _node.depth + 1;

					childrenAccessor(_node)[x].x = childrenAccessor(_node)[x].parent.x + ( (childrenAccessor(_node)[x].parent.ring / 2) * Math.sin( childrenAccessor(_node)[x].angle ) );
					childrenAccessor(_node)[x].y = childrenAccessor(_node)[x].parent.y + ( (childrenAccessor(_node)[x].parent.ring / 2) * Math.cos( childrenAccessor(_node)[x].angle ) );

					childrenAccessor(_node)[x].deltaX = function(_x) {return _x}
					childrenAccessor(_node)[x].deltaY = function(_y) {return _y}
					childrenAccessor(_node)[x].ring = childrenAccessor(_node)[x].parent.ring / orbitDepthAdjust(_node);

					flattenedNodes.push(childrenAccessor(_node)[x]);
					traverseNestedData(childrenAccessor(_node)[x]);
				}
			}
		}
	}

}