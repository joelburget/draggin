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

var ShapeComponent = React.createClass({
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

var Shape = function(props, children) {
    return ShapeComponent(props);
}



var GroupConstr = function(props, children) {
    this.props = props;
    this.children = children;
};

GroupConstr.prototype.render = function() {
    // all of the children have been constructed but not yet rendered
    this.ids = [];
    var filter = x => x instanceof GroupConstr || x instanceof ShapeConstr;

    var draw = this.children
        .filter(filter)
        .each(child => this.ids.push(add(child)));

    var dom = this.children.filter(x => !(filter(x)));

    return <div>{dom}</div>;
};

var Group = function(props, children) {
    return new GroupConstr(props, children);
};

var GroupComponent = React.createClass({
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
