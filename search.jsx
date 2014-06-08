/**
 * @jsx React.DOM
 */

var React = require('react');
var RCSS = require("RCSS");

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

var searchResultStyle = RCSS.createClass({
    border: "1px solid black",
    padding: "20px",
    width: "300px",
    overflowX: "scroll"
});

var titleStyle = RCSS.createClass({
    fontSize: "18px"
});

var nameStyle = RCSS.createClass({
    color: "#4183C4",
    fontSize: "20px"
});

var searchResultContainerStyle = RCSS.createClass({
    height: "100%",
    position: "fixed",
    right: 0,
    overflowY: "scroll"
});

var ResultTitle = React.createClass({
    propTypes: {
        nameInfo: React.PropTypes.array.isRequired
    },

    render: function() {
        var namespaceStr = this.props.nameInfo.contents[1].join("::");
        var nameStr = this.props.nameInfo.contents[0].contents;

        return <div className={titleStyle.className}>
            <span>{namespaceStr}::</span>
            <span className={nameStyle.className}>{nameStr}</span>
        </div>;
    }
});

var Result = React.createClass({
    propTypes: {
        result: React.PropTypes.array.isRequired
    },

    render: function() {
        var descriptionHTML = this.props.result[2];
        var nameInfo = this.props.result[0];
        return <div className={searchResultStyle.className}>
            <ResultTitle nameInfo={nameInfo} />
            <br />
            <div className="description" dangerouslySetInnerHTML={{
                __html: descriptionHTML
            }} />
        </div>
    }
});

var Search = React.createClass({
    render: function() {
        var results = this.props.results.map(resultObj => 
            <Result result={resultObj} />
        );

        return <div className={searchResultContainerStyle.className}>
            {results}
        </div>;
    }
});

module.exports = Search;
