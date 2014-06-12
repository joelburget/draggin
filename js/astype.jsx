/**
 * @jsx React.DOM
 */

var React = require('react');
var ReactART = require('react-art');
var Group = ReactART.Group;
var Shape = ReactART.Shape;
var Surface = ReactART.Surface;
var Transform = ReactART.Transform;

var colors = require('./prims.jsx').colors;

var path = (w, h) => `m0,0l${w},0l5,${h/2}l-5,${h/2}l-${w},0l5,-${h/2}l-5,-${h/2}z`;

var AsType = React.createClass({
    render: function() {
        var shrink = new Transform().move(3, 0);
        var d = path(this.props.w, this.props.h);

        return <Group x={this.props.left}
                      y={this.props.top}>
            <Shape d={d} fill={colors.darker} />
            <Shape d={d} transform={shrink}
                                    fill={this.props.hover ?
                                          colors.hover :
                                          colors.lighter} />
        </Group>;
    }
});

module.exports = AsType;
