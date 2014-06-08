/**
 * @jsx React.DOM
 */

var React = require('react');
var RCSS = require("RCSS");

var _ = require("underscore");

var ReactART = require('react-art');
var Group = ReactART.Group;
var Text = ReactART.Text;
var Transform = ReactART.Transform;

var Prims = require('./prims.jsx');
var Renderable = Prims.Renderable;
var Write = Prims.Write;
var Rect = Prims.Rect;

var TT = require('./tt.jsx');

// -- | Names are hierarchies of strings, describing scope (so no danger of
// -- duplicate names, but need to be careful on lookup).
// data Name = UN T.Text -- ^ User-provided name
//           | NS Name [T.Text] -- ^ Root, namespaces
//           | MN Int T.Text -- ^ Machine chosen names
//           | NErased -- ^ Name of something which is never used in scope
//           | SN SpecialName -- ^ Decorated function names
//           | SymRef Int -- ^ Reference to IBC file symbol table (used during serialisation)

class UserName {
    constructor(args) {
        this._name = args;
    }

    get name() {
        return this._name;
    }
}
class NameSpace {
    constructor(args) {
        this.enclosedName = Name(args[0]);
        this.parts = args[1];
    }

    get qualifiedName() {
        return `${this.namespace()}::${this.baseName()}`;
    }

    get namespace() {
        return this.parts.join("::");
    }

    get baseName() {
        return this.enclosedName.name();
    }

    get name() {
        return this.qualifiedName();
    }
}

var nameTypes = {
    "NS": NameSpace,
    "UN": UserName
};
function Name(json) {
    return new nameTypes[json.tag](json.contents);
}


var searchContainerStyle = RCSS.createClass({
    height: "100%",
    position: "fixed",
    right: 0,
    top: 0,
    width: "300px",
    height: "100%",
    background: "lightgray"
});

var searchResultStyle = RCSS.createClass({
    background: "white",
    border: "1px solid black",
    padding: "20px",
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
    overflowY: "scroll",
    height: "89%"
});


var ResultTitle = React.createClass({
    propTypes: {
        name: React.PropTypes.oneOfType([
            React.PropTypes.instanceOf(NameSpace),
            React.PropTypes.instanceOf(UserName)
        ])
    },

    render: function() {
        var name = this.props.name;
        return <div className={titleStyle.className}>
            <span className={nameStyle.className}>{name.name()}</span>
        </div>;
    }
});

var Result = React.createClass({
    propTypes: {
        result: React.PropTypes.array.isRequired
    },

    render: function() {
        var descriptionHTML = this.props.result[2];
        var name = Name(this.props.result[0]);
        return <div className={searchResultStyle.className}>
            <ResultTitle name={name} />
            <br />
            <div className="description" dangerouslySetInnerHTML={{
                __html: descriptionHTML
            }} />
        </div>
    }
});

var Search = React.createClass({
    getInitialState: function() {
        var req = this.makeRequest("++")
        return {
            results: [],
            request: req,
            searching: true
        };
    },

    makeRequest: function(searchText) {
        var request = $.ajax('http://localhost:4296', {
            data: '{"tag":"SearchName","contents":"' + searchText + '"}',
            type: 'POST'
        });
        request.then(
            resp => {
                console.log("search came back: ", resp);
                if (this.isMounted()) {
                    this.setState({
                        results: resp.results,
                        request: null,
                    });
                }
            }
        );
        return request;
    },

    onSearchChange: function(e) {
        var searchText = this.refs.searchText.getDOMNode().value;
        if (this.state.request) {
            this.state.request.abort();
        }
        var request = this.makeRequest(searchText);
        this.setState({
            results: [],
            request: request,
        })
    },

    render: function() {
        var results = this.state.results.map(resultObj =>
            <Result result={resultObj} />
        );

        return <div className={searchContainerStyle.className}>
            <div>
                <h1>Name search</h1>
                <input type="text"
                       ref="searchText"
                       onChange={_.throttle(this.onSearchChange, 50)} />
            </div>
            <div className={searchResultContainerStyle.className}>
                {results}
            </div>
        </div>;
    }
});

module.exports = Search;
