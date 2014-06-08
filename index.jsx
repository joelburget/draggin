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

var PTerm = require('./abssyntax.jsx').PTerm;

var Search = require('./search.jsx');
var Workspace = require('./workspace.jsx');

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

React.renderComponent(<Search />, document.getElementById("search"));

var testobj = require("./testjson.js");
var myTerm = PTerm(testobj);
var terms = [myTerm];

var update = function() {
    React.renderComponent(
        <Workspace terms={terms} />,
        document.getElementById("main")
    );
};
update();

window.parseAndShow = function(json) {
    var parsed = JSON.parse(json);
    terms.push(PTerm(parsed));
    update();
};

// enable react devtools :/
// (it only loads if it can find react)
window.React = React;

parseAndShow("{\"tag\":\"PApp\",\"contents\":[{\"fc_end\":[1,5],\"fc_fname\":\"(input)\",\"fc_start\":[1,5]},{\"tag\":\"PRef\",\"contents\":[{\"fc_end\":[1,1],\"fc_fname\":\"(input)\",\"fc_start\":[1,1]},{\"tag\":\"UN\",\"contents\":\"the\"}]},[{\"getTm\":{\"tag\":\"PApp\",\"contents\":[{\"fc_end\":[1,11],\"fc_fname\":\"(input)\",\"fc_start\":[1,11]},{\"tag\":\"PRef\",\"contents\":[{\"fc_end\":[1,6],\"fc_fname\":\"(input)\",\"fc_start\":[1,6]},{\"tag\":\"UN\",\"contents\":\"Vect\"}]},[{\"getTm\":{\"tag\":\"PAlternative\",\"contents\":[false,[{\"tag\":\"PApp\",\"contents\":[{\"fc_end\":[1,13],\"fc_fname\":\"(input)\",\"fc_start\":[1,13]},{\"tag\":\"PRef\",\"contents\":[{\"fc_end\":[1,13],\"fc_fname\":\"(input)\",\"fc_start\":[1,13]},{\"tag\":\"UN\",\"contents\":\"fromInteger\"}]},[{\"getTm\":{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"BI\",\"contents\":2}},\"tag\":\"PExp\",\"priority\":1,\"argopts\":[],\"pname\":{\"tag\":\"MN\",\"contents\":[0,\"arg\"]}}]]},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"BI\",\"contents\":2}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"I\",\"contents\":2}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"B8\",\"contents\":2}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"B16\",\"contents\":2}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"B32\",\"contents\":2}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"B64\",\"contents\":2}}]]},\"tag\":\"PExp\",\"priority\":1,\"argopts\":[],\"pname\":{\"tag\":\"MN\",\"contents\":[0,\"arg\"]}},{\"getTm\":{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"AType\",\"contents\":{\"tag\":\"ATInt\",\"contents\":{\"tag\":\"ITNative\",\"contents\":[]}}}},\"tag\":\"PExp\",\"priority\":1,\"argopts\":[],\"pname\":{\"tag\":\"MN\",\"contents\":[0,\"arg\"]}}]]},\"tag\":\"PExp\",\"priority\":1,\"argopts\":[],\"pname\":{\"tag\":\"MN\",\"contents\":[0,\"arg\"]}},{\"getTm\":{\"tag\":\"PApp\",\"contents\":[{\"fc_end\":[1,19],\"fc_fname\":\"(input)\",\"fc_start\":[1,19]},{\"tag\":\"PRef\",\"contents\":[{\"fc_end\":[1,19],\"fc_fname\":\"(input)\",\"fc_start\":[1,19]},{\"tag\":\"UN\",\"contents\":\"::\"}]},[{\"getTm\":{\"tag\":\"PAlternative\",\"contents\":[false,[{\"tag\":\"PApp\",\"contents\":[{\"fc_end\":[1,20],\"fc_fname\":\"(input)\",\"fc_start\":[1,20]},{\"tag\":\"PRef\",\"contents\":[{\"fc_end\":[1,20],\"fc_fname\":\"(input)\",\"fc_start\":[1,20]},{\"tag\":\"UN\",\"contents\":\"fromInteger\"}]},[{\"getTm\":{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"BI\",\"contents\":1}},\"tag\":\"PExp\",\"priority\":1,\"argopts\":[],\"pname\":{\"tag\":\"MN\",\"contents\":[0,\"arg\"]}}]]},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"BI\",\"contents\":1}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"I\",\"contents\":1}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"B8\",\"contents\":1}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"B16\",\"contents\":1}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"B32\",\"contents\":1}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"B64\",\"contents\":1}}]]},\"tag\":\"PExp\",\"priority\":1,\"argopts\":[],\"pname\":{\"tag\":\"MN\",\"contents\":[0,\"arg\"]}},{\"getTm\":{\"tag\":\"PApp\",\"contents\":[{\"fc_end\":[1,19],\"fc_fname\":\"(input)\",\"fc_start\":[1,19]},{\"tag\":\"PRef\",\"contents\":[{\"fc_end\":[1,19],\"fc_fname\":\"(input)\",\"fc_start\":[1,19]},{\"tag\":\"UN\",\"contents\":\"::\"}]},[{\"getTm\":{\"tag\":\"PAlternative\",\"contents\":[false,[{\"tag\":\"PApp\",\"contents\":[{\"fc_end\":[1,22],\"fc_fname\":\"(input)\",\"fc_start\":[1,22]},{\"tag\":\"PRef\",\"contents\":[{\"fc_end\":[1,22],\"fc_fname\":\"(input)\",\"fc_start\":[1,22]},{\"tag\":\"UN\",\"contents\":\"fromInteger\"}]},[{\"getTm\":{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"BI\",\"contents\":2}},\"tag\":\"PExp\",\"priority\":1,\"argopts\":[],\"pname\":{\"tag\":\"MN\",\"contents\":[0,\"arg\"]}}]]},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"BI\",\"contents\":2}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"I\",\"contents\":2}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"B8\",\"contents\":2}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"B16\",\"contents\":2}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"B32\",\"contents\":2}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"B64\",\"contents\":2}}]]},\"tag\":\"PExp\",\"priority\":1,\"argopts\":[],\"pname\":{\"tag\":\"MN\",\"contents\":[0,\"arg\"]}},{\"getTm\":{\"tag\":\"PRef\",\"contents\":[{\"fc_end\":[1,19],\"fc_fname\":\"(input)\",\"fc_start\":[1,19]},{\"tag\":\"UN\",\"contents\":\"Nil\"}]},\"tag\":\"PExp\",\"priority\":1,\"argopts\":[],\"pname\":{\"tag\":\"MN\",\"contents\":[0,\"arg\"]}}]]},\"tag\":\"PExp\",\"priority\":1,\"argopts\":[],\"pname\":{\"tag\":\"MN\",\"contents\":[0,\"arg\"]}}]]},\"tag\":\"PExp\",\"priority\":1,\"argopts\":[],\"pname\":{\"tag\":\"MN\",\"contents\":[0,\"arg\"]}}]]}");

parseAndShow("{\"tag\":\"PPi\",\"contents\":[{\"tag\":\"Exp\",\"pstatic\":\"Dynamic\",\"pargopts\":[],\"pparam\":false},{\"tag\":\"UN\",\"contents\":\"__pi_arg\"},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"AType\",\"contents\":{\"tag\":\"ATInt\",\"contents\":{\"tag\":\"ITNative\",\"contents\":[]}}}},{\"tag\":\"PConstant\",\"contents\":{\"tag\":\"AType\",\"contents\":{\"tag\":\"ATInt\",\"contents\":{\"tag\":\"ITNative\",\"contents\":[]}}}}]}");
