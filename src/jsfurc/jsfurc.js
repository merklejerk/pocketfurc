define(
	["underscore", "./Client", "./Constants", "./RetrieveToon", "./Eventful"],
 	function( _, Client, Constants, RetrieveToon, Eventful ) {

	var jsfurc = {
		"Client": Client,
		"retrieve_toon": RetrieveToon.retrieve,
		"Eventful": Eventful
	};

	return _.extend( jsfurc, Constants );
} );
