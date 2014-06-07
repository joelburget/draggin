/**
 * @jsx React.DOM
 */

var React = require('react');

var ReactART = require('react-art');
var Group = ReactART.Group;

var Prims = require('./prims.jsx');
var Renderable = Prims.Renderable;
var Write = Prims.Write;

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

data Const = I Int | BI Integer | Fl Double | Ch Char | Str String
           | B8 Word8 | B16 Word16 | B32 Word32 | B64 Word64
           | B8V (Vector Word8) | B16V (Vector Word16)
           | B32V (Vector Word32) | B64V (Vector Word64)
           | AType ArithTy | StrType
           | PtrType | ManagedPtrType | BufferType | VoidType | Forgot
*/

// let's do:
// * PPi
// * PConstant
//
// what others?

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


var PTerm = function(tag, component) {
    this.tag = tag;
    this.component = component;
};

PTerm.prototype = new Renderable();

// PPi Plicity Name PTerm PTerm -- ^ (n : t1) -> t2

var PPiC = React.createClass({
    render: function() {
        return <Group>
        </Group>;
    }
});

var PPi = function(contents) {
    this.contents = contents;
};
