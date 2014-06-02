/**
 * @jsx React.DOM
 */

var React = require('react');
// var RCSS = require('RCSS');

var surfaces = require('./surfaces.jsx');
var Group = surfaces.Group;
var Shape = surfaces.Shape;
var Surface = surfaces.Surface;
var Transform = surfaces.Transform;

/*
var style = RCSS.createClass({
    border: '1px solid #ddd'
});
*/
var style = "foo";

var Name = React.createClass({
    propTypes: {
        name: React.PropTypes.string
    },
    render: function() {
        return <span className={style}>{this.props.name}</span>;
    }
});

var NameDefn = React.createClass({
    propTypes: {
        name: React.PropTypes.string
    },
    render: function() {
        return <span className={style}>{this.props.name}</span>;
    }
});

var RightArr = React.createClass({
    render: function() {
        return this.transferPropsTo(
            <Shape d={RIGHT_ARR_PATH} stroke="#000" strokeWidth={5} />
        );
    }
});

var Arrows = React.createClass({
    render: function() {
        return this.transferPropsTo(
            <Group>
                <Shape d={LEFT_ARR_PATH} stroke="#000" strokeWidth={5} />
                <Shape d={RIGHT_ARR_PATH} stroke="#000" strokeWidth={5} />
            </Group>
        );
    }
});

var Func = React.createClass({
    render: function() {
        var scale = 0.2;
        var inputs = this.props.inputs.map((input, index) => {
            var trans = new Transform()
                .scale(scale, scale, 0, 0)
                .move(0, index*50);
            return <Group>
                {input}
                <RightArr transform={trans} />
            </Group>;
        });

        var outTrans = new Transform()
            .scale(scale, scale, 0, 0)
            .move(100, 25);
        var output = <RightArr transform={outTrans} />;

        return <div>
            {inputs}
            <Name name={this.props.name} />
            {output}
        </div>;
    }
});

LEFT_ARR_PATH = "m56.77774,2.5l-54.27774,54.31506l54.27774,54.2749l19.73633,-19.73633l-34.53857,-34.53857l34.53857,-34.53857l-19.73633,-19.77649z";
RIGHT_ARR_PATH = "m22.21916,62l-19.71916,19.73633l34.53857,34.53857l-34.53857,34.54431l19.71916,19.73633l54.29494,-54.28064l-54.29494,-54.2749z";

var MySurface = React.createClass({
    render: function() {
        return <div>
            <Surface width={700}
                     height={700}
                     style={{cursor: 'pointer'}} />
            <Func inputs={["foo", "bar"]} name="f" />
        </div>;
    },
    componentDidMount: function() {
        // TODO get rid of this hack - update when registered components update
        setInterval(() => { this.forceUpdate(); }, 50);
    }
});

var Batching = require("react-raf-batching/ReactRAFBatching.js");
Batching.inject();

React.renderComponent(<MySurface />, document.getElementById("main"));
