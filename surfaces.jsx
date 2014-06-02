var React = require('react');
var ReactART = require('react-art');
var RaGroup = ReactART.Group;
var RaShape = ReactART.Shape;
var RaSurface = ReactART.Surface;
var Transform = ReactART.Transform;

var idSource = 0;
var requestId = function() {
    return idSource++;
};

var globalSurface = {};
var add = function(shape) {
    var id = requestId();
    globalSurface[id] = shape;
    return id;
};

var remove = function(id) {
    delete globalSurface[id];
};

var Shape = React.createClass({
    render: function() {
        return <span />;
    },
    componentDidMount: function() {
        this.id = add(RaShape(this.props));
    },
    componentWillUnmount: function() {
        remove(this.id);
    }
});

var Group = React.createClass({
    render: function() {
        return <span />;
    },
    componentDidMount: function() {
        this.id = add(RaGroup({}, this.children));
    },
    componentWillUnmount: function() {
        remove(this.id);
    },

    _domChildren: function() {
    }
});

var getShapes = function() {
    var values = [];
    for (key in globalSurface) {
        if (globalSurface.hasOwnProperty(key)) {
            values.push(globalSurface[key]);
        }
    }
    return values;
};

var Surface = React.createClass({
    render: function() {
        return this.transferPropsTo(<RaSurface>
            {getShapes()}
        </RaSurface>);
    }
});

module.exports = {Group, Shape, Transform, Surface, getShapes};
