/**
 * @jsx React.DOM
 */

var React = require('react');
var $ = require('jquery');

var ReactART = require('react-art');
var Group = ReactART.Group;
var Shape = ReactART.Shape;
var Surface = ReactART.Surface;
var Text = ReactART.Text;
var Transform = ReactART.Transform;

var Prims = require('./prims.jsx');
var RightArr = Prims.RightArr;
var Rect = Prims.Rect;
var Write = Prims.Write;

var PTerm = require('./abssyntax.jsx');

var Search = require('./search.jsx');

var Name = React.createClass({
    propTypes: {
        name: React.PropTypes.string
    },
    render: function() {
        return <Write>{this.props.name}</Write>;
    }
});

var Func = React.createClass({
    render: function() {
        var scale = 0.2;
        var inputs = this.props.inputs.map((input, index) => {
            var move = new Transform().move(0, index*50);
            var resize = new Transform().scale(scale, scale, 0, 0)

            return <Group transform={move}>
                <Write alignment="right">{input}</Write>
                <RightArr transform={resize} />
            </Group>;
        });

        var outTrans = new Transform()
            .scale(scale, scale, 0, 0)
            .move(100, 25);
        var output = <RightArr transform={outTrans} />;

        return <Group trans={this.props.trans}
                      width={100}
                      height={50}
                      onMouseDown={this.props.onMouseDown}
                      onMouseUp={this.props.onMouseUp}
                      onMouseMove={this.props.onMouseMove}>
            <Rect w={100} h={50} fill='green' opacity={0.2} />
            {inputs}
            <Name name={this.props.name} />
            {output}
        </Group>;
    }
});

var testobj = require('./testjson.js');

React.renderComponent(
    PTerm(testobj, null),
    document.getElementById("main")
);

// $.ajax('http://localhost:4296', {
//     data: '{"tag":"SearchType","contents":"++"}',
$.ajax('http://192.168.8.114:4296', {
    data: '{"tag":"SearchName","contents":"++"}',
    type: 'POST'
})
.then(
    resp => {
        console.log("search came back: ", resp);
    }
);

// enable react devtools :/
// (it only loads if it can find react)
window.React = React;
