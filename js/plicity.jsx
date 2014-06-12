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
-- Mark bindings with their explicitness, and laziness
data Plicity = Imp { pargopts :: [ArgOpt],
                     pstatic :: Static,
                     pparam :: Bool }
             | Exp { pargopts :: [ArgOpt],
                     pstatic :: Static,
                     pparam :: Bool }   -- this is a param (rather than index)
             | Constraint { pargopts :: [ArgOpt],
                            pstatic :: Static }
             | TacImp { pargopts :: [ArgOpt],
                        pstatic :: Static,
                        pscript :: PTerm }
*/

// Do we need to define plicity?
