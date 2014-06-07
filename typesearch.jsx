/**
 * @jsx React.DOM
 */

var React = require('react');

var ReactART = require('react-art');
var Group = ReactART.Group;

var constructSearch = function(obj) {
	return {
		tag: "SearchType",
		contents: obj.toJSON()
	};
};

var TypeSearch = React.createClass({
	render: function() {
		return <Group></Group>;
	}
});
