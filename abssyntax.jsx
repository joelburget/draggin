/**
 * @jsx React.DOM
 */

var React = require('react');

var ReactART = require('react-art');
var Group = ReactART.Group;

var Prims = require('./prims.jsx');
var Renderable = Prims.Renderable;
var Write = Prims.Write;
var DataTypeMixin = Prims.DataTypeMixin;

var Name = require('./tt.jsx').Name;

/*
PExp { priority :: Int,
       argopts :: [ArgOpt],
       pname :: Name,
       getTm :: t }
*/
var PExp = React.createClass({
    render: function() {
        // ignore argopts, priority, pname
        return PTerm(this.props.getTm);
    }
});

// PArg = PImp (..) | PExp (..) | PConstraint (..) | PTacImplicit (..)
var PArg = React.createClass({
    mixins: [DataTypeMixin],
    render: function() {
        return this.renderAlt();
    },
    statics: {
        constrs: { PExp }
    }
});

/*
-- | High level language terms
data PTerm = PQuote Raw
           | PRef FC Name
           | PInferRef FC Name -- ^ A name to be defined later
           | PPatvar FC Name
           | PLam Name PTerm PTerm
           | PPi  Plicity Name PTerm PTerm -- ^ (n : t1) -> t2
           | PLet Name PTerm PTerm PTerm
           | PTyped PTerm PTerm -- ^ Term with explicit type
           | PApp FC PTerm [PArg] -- ^ e.g. IO (), List Char, length x
           | PAppBind FC PTerm [PArg] -- ^ implicitly bound application
           | PMatchApp FC Name -- ^ Make an application by type matching
           | PCase FC PTerm [(PTerm, PTerm)]
           | PTrue FC PunInfo -- ^ Unit type..?
           | PFalse FC -- ^ _|_
           | PRefl FC PTerm
           | PResolveTC FC
           | PEq FC PTerm PTerm -- ^ Equality type: A = B
           | PRewrite FC PTerm PTerm (Maybe PTerm)
           | PPair FC PunInfo PTerm PTerm
           | PDPair FC PunInfo PTerm PTerm PTerm
           | PAlternative Bool [PTerm] -- True if only one may work
           | PHidden PTerm -- ^ Irrelevant or hidden pattern
           | PType -- ^ 'Type' type
           | PGoal FC PTerm Name PTerm
           | PConstant Const -- ^ Builtin types
           | Placeholder
           | PDoBlock [PDo]
           | PIdiom FC PTerm
           | PReturn FC
           | PMetavar Name
           | PProof [PTactic] -- ^ Proof script
           | PTactics [PTactic] -- ^ As PProof, but no auto solving
           | PElabError Err -- ^ Error to report on elaboration
           | PImpossible -- ^ Special case for declaring when an LHS can't typecheck
           | PCoerced PTerm -- ^ To mark a coerced argument, so as not to coerce twice
           | PDisamb [[T.Text]] PTerm -- ^ Preferences for explicit namespaces
           | PUnifyLog PTerm -- ^ dump a trace of unifications when building term
           | PNoImplicits PTerm -- ^ never run implicit converions on the term
*/

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
var PApp = React.createClass({
    render: function() {
        var form = this.recognizeForm();
        if (form === this.type.SPECIAL) {
            return PAppBrackets(this.props);
        }

        var args = this.props.contents[2].map(PArg);

        if (form === this.type.INFIX) {
            return <div>
                {args[0]}
                {PTerm(this.props.contents[1])}
                {args[1]}
            </div>;
        } else { // prefix
            return <div>
                {PTerm(this.props.contents[1])}
                {args}
            </div>;
        }
    },
    recognizeForm: function() {
        var tm = this.props.contents[1];
        var isRef = tm.tag === 'PRef';
        if (!isRef) {
            return this.type.PREFIX;
        }

        var fName = tm.contents[1].contents;

        if (fName === '::') {
            return this.type.SPECIAL;
        }

        var isInfix = this.type.infixOps.indexOf(fName) !== -1;

        return isInfix ? this.type.INFIX : this.type.PREFIX;
    },
    statics: {
        INFIX: 'INFIX',
        PREFIX: 'PREFIX',
        SPECIAL: 'SPECIAL',

        infixOps: ['+', '-', '*', '/']
    }
});

var PAppBrackets = React.createClass({
    // show a list or vect in brackets
    render: function() {
        var head = this.props.contents[2][0];
        var tail = this.props.contents[2][1];

        var pieces = [head];

        // invariants:
        // * head and tail point to a PExp
        // * head is not nil
        while (this.isCons(tail) && !this.isNil(tail)) {
            head = tail.getTm.contents[2][0];
            tail = tail.getTm.contents[2][1];

            pieces.push(head);
        }

        var components = pieces
            .map(d => { d.style = { 'float': 'left' }; return d; })
            .map(PExp);

        return <div>
            [{components}]
        </div>;
    },

    isNil: function(pexp) {
        return pexp.getTm.contents[1].contents === 'Nil';
    },

    isCons: function(pexp) {
        var pterm = pexp.getTm;
        if (pterm.tag !== 'PApp') {
            return false;
        }

        var appTm = pterm.contents[1];

        if (appTm.tag !== 'PRef') {
            return false;
        }

        // TODO use name class
        return appTm.contents[1].contents === '::';
    }
});

// PAlternative Bool [PTerm] -- True if only one may work
var PAlternative = React.createClass({
    render: function() {
        var alternatives = this.props.contents[1].map(PTerm);
        return <div>
            "Alternatives:"
            {alternatives}
        </div>;
    }
});

// PPi Plicity Name PTerm PTerm -- ^ (n : t1) -> t2
var PPi = React.createClass({
    render: function() {
        var contents = this.props.contents;
        return <div>
            {PTerm(contents[2])}
            ->
            {PTerm(contents[3])}
        </div>;
    }
});

// PConstant Const
var PConstant = React.createClass({
    render: function() {
        return Const(this.props.contents);
    }
});

// PRef FC Name
var PRef = React.createClass({
    render: function() {
        return <div>
            {Name(this.props.contents[1])}
        </div>;
    }
});

var ATFloat = React.createClass({
    render: function() {
        return <div>Float</div>;
    }
});

var IntTy = React.createClass({
    render: function() {
        return <div>Int</div>;
    }
});

var ATInt = React.createClass({
    render: function() {
        return IntTy(this.props.contents);
    }
});

var ArithTy = React.createClass({
    mixins: [DataTypeMixin],
    render: function() {
        return this.renderAlt();
    },
    statics: {
        constrs: { ATInt, ATFloat }
    }
});

var AType = React.createClass({
    render: function() {
        return ArithTy(this.props.contents);
    },
    statics: {
        constrs: { ArithTy }
    }
});

var Int = React.createClass({
    render: function() {
        return <span>{this.props.contents}</span>;
    }
});

/*
data Const = I Int | BI Integer | Fl Double | Ch Char | Str String
           | B8 Word8 | B16 Word16 | B32 Word32 | B64 Word64
           | B8V (Vector Word8) | B16V (Vector Word16)
           | B32V (Vector Word32) | B64V (Vector Word64)
           | AType ArithTy | StrType
           | PtrType | ManagedPtrType | BufferType | VoidType | Forgot
*/
var Const = React.createClass({
    mixins: [DataTypeMixin],
    render: function() {
        if (this.props.contents.length === 0) {
            return <div>I don't understand this constant</div>;
        }

        return this.renderAlt();
    },
    statics: {
        constrs: {
            AType,
            BI: Int,
            I: Int,
            B8: Int,
            B16: Int,
            B32: Int,
            B64: Int
        }
    }
});

var PTerm = React.createClass({
    mixins: [DataTypeMixin],
    render: function() {
        return this.renderAlt();
    },
    statics: {
        constrs: { PPi, PConstant, PRef, PAlternative, PApp }
    }
});

module.exports = PTerm;
