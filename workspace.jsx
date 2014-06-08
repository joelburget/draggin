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

    tell: function(event, ast) {
        var duplicate = event.shiftKey;
        console.log(event.type, ast, event.target);
        switch (event.type) {
            case 'dragstart':
                this.setState({ draggingTerm: ast });
                event.stopPropagation();
                break;

            case 'dragend':
                // ast is the dragged node
                this.setState({ draggingTerm: null });
                return false;
                break;

            case 'dragOver':
                // ast moved over an elementt

                // allow a drop. TODO - only allow in certain cases
                event.preventDefault();
                break;

            case 'dragenter':
                if (ast.canAccept(this.state.draggingTerm)) {
                    // super highlight ast
                }
                // ast is being hovered over
                break;

            case 'dragleave':
                // ast is no longer being hovered over
                break;

            case 'drop':
                // ast is the target of the drop
        }
    },

    getInitialState: function() {
        return {
            draggingTerm: null
        };
    }
});

module.exports = Workspace;
