/**
 * @jsx React.DOM
 */

var React = require('react');
var merge = require('react/lib/merge')

var ReactART = require('react-art');
var Group = ReactART.Group;
var Transform = ReactART.Transform;

var Prims = require('./prims.jsx');
var Renderable = Prims.Renderable;
var Write = Prims.Write;
var DataTypeMixin = Prims.DataTypeMixin;

/*
data Raw = Var Name
         | RBind Name (Binder Raw) Raw
         | RApp Raw Raw
         | RType
         | RForce Raw
         | RConstant Const
*/

var Raw = function(tag, component) {
    this.tag = tag;
    this.component = component;
};

Raw.prototype = new Renderable();


// Var Name

var VarC = React.createClass({
    render: function() {
        return <Write>{this.props.name}</Write>;
    }
});

var Var = function(contents) {
    this.contents = contents;
};

Var.prototype = new Raw('Var', VarC);


// RBind Name (Binder Raw) Raw

var RBindC = React.createClass({
    render: function() {
        return <Group transform={this.props.trans}>
            <Write>{this.props.name}</Write>
            <Write>binder goes here</Write>
            {this.props.expr.render()}
        </Group>;
    }
});

var RBind = function(contents) {
    this.contents = contents;

    this.children = contents.map(create);
};

RBind.prototype = new Raw('RBind', RBindC);


// RApp Raw Raw

var RAppC = React.createClass({
    render: function() {
        return <Group transform={this.props.trans}>
            {this.props.expr1.render()}
            {this.props.expr2.render()}
        </Group>;
    }
});

var RApp = function(contents) {
    return new Raw('RApp', RAppC);
};

RApp.prototype = new Raw('RApp', RBindC);


// RType

var RTypeC = React.createClass({
    render: function() {
        return <Write transform={this.props.trans}>RType</Write>;
    }
});

var RType = function() {
    return new Raw('RType', RTypeC);
};


// RForce Raw

var RForceC = React.createClass({
    render: function() {
        return this.transferPropsTo(this.props.raw.render());
    }
});

var RForce = function(expr) {
    return new Raw('RForce', RForceC);
};


// RConstant

// TODO - pick up from here

var RConstant = function(expr) {
    return new Raw('RConstant', RConstantC, {expr});
};

/*
data Name = UN T.Text -- ^ User-provided name
          | NS Name [T.Text] -- ^ Root, namespaces
          | MN Int T.Text -- ^ Machine chosen names
          | NErased -- ^ Name of something which is never used in scope
          | SN SpecialName -- ^ Decorated function names
          | SymRef Int -- ^ Reference to IBC file symbol table (used during serialization
*/

// UN T.Text
var UN = React.createClass({
    render: function() {
        return <span>{this.props.contents}</span>;
    }
});

// NS Name [T.Text]
var NS = React.createClass({
    render: function() {
        var contents = this.props.contents;
        var namespace = contents[1].slice().reverse().join('.');
        return <div>
            <div>{namespace}</div>
            {Name(this.props.contents[0])}
        </div>;
    }
});

// MN Int T.Text
var MN = React.createClass({
    render: function() {
        return <div>
            <span>{this.props.contents[1]}</span>
            {this.props.contents[0]}
        </div>;
    }
});

var NErased = React.createClass({
    render: function() {
        return <span>NErased</span>;
    }
});

var SN = React.createClass({
    render: function() {
        return <div>SN</div>;
    }
});

var Name = React.createClass({
    mixins: [DataTypeMixin],
    render: function() {
        return this.renderAlt();
    },
    statics: {
        constrs: { UN, NS, MN, NErased, SN }
    }
});

// SymRef?

/*
data Const = I Int | BI Integer | Fl Double | Ch Char | Str String
           | B8 Word8 | B16 Word16 | B32 Word32 | B64 Word64
           | B8V (Vector Word8) | B16V (Vector Word16)
           | B32V (Vector Word32) | B64V (Vector Word64)
           | AType ArithTy | StrType
           | PtrType | ManagedPtrType | BufferType | VoidType | Forgot
*/

/*
-- The type parameter `b` will normally be something like `TT Name` or just
-- `Raw`. We do not make a type-level distinction between TT terms that
-- happen to be TT types and TT terms that are not TT types.
--
-- | All binding forms are represented in a uniform fashion. This type only
-- represents the types of bindings (and their values, if any); the
-- attached identifiers are part of the 'Bind' constructor for the 'TT'
-- type.
data Binder b = Lam   { binderTy  :: !b }
              | Pi    { binderTy  :: !b }
              -- ^ A binding that occurs in a function type expression,
              -- e.g. @(x:Int) -> ...@
              | Let   { binderTy  :: !b,
                        binderVal :: b {-^ value for bound variable-}}
                -- ^ A binding that occurs in a @let@ expression
              | NLet  { binderTy  :: !b,
                        binderVal :: b }
              | Hole  { binderTy  :: !b}
              | GHole { envlen :: Int,
                        binderTy  :: !b}
              | Guess { binderTy  :: !b,
                        binderVal :: b }
              | PVar  { binderTy  :: !b }
                -- ^ A pattern variable
              | PVTy  { binderTy  :: !b }
  deriving (…)
*/

var Binder = function(tag, component, contents) {
    this.tag = tag;
    this.component = component;
    this.contents = contents;
};

// I have no idea what binders look like

var renderables = {
    // raw
    Var, RBind, RApp, RType, RForce, RConstant,

    Name

    // binder
};

var create = function(obj) {
    return new renderables[obj.tag](obj);
};

module.exports = merge(renderables, { create });
