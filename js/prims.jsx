var React = require('react');

var ReactART = require('react-art');
var Group = ReactART.Group;
var Shape = ReactART.Shape;
var Surface = ReactART.Surface;
var Text = ReactART.Text;
var Transform = ReactART.Transform;

var colors = {
    // program nodes
    nodeBg: "rgba(221, 221, 221, 0.4)",
    borderColor: "#bbb",

    // types
    fill: '#555',
    lighter: '#79D7FF',
    darker: '#00B3FF',
    hover: 'rgb(255, 171, 160)'
};

var clearfix = {
    ':before': {
        content: '""',
        display: 'table'
    },
    ':after': {
        content: '""',
        display: 'table',
        clear: 'both'
    }
};

var DataTypeMixin = {
    renderAlt: function() {
        var cls = this.type.constrs[this.props.tag];
        return cls(this.props);
    }
};

/* to render a component must know (negotiate) how large its children will be
 * to tell its parent how large it will be it must know how large its children will be
 * - sizing flows bottom -> top
 *
 * to position a component must have positioning from its parent
 * - positioning flows to -> bottom
 */

/* protocol:
 * - render : () -> React Component
 * - getSize : () -> {w, h}
 * - toJSON : () -> object
 */
var Renderable = function() {};

// don't override this! set this.component and this.contents
// (also don't use an arrow function here! this will be bound to the wrong thing)
Renderable.prototype.render = function(trans) {
    return this.component(
        { contents: this.contents, trans: trans },
        this.children.map(x => x.render())
    );
};

// override these!
Renderable.prototype.getSize = () => { return {w: 0, h: 0}; };
Renderable.prototype.children = [];
Renderable.prototype.toJSON = function() {
    return {
        tag: this.tag,
        contents: this.children
    };
};

var RightArr = React.createClass({
    render: function() {
        return this.transferPropsTo(
            <Shape d={RIGHT_ARR_PATH} stroke={colors.fill} strokeWidth={5} />
        );
    }
});

var Rect = React.createClass({
    render: function() {
        var trans = new Transform().scale(this.props.w, this.props.h, 0, 0);

        return this.transferPropsTo(
            <Shape d={RECT_PATH} transform={trans} />
        );
    }
});

var Write = React.createClass({
    render: function() {
        var trans = new Transform().scale(1.5, 1.5, 0, 0);
        return this.transferPropsTo(<Text
                     font="normal 'Lucida Grande' 12px"
                     fill={colors.fill}
                     transform={trans}>
            {this.props.children}
        </Text>);
    }
});

RECT_PATH = "m0,0h1v1h-1z"; // hand-crafted svg :D

LEFT_ARR_PATH = "m56.77774,2.5l-54.27774,54.31506l54.27774,54.2749l19.73633,-19.73633l-34.53857,-34.53857l34.53857,-34.53857l-19.73633,-19.77649z";
RIGHT_ARR_PATH = "m22.21916,62l-19.71916,19.73633l34.53857,34.53857l-34.53857,34.54431l19.71916,19.73633l54.29494,-54.28064l-54.29494,-54.2749z";

module.exports = {Renderable, RightArr, Rect, Write, DataTypeMixin, colors, clearfix};
