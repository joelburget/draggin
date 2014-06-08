/**
 * @jsx React.DOM
 */

var React = require('react');

var AbsSyntax = require('./abssyntax.jsx');
var PTerm = AbsSyntax.PTerm;

var Workspace = React.createClass({
    propTypes: {
        terms: React.PropTypes.arrayOf(React.PropTypes.instanceOf(PTerm))
    },
    render: function() {
        var workspaceState = {
            workspace: this
        };

        return <section>
            {this.props.terms.map(tm => tm.component(workspaceState))}
        </section>;
    },

    tell: function(eventName, draggable) {
        console.log(eventName, draggable);

        if (eventName === 'dragstart') {
            this.setState({ draggingTerm: draggable });
        }
    },

    getInitialState: function() {
        return {
            draggingTerm: null
        };
    }
});

module.exports = Workspace;
