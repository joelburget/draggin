/**
 * @jsx React.DOM
 */

var React = require('react');
var cx = require('react/addons').classSet;
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

var Name = require('./tt.jsx').Name;
var AsType = require('./astype.jsx');

var programNodeStyle = {
    display: "inline-block",
    background: colors.nodeBg,
    margin: "5px",
    borderColor: "transparent",
    borderWidth: "1px",
    borderStyle: "solid",
    padding: "5px",
    position: "relative"
};

var programNodeStyleHover = RCSS.merge(programNodeStyle, {
    borderColor: colors.borderColor
});

var programNodeStyleDrag = RCSS.merge(programNodeStyle, {
    borderColor: colors.borderColor,
    backgroundColor: '#81D9FF'
});

RCSS.createClass(programNodeStyle);
RCSS.createClass(programNodeStyleHover);
RCSS.createClass(programNodeStyleDrag);

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
    "PCase": c.darkGreen,
    "PPi": c.purple, // TODO :(
    "PApp": c.aqua,
    "PConstant": c.turquoise,
    "PRef": c.orangeRed, // TODO :(
    "PAlternative": c.darkRed
};

var typeBannerStyles = {};
_.each(nodeColors, (v, k) => {
    typeBannerStyles[k] = RCSS.merge(typeBanner, {
        backgroundColor: v
    });
    typeBannerStyles[k] = RCSS.createClass(typeBannerStyles[k]);
});

typeBanner = RCSS.createClass(typeBanner);
programNodeStyle = RCSS.createClass(programNodeStyle);
programNodeStyleHover = RCSS.createClass(programNodeStyleHover);

var ProgramNode = React.createClass({
    propTypes: {
        ast: React.PropTypes.instanceOf(PTermBase)
    },

    getInitialState: function() {
        return {
            hovered: false
        };
    },

    render: function() {
        var className = programNodeStyle.className;
        // var className = this.state.hovered ?
        //     programNodeStyleHover.className :
        //     programNodeStyle.className;

        var ast = this.props.ast;
        var typeBannerClassName = ast ?
            typeBannerStyles[ast.constructor.name].className :
            typeBanner.className;

        // TODO why doesn't this work
        var beingDragged =
            this.props.workspace.state.draggingTerm === this.props.ast;

        if (beingDragged) {
            className = programNodeStyleDrag.className;
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
                <div className={typeBannerClassName} />

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

// PApp FC PTerm [PArg] -- ^ e.g. IO (), List Char, length x
//
// This is a really interesting class. It could look a few different ways
// depending on the context.
//
// * infix operators (+, *, etc)
// * prefix application (f g)
// * special forms ([1,2])
var ProgramApplication = React.createClass({
    propTypes: {
        app: React.PropTypes.instanceOf(PApp).isRequired
    },

    render: function() {
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
        return <ProgramNode ast={app} workspace={this.props.workspace}>
            {inner}
        </ProgramNode>;
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
    propTypes: {
        app: React.PropTypes.instanceOf(PApp).isRequired
    },

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

// PAlternative Bool [PTerm] -- True if only one may work
var ProgramAlternative = React.createClass({
    propTypes: {
        alt: React.PropTypes.instanceOf(PAlternative).isRequired
    },

    seemsToBeInteger: function() {
        var alt = this.props.alt;
        return (alt.alternatives[0] instanceof PApp) &&
            alt.alternatives[0].term.name.name() === "fromInteger";
    },

    render: function() {
        var alt = this.props.alt;
        if (this.seemsToBeInteger()) {
            var ast = new PConstant({
                tag: "I",
                contents: alt.alternatives[0].args[0].term.value
            });
            return ast.component(_({ast}).extend(this.props));
        }

        var alternativeComponents = alt.alternatives.map(
            a => a.component({workspace: this.props.workspace})
        );
        return <ProgramNode ast={alt} workspace={this.props.workspace}>
            "Alternatives:"
            {alternativeComponents}
        </ProgramNode>;
    }
});

// PPi Plicity Name PTerm PTerm -- ^ (n : t1) -> t2
var ProgramPi = React.createClass({
    propTypes: {
        pi: React.PropTypes.instanceOf(PPi).isRequired
    },

    // mixins: [LayeredComponentMixin],
    render: function() {
        var pi = this.props.pi;
        var outerStyle = { display: 'table-cell' };

        var arrStyle = {
            display: 'table-cell',
            verticalAlign: 'top',
            paddingTop: '10px',
            fontSize: '120%',
            float: 'left'
        };

        var style = {
            display: 'table-cell',
            padding: '10px',
            float: 'left'
        };
        mergeInto(style, clearfix);
        RCSS.createClass(style);

        var name = null;
        if (pi.name.name() !== '__pi_arg') {
            name = <div style={{float: 'left'}}>
                {Name(pi.name.name())}
            </div>;
        }

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

// PConstant Const
var ProgramConstant = React.createClass({
    propTypes: {
        cnst: React.PropTypes.instanceOf(PConstant).isRequired
    },

    render: function() {
        return <ProgramNode ast={this.props.cnst}
                            workspace={this.props.workspace}>
            {this.props.cnst.prettyRepr()}
        </ProgramNode>;
    }
});

// PRef FC Name
var ProgramReference = React.createClass({
    propTypes: {
        ref: React.PropTypes.instanceOf(PRef).isRequired
    },

    render: function() {
        return <ProgramNode ast={this.props.ref}
                            workspace={this.props.workspace}>
            {this.props.ref.name.name()}
        </ProgramNode>;
    }
});

var casesStyles = RCSS.createClass({});

var ProgramCase = React.createClass({
    propTypes: {
        cases: React.PropTypes.instanceOf(PCase).isRequired
    },
    render: function() {
        var cases = this.props.cases;

        return <ProgramNode workspace={this.props.workspace}
                            ast={cases}>
            {cases.arg.component({workspace: this.props.workspace})}
            {this.getCaseComponents(cases.cases)}
        </ProgramNode>;
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

module.exports = {
    PTerm
};
