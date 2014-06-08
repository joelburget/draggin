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

        switch (eventName) {
            case 'dragstart':
                this.setState({ draggingTerm: draggable });
                break;
            case 'dragend':
                this.setState({ draggingTerm: null });
                break;
            case 'dragOver':
                // draggable moved over an elementt
                break;
            case 'dragenter':
                // draggable is being hovered over
                break;
            case 'dragleave':
                // draggable is no longer being hovered over
                break;
        }
    },

    getInitialState: function() {
        return {
            draggingTerm: null
        };
    }
});

module.exports = Workspace;
