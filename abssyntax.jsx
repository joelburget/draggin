/**
 * @jsx React.DOM
 */

var React = require('react');
var mergeInto = require('react/lib/mergeInto');
var LayeredComponentMixin = require('react-components/layered-component-mixin');
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

var Name = require('./tt.jsx').Name;
var AsType = require('./astype.jsx');

var clearfix = {
    ':before': {
        content: '""',
        display: 'table'
    },
    ':after': {
        content: '""',
        display: 'table',
        clear: 'both'
    }
};


class PTermBase {
    component() {
        return <div>Compontent not implemented for {this}</div>;
    }

    flat() {
        return "<unimplemented>";
    }
}

class PPi extends PTermBase {
    constructor(args) {
        this.plicity = args[0];
        this.name = Name(args[1]);
        this.t1 = PTerm(args[2])
        this.t2 = PTerm(args[3])
    }

    flat() {
        return `${this.t1.flat()} -> ${this.t2.flat()}`
    }

    component(props) {
        var propsObj = _.extend({pi: this}, props);
        return ProgramPi(propsObj);
    }
}
class PConstant extends PTermBase {
    constructor(args) {
        this.name = args.tag;
        if(_.isObject(args.contents) && args.contents.tag) {
            this.value = new PConstant(args.contents);
        } else {
            this.value = args.contents;
        }
    }

    prettyRepr() {
        var name = this.name;
        if (name === "AType") {
            // complex value
            if (this.value.name === "ATFloat") {
                return "Float : AType";
            } else if (this.value.name === "ATInt") {
                // int, even more complex value
                if (this.value.value.name === "ITNative") {
                    return "Int : AType";
                } else if (this.value.value.name === "ITBig") {
                    return "Integer : AType";
                } else {
                    console.log("Add more special cases for:",
                                this.value.value);
                    return "Some other fucking int type : AType";
                }
            }
        } else if (name === "I") {
            name = "Int";
        }
        return `${this.value} : ${name}`;
    }

    flat() {
        var val = this.value.flat ? this.value.flat() : this.value
        return `${val}:${this.name}`;
    }

    component(props) {
        var propsObj = _.extend({const: this}, props);
        return ProgramConstant(propsObj);
    }
}
class PRef extends PTermBase {
    constructor(args) {
        this.fc = args[0];
        this.name = Name(args[1]);
    }

    flat() {
        return this.name.name();
    }

    component(props) {
        var propsObj = _.extend({ref: this}, props);
        return ProgramReference(propsObj);
    }
}
class PAlternative extends PTermBase {
    constructor(args) {
        this.onlyOne = args[0];
        this.alternatives = args[1].map(PTerm);
    }

    flat() {
        return "(|" +
            this.alternatives.map(x => x.flat()).join(",") +
            "|)";
    }

    component(props) {
        var propsObj = _.extend({alt: this}, props);
        return ProgramAlternative(propsObj);
    }
}
class PApp extends PTermBase {
    constructor(args) {
        this.fc = args[0];
        this.term = PTerm(args[1]);
        this.args = args[2].map(PArg);
    }

    flat() {
        var argTerms = this.args.map(a => a.term);
        var flatArgTerms = argTerms.map(at => at.flat());
        return "(PApp " + this.term.flat() + ` [${flatArgTerms.join(",")}])`
    }

    component(props) {
        var propsObj = _.extend({app: this}, props);
        return ProgramApplication(propsObj);
    }
}

// PCase FC PTerm [(PTerm, PTerm)]
class PCase extends PTermBase {
    constructor(args) {
        this.arg = PTerm(args[1]);
        this.cases = args[2].map(arr => [PTerm(arr[0]), PTerm(arr[1])]);
    }

    flat() {
        var cases = this.cases.map(tms => `${tms[0].flat()} => ${tms[1].flat()};`);
        var flatCases = cases.join(', ');
        return `(PCase ${this.arg.flat()} of ${flatCases})`;
    }

    component(props) {
        return ProgramCase(_({cases: this}).extend(props));
    }
}

var termTypes = {
    PPi,
    PConstant,
    PRef,
    PAlternative,
    PApp,
    PCase
};
function PTerm(json) {
    return new termTypes[json.tag](json.contents);
}

/*
PExp { priority :: Int,
       argopts :: [ArgOpt],
       pname :: Name,
       getTm :: t }
*/
class PExp {
    constructor(args) {
        // I don't know what these other things are, so here's the term
        this.term = PTerm(args.getTm);
    }
};

// PArg = PImp (..) | PExp (..) | PConstraint (..) | PTacImplicit (..)
//
var argTypes = {
    "PExp": PExp
};
function PArg(json) {
    return new argTypes[json.tag](json);
}

/*
data PTerm = PPi  Plicity Name PTerm PTerm -- ^ (n : t1) -> t2
           | PConstant Const -- ^ Builtin types
           | PRef FC Name
           | PAlternative Bool [PTerm] -- True if only one may work
           | PApp FC PTerm [PArg] -- ^ e.g. IO (), List Char, length x
*/

function FC(fc_obj) {
    return fc_obj;
}

var programNodeStyle = {
    display: "inline-block",
    background: colors.nodeBg,
    margin: "5px",
    borderColor: "transparent",
    borderWidth: "1px",
    borderStyle: "solid",
    padding: "5px"
};

var programNodeStyleHover = RCSS.merge(programNodeStyle, RCSS.createClass({
    borderColor: colors.borderColor
}));

programNodeStyle = RCSS.createClass(programNodeStyle);
programNodeStyleHover = RCSS.createClass(programNodeStyleHover);

var ProgramNode = React.createClass({
    getInitialState: function() {
        return {
            hovered: false
        };
    },

    render: function() {
        var className = this.state.hovered ?
            programNodeStyleHover.className :
            programNodeStyle.className;
        return this.transferPropsTo(
            <div className={className}
                 onMouseEnter={() => this.setState({hovered: true})}
                 onMouseLeave={() => this.setState({hovered: false})}>
            {this.props.children}</div>);
    }
});

// example:
// Int -> Int
//
// http://pastebin.com/0BSsKLAm
//
// PPi (Exp [] Dynamic False)
// 	   (UN "__pi_arg")
// 	   (PConstant
// 	       (AType (ATInt ITNative)))
// 	   (PConstant ...)
//
//
// a -> a
//
// http://pastebin.com/xevYJkdx
//
// PPi (Exp [] Dynamic False)
// 	   (UN "__pi_arg")
// 	   (PRef (...) (UN "a"))
// 	   (PRef ...)

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

        var termComponent = this.props.app.term.component();
        var argComponents = this.props.app.args.map(
            arg => arg.term.component()
        );

        var inner;
        if (form === this.type.INFIX) {
            inner = [argComponents[0], termComponent, argComponents[1]];
        } else { // prefix
            inner = [termComponent, argComponents];
        }
        return <ProgramNode>
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
            style: { 'float': 'left' }
        }));

        return <ProgramNode>
            [{components}]
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
        if (this.seemsToBeInteger()) {
            return new PConstant({
                tag: "I",
                contents: this.props.alt.alternatives[0].args[0].term.value
            }).component(this.props);
        }

        var alternativeComponents = this.props.alt.alternatives.map(
            a => a.component()
        );
        return <ProgramNode>
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

    mixins: [LayeredComponentMixin],
    render: function() {
        var pi = this.props.pi;
        var outerStyle = {display: 'table-cell'};

        var style = {
            display: 'table-cell',
            padding: '10px'
        };
        mergeInto(style, clearfix);
        RCSS.createClass(style);

        var name = null;
        if (pi.name.name() !== '__pi_arg') {
            name = <div style={{float: 'left'}}>
                {Name(pi.name.name())}
            </div>;
        }

        return <div style={outerStyle}>
            <div className={style.className} ref="ty1"
                 onMouseEnter={() => this.handleEnter(0)}
                 onMouseLeave={() => this.handleLeave(0)}>
                {name}
                <div style={{float: 'left'}}>
                    {pi.t1.component()}
                </div>
            </div>
            <div className={style.className} ref="ty2"
                 onMouseEnter={() => this.handleEnter(1)}
                 onMouseLeave={() => this.handleLeave(1)}>
                <div style={{float: 'left'}}>
                    {pi.t2.component()}
                </div>
            </div>
        </div>;
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
        const: React.PropTypes.instanceOf(PConstant).isRequired
    },

    render: function() {
        return <ProgramNode>{this.props.const.prettyRepr()}</ProgramNode>
    }
});

// PRef FC Name
var ProgramReference = React.createClass({
    propTypes: {
        ref: React.PropTypes.instanceOf(PRef).isRequired
    },

    render: function() {
        return <ProgramNode>
            {this.props.ref.name.name()}
        </ProgramNode>;
    }
});

var ProgramCase = React.createClass({
    propTypes: {
        cases: React.PropTypes.instanceOf(PCase).isRequired
    },
    render: function() {
        var cases = this.props.cases;

        var arg = cases.arg;
        var cases = cases.cases;

        var caseComponents = cases.map(tms => <div>
            {tms[0].component()}
            =>
            {tms[1].component()}
        </div>);

        return <ProgramNode>
            {arg.component()}
            {caseComponents}
        </ProgramNode>;
    }
});

// var ATFloat = React.createClass({
//     render: function() {
//         return <div>Float</div>;
//     }
// });
//
// var IntTy = React.createClass({
//     render: function() {
//         return <div>Int</div>;
//     }
// });
//
// var ATInt = React.createClass({
//     render: function() {
//         return IntTy(this.props.contents);
//     }
// });
//
// var ArithTy = React.createClass({
//     mixins: [DataTypeMixin],
//     render: function() {
//         return this.renderAlt();
//     },
//     statics: {
//         constrs: { ATInt, ATFloat }
//     }
// });
//
// var AType = React.createClass({
//     render: function() {
//         return ArithTy(this.props.contents);
//     },
//     statics: {
//         constrs: { ArithTy }
//     }
// });
//
// var Int = React.createClass({
//     render: function() {
//         return <span>{this.props.contents}</span>;
//     }
// });
//
/*
// data Const = I Int | BI Integer | Fl Double | Ch Char | Str String
//            | B8 Word8 | B16 Word16 | B32 Word32 | B64 Word64
//            | B8V (Vector Word8) | B16V (Vector Word16)
//            | B32V (Vector Word32) | B64V (Vector Word64)
//            | AType ArithTy | StrType
//            | PtrType | ManagedPtrType | BufferType | VoidType | Forgot
// */
// var Const = React.createClass({
//     mixins: [DataTypeMixin],
//     render: function() {
//         if (this.props.contents.length === 0) {
//             return <div>I dont understand this constant</div>;
//         }
//
//         return this.renderAlt();
//     },
//     statics: {
//         constrs: {
//             AType,
//             BI: Int,
//             I: Int,
//             B8: Int,
//             B16: Int,
//             B32: Int,
//             B64: Int
//         }
//     }
// });

module.exports = {
    PTerm
};
