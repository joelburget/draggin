var React = require('react');

var ReactART = require('react-art');
var Group = ReactART.Group;
var Shape = ReactART.Shape;
var Surface = ReactART.Surface;
var Text = ReactART.Text;
var Transform = ReactART.Transform;

var RightArr = React.createClass({
    render: function() {
        return this.transferPropsTo(
            <Shape d={RIGHT_ARR_PATH} stroke={fillColor} strokeWidth={5} />
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

var MyText = React.createClass({
    render: function() {
        var trans = new Transform().scale(2, 2, 0, 0);
        return this.transferPropsTo(<Text
                     font="normal 'Lucida Grande' 12px"
                     fill={fillColor}
                     transform={trans}>
            {this.props.children}
        </Text>);
    }
});

RECT_PATH = "m0,0h1v1h-1z"; // hand-crafted svg :D

LEFT_ARR_PATH = "m56.77774,2.5l-54.27774,54.31506l54.27774,54.2749l19.73633,-19.73633l-34.53857,-34.53857l34.53857,-34.53857l-19.73633,-19.77649z";
RIGHT_ARR_PATH = "m22.21916,62l-19.71916,19.73633l34.53857,34.53857l-34.53857,34.54431l19.71916,19.73633l54.29494,-54.28064l-54.29494,-54.2749z";

module.exports = {RightArr, Rect, MyText};
