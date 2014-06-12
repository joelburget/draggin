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

class UserName {
    constructor(args) {
        this._name = args;
    }

    get name() {
        return this._name;
    }
}
class NameSpace {
    constructor(args) {
        this.enclosedName = Name(args[0]);
        this.parts = args[1];
    }

    get qualifiedName() {
        return `${this.namespace()} :: ${this.baseName()}`;
    }

    get namespace() {
        return this.parts.slice().reverse().join(" :: ");
    }

    get baseName() {
        return this.enclosedName.name();
    }

    get name() {
        return this.qualifiedName();
    }
}

var nameTypes = {
    "NS": NameSpace,
    "UN": UserName
};
function Name(json) {
    return new nameTypes[json.tag](json.contents);
}

module.exports = {
    Name: Name,
    UserName: UserName,
    NameSpace: NameSpace
}
