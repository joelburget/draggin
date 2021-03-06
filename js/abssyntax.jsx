/**
 * @jsx React.DOM
 */

var React = require('react');
var cx = require('react/addons').classSet;
var merge = require('react/lib/merge');
var mergeInto = require('react/lib/mergeInto');
var LayeredComponentMixin = require('react-components/layered-component-mixin');
var TeX = require('react-components/tex');
var _ = require('underscore');
var RCSS = require('rcss');

var ReactART = require('react-art');
var Group = ReactART.Group;
var Surface = ReactART.Surface;

var Prims = require('./prims.jsx');
var Renderable = Prims.Renderable;
var Write = Prims.Write;
var DataTypeMixin = Prims.DataTypeMixin;
var colors = Prims.colors;
var clearfix = Prims.clearfix;

var AsType = require('./astype.jsx');

var programNodeStyle = RCSS.registerClass({
    display: "inline-block",
    background: colors.nodeBg,
    margin: "5px",
    borderColor: "transparent",
    borderWidth: "1px",
    borderStyle: "solid",
    padding: "5px",
    position: "relative"
});

var programNodeStyleHover = RCSS.registerClass(merge(
    programNodeStyle.style,
    { borderColor: colors.borderColor }
));

var programNodeStyleDrag = RCSS.registerClass(merge(
    programNodeStyle.style, {
        borderColor: colors.borderColor,
        backgroundColor: '#81D9FF'
    }
));

var programNodeStyleAccepting = RCSS.registerClass(merge(
    programNodeStyle.style,
    { backgroundColor: 'red' }
));

var c = {
    darkGreen: "#5b9032",
    darkRed: "#793541",
    aqua: "#1c758a",
    turquoise: "#49a88f",
    orangeRed: "#cf5044",
    purple: "#8e4c9b"
};

var typeBanner = {
    position: "absolute",
    width: "100%",
    height: "3px",
    backgroundColor: c.orangeRed,
    left: 0,
    bottom: 0
};

var nodeColors = {
    "Case": c.darkGreen,
    "Pi": c.purple,
    "App": c.aqua,
    "Ref": c.orangeRed,
    "Type": c.darkRed,
    "UserName": c.turquoise,
    "MachineName": c.orangeRed
};

var typeBannerStyles = {};
_.each(nodeColors, (v, k) => {
    typeBannerStyles[k] = RCSS.cascade(typeBanner, {
        backgroundColor: v
    });
    typeBannerStyles[k] = RCSS.registerClass(typeBannerStyles[k]);
});

typeBanner = RCSS.registerClass(typeBanner);

var NodeMixin = {
    propTypes: {
        ast: React.PropTypes.object.isRequired,
        workspace: React.PropTypes.object.isRequired,
        lens: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
    },
    buildProps: function(accessor) {
        var newArr = this.props.lens.slice();
        newArr.push(accessor);
        return {
            ast: this.props.ast[accessor],
            lens: newArr,
            workspace: this.props.workspace
        };
    },
    render: function() {
        return ProgramNode(this.props, this._render());
    }
};

var TypeBanner = React.createClass({
    render: function() {
        var typeBannerClassName = this.props.ast ?
            typeBannerStyles[this.props.ast.instance].className :
            typeBanner.className;
        return <div className={typeBannerClassName} />;
    }
});

_.mixin({
    hasEqual: function(arr, val) {
        return _(arr).foldl((memo, item) => memo || _(val).isEqual(item),
            false);
    }
});

var ProgramNode = React.createClass({
    getInitialState: function() {
        return {
            hovered: false
        };
    },

    render: function() {
        var ast = this.props.ast;

        var beingDragged =
            this.props.workspace.state.draggingTerm === this.props.ast;

        var accepting = _(this.props.workspace.state.holesAccepting)
            .hasEqual(this.props.lens);

        var className = programNodeStyle.className;
        if (beingDragged) {
            className = programNodeStyleDrag.className;
        } else if (accepting) {
            className = programNodeStyleAccepting.className;
        } else if (this.state.hovered) {
            className = programNodeStyleHover.className;
        }

        var style = {}

        return this.transferPropsTo(
            <div className={className}
                 draggable={this.props.draggable}
                 onDragStart={this.tell}
                 onDragEnd={this.tell}
                 onDragOver={this.tell}
                 onDragEnter={this.tell}
                 onDragLeave={this.tell}
                 onDrop={this.tell}
                 onMouseEnter={() => this.setState({hovered: true})}
                 onMouseLeave={() => this.setState({hovered: false})}>

                {this.props.children}
                <TypeBanner ast={ast} />

            </div>);
    },

    getDefaultProps: function() {
        return {
            draggable: true
        };
    },

    tell: function(event) {
        return this.props.workspace.tell(event, this.props.ast);
    }
});

// App Term [Term] -- ^ e.g. IO (), List Char, length x
//
// This is a really interesting class. It could look a few different ways
// depending on the context.
//
// * infix operators (+, *, etc)
// * prefix application (f g)
// * special forms ([1,2])
window.App = React.createClass({
    mixins: [NodeMixin],
    _render: function() {
        var form = this.recognizeForm();
        if (form === this.type.SPECIAL) {
            return this.transferPropsTo(ProgramApplicationBrackets());
        }

        var app = this.props.app;
        var termComponent = app.term.component({workspace: this.props.workspace});
        var argComponents = app.args.map(
            arg => arg.term.component({workspace: this.props.workspace})
        );

        var inner;
        if (form === this.type.INFIX) {
            inner = [argComponents[0], termComponent, argComponents[1]];
        } else { // prefix
            inner = [termComponent, argComponents];
        }
        return inner;
    },
    recognizeForm: function() {
        var term = this.props.app.term;
        if (!(term instanceof PRef)) {
            return this.type.PREFIX;
        }

        var name = term.name.name();
        if (name === '::') {
            return this.type.SPECIAL;
        }

        var isInfix = this.type.infixOps.indexOf(name) !== -1;

        return isInfix ? this.type.INFIX : this.type.PREFIX;
    },
    statics: {
        INFIX: 'INFIX',
        PREFIX: 'PREFIX',
        SPECIAL: 'SPECIAL',

        infixOps: ['+', '-', '*', '/']
    }
});

var ProgramApplicationBrackets = React.createClass({
    // show a list or vect in brackets
    render: function() {
        var app = this.props.app;
        var head = app.args[0];
        var tail = app.args[1];

        var pieces = [head];

        // invariants:
        // * head and tail point to a PExp
        // * head is not nil
        while (this.isCons(tail) && !this.isNil(tail)) {
            head = tail.term.args[0];
            tail = tail.term.args[1];

            pieces.push(head);
        }

        var components = pieces.map(x => x.term.component({
            style: { 'float': 'left' },
            workspace: this.props.workspace
        }));

        var bracketStyle = { fontSize: '150%' };

        return <ProgramNode ast={app} workspace={this.props.workspace}>
            <TeX style={bracketStyle}>[</TeX>
            {components}
            <TeX style={bracketStyle}>]</TeX>
        </ProgramNode>;
    },

    isNil: function(pexp) {
        return (pexp.term instanceof PRef) && pexp.term.name.name() === 'Nil';
    },

    isCons: function(pexp) {
        return true;
        var term = pexp.term;
        if (!(term instanceof PApp)) {
            return false;
        }
        return true;

        var appTm = pterm.contents[1];

        if (appTm.tag !== 'PRef') {
            return false;
        }

        // TODO use name class
        return appTm.contents[1].contents === '::';
    }
});

// Pi Term Term -- ^ n -> t2
window.Pi = React.createClass({
    // mixins: [LayeredComponentMixin],
    mixins: [NodeMixin],
    _render: function() {
        var outerStyle = { display: 'table-cell' };

        var arrStyle = {
            display: 'table-cell',
            verticalAlign: 'top',
            paddingTop: '10px',
            fontSize: '120%',
            float: 'left'
        };

        var style = RCSS.cascade({
                display: 'table-cell',
                padding: '10px',
                float: 'left'
            },
            clearfix
        );
        style = RCSS.registerClass(style);

        var name = null;

        return [
            Term(this.buildProps('slot1')),
            <TeX>\rightarrow</TeX>,
            Term(this.buildProps('slot2'))
        ];

        return <ProgramNode style={outerStyle}
                            draggable={false}
                            ast={pi}
                            workspace={this.props.workspace}>
                            {/*
            <div className={style.className} ref="ty1"
                 onMouseEnter={() => this.handleEnter(0)}
                 onMouseLeave={() => this.handleLeave(0)}>
                {name}
                <div style={{float: 'left'}}>
                    {pi.t1.component({workspace: this.props.workspace})}
                </div>
            </div>
            <TeX style={arrStyle}>\rightarrow</TeX>
            <div className={style.className} ref="ty2"
                 onMouseEnter={() => this.handleEnter(1)}
                 onMouseLeave={() => this.handleLeave(1)}>
                <div style={{float: 'left'}}>
                    {pi.t2.component({workspace: this.props.workspace})}
                </div>
            </div>
            */}
            <div style={{float: 'left'}}>
                {pi.t1.component({workspace: this.props.workspace})}
            </div>
            <TeX style={arrStyle}>\rightarrow</TeX>
            <div style={{float: 'left'}}>
                {pi.t2.component({workspace: this.props.workspace})}
            </div>
        </ProgramNode>;
    },

    handleEnter: function(num) {
        this.setState({ hover: num });
    },

    handleLeave: function(num) {
        this.setState({ hover: null });
    },

    // blue chevrons
    renderLayer: function() {
        var types = [this.refs.ty1, this.refs.ty2];
        var components = types.map((ty, ix) => {
            var $node = $(ty.getDOMNode());
            var props = $node.position();
            var w = $node.innerWidth() - 6;
            var h = 24;
            mergeInto(props, { w, h });
            props.left -= 10;
            props.top += 2;
            props.hover = ix === this.state.hover;

            return AsType(props);
        });

        var $node = $(this.getDOMNode());
        var offset = $node.offset();
        var w = $node.outerWidth();
        var h = $node.outerHeight();

        var style = {
            position: 'absolute',
            zIndex: -1
        };
        mergeInto(style, offset);

        return <Surface width={w} height={h} style={style}>
            {components}
        </Surface>;
    },

    getInitialState: function() {
        return { hover: null };
    }
});

// Ref Name Term -- ^ n : t
window.Ref = React.createClass({
    mixins: [NodeMixin],
    _render: function() {
        return [
            Name(this.buildProps('slot1')),
            ":",
            Term(this.buildProps('slot2'))
        ];
    }
});

window.Type = React.createClass({
    mixins: [NodeMixin],
    _render: function() {
        return "Type";
    }
});

var casesStyles = RCSS.registerClass({});

// Case Term [(Term, Term)]
window.Case = React.createClass({
    mixins: [NodeMixin],
    _render: function() {
        var cases = this.props.ast.slot2;

        return [
            cases.arg.component({workspace: this.props.workspace}),
            this.getCaseComponents(cases.cases)
        ];
    },

    getCaseComponents: function(cases) {
        // special case 1 case?

        var components = cases.map(tms => <div>
            {tms[0].component({workspace: this.props.workspace})}
            <TeX>\Rightarrow</TeX>
            {tms[1].component({workspace: this.props.workspace})}
        </div>);

        return <div className={casesStyles.className}>
            {components}
        </div>;
    }
});

window.UserName = React.createClass({
    render: function() {
        return <div className={programNodeStyle.className}>
            {this.props.ast.slot1}
        </div>;
    }
});

window.MachineName = React.createClass({
    render: function() {
        return <div className={programNodeStyle.className}>
            {this.props.ast.slot1}
        </div>;
    }
});

window.Name = React.createClass({
    render: function() {
        return window[this.props.ast.instance](this.props);
    }
});

window.Term = React.createClass({
    render: function() {
        return window[this.props.ast.instance](this.props);
    }
});

module.exports = {
    Term,
    Ref, Pi, App, Case, Type,

    Name,
    UserName, MachineName
};
