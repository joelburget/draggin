/**
 * @jsx React.DOM
 */

var React = require('react');

var ReactART = require('react-art');
var Group = ReactART.Group;
var Text = ReactART.Text;
var Transform = ReactART.Transform;

var Prims = require('./prims.jsx');
var Renderable = Prims.Renderable;
var Write = Prims.Write;
var Rect = Prims.Rect;

var TT = require('./tt.jsx');

var ResultC = React.createClass({
    render: function() {
        // yes, i know the docs are html formatted. do i look like i care?
        return <Group transform={this.props.trans}>
            {this.props.children}
        </Group>;
            // <Write>{this.props.contents.docs}</Write>
    }
});

var Result = function(contents) {
    var raw = contents[0];
    var docs = contents[1];

    this.contents = { raw, docs };

    // children which are Renderables
    this.children = [TT.create(raw)];
};

Result.prototype = new Renderable();
Result.prototype.component = ResultC;
Result.prototype.getSize = function() {
    var sz = this.children[0].getSize();
    return {
        w: 300,
        h: sz.h + 20
    };
};

var Search = React.createClass({
    render: function() {
        var posY = 100;
        var results = [];

        for (var i = 0; i < this.props.results.length; i++) {
            var item = this.props.results[i];
            var obj = new Result(item);
            posY += obj.getSize().h;
            var trans = new Transform().move(0, posY);
            results.push(obj.render(trans));
        }

        if (results.length === 0) {
            results = null;
        }

        return <Group>
            {results}
        </Group>;
    }
});

module.exports = Search;
