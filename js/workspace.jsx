/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('underscore');

var AbsSyntax = require('./abssyntax.jsx');
var Term = AbsSyntax.Term;
var Abs = Strict.AbsSyntax;
var holesAccepting = Abs.holesAccepting;

var sty = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: 20
};

var Workspace = React.createClass({
    propTypes: {
        terms: React.PropTypes.arrayOf(React.PropTypes.instanceOf(Term))
    },
    render: function() {
        var hoverSty = this.state.beingHovered ?
            { backgroundColor: 'rgb(218, 255, 243)' } :
            {};
        var style = _({}).extend(sty, hoverSty);


        return <div style={style}
                    onDragEnter={this.handleDragEnter}
                    onDragLeave={this.handleDragLeave}
                    onDragStart={this.handleDragStart}
                    onDrop={this.handleDrop}>
            {this.props.terms.map(tm => Term({
                ast: tm,
                lens: [],
                workspace: this
            }))}
        </div>;
    },

    tell: function(event, ast) {
        var duplicate = event.shiftKey;

        switch (event.type) {
            case 'dragstart':
                this.setState({ draggingTerm: ast });
                event.stopPropagation();
                break;

            case 'dragend':
                // ast is the dragged node
                this.setState({ draggingTerm: null });
                break;

            case 'dragOver':
                // ast moved over an elementt

                // allow a drop. TODO - only allow in certain cases
                event.preventDefault();
                break;

            case 'dragenter':
                /*
                if (ast.canAccept(this.state.draggingTerm)) {
                    // super highlight ast
                }
                */
                // ast is being hovered over
                event.stopPropagation();
                break;

            case 'dragleave':
                // ast is no longer being hovered over
                event.stopPropagation();
                break;

            case 'drop':
                event.stopPropagation();
                // ast is the target of the drop
        }
    },

    handleDragEnter: function(event) {
        this.setState({ beingHovered: true });
    },

    handleDragLeave: function(event) {
        this.setState({ beingHovered: false });
    },

    handleDragStart: function(event) {
        event.stopPropagation();
    },

    handleDrop: function(event) {
        console.log('drop');
    },

    getInitialState: function() {
        return {
            draggingTerm: null
        };
    }
});

module.exports = Workspace;
