/**
 * @jsx React.DOM
 */

var React = require('react');
var mori = require('mori');
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

var MySurface = React.createClass({
    render: function() {
        return <Surface width={700}
                        height={700}
                        style={{cursor: 'pointer'}}>
            {this.props.children}
        </Surface>;
    },

    getInitialState: function() {
        return {
            x: 100,
            y: 100
        };
    },

    handleMouseDown: function(event) {
        update(mori.assoc(globalState,
            "mouseDown", true
        ));
    },

    handleMouseUp: function(event) {
        update(mori.assoc(globalState,
            "mouseDown", false
        ));
    },

    handleMouseMove: function(event) {
        update(mori.assoc(globalState,
            "mouseX", event.x,
            "mouseY", event.y
        ));
    },

    handleResize: function(e) {
        update(mori.assoc(globalState,
            "windowWidth", window.innerWidth,
            "windowHeight", window.innerHeight
        ));
    },

    componentDidMount: function() {
        window.addEventListener('resize',    this.handleResize);
        window.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup',   this.handleMouseUp);
        window.addEventListener('mousemove', this.handleMouseMove);
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup',   this.handleMouseUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
    }
});

var Batching = require("react-raf-batching/ReactRAFBatching.js");
Batching.inject();

// application state holds:
// - functions and data structures in scope
//   - shape
//   - position
// - current mode: freestyle | searching (is that all?)
// - mouse state
//   - position
//   - dragging?
var globalState = mori.hash_map(
    "mouseX", 0,
    "mouseY", 0,
    "windowWidth", window.innerWidth,
    "windowHeight", window.innerHeight
);

// is this necessary? won't it update anyway?
var requireUpdate = false;

var testobj = require('./testjson.js');

// transact in om
var update = function(newState) {
    requireUpdate = true;
    globalState = newState;

    var tm = PTerm(testobj, null);
    React.renderComponent(
        tm,
        document.getElementById("main")
    );
};

update(globalState);

// $.ajax('http://localhost:4296', {
//     data: '{"tag":"SearchType","contents":"++"}',
$.ajax('http://192.168.8.114:4296', {
    data: '{"tag":"SearchName","contents":"++"}',
    type: 'POST'
})
.then(
    resp => {
        console.log("search came back: ", resp);
        update(mori.assoc(globalState,
            "searchResults", resp
        ));
    }
);

// enable react devtools :/
// (it only loads if it can find react)
window.React = React;
