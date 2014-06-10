{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE RebindableSyntax #-}

import FFI
import Prelude
import Fay.Text

type Plicity = ()

data Name = UserName Text
          | MachineName Int

showInt :: Int -> Text
showInt = fromString $ ffi "%1+''"

showName :: Name -> Text
showName (UserName x) = x
showName (MachineName i) = "MachineName " ++ showInt i

data Const = Const

showConstant :: Const -> Text
showConstant = "const"

data PArg = PArg
    { argTy :: PTerm
    , argTm :: PTerm
    }

           -- rename to PName?
data PTerm = PRef Name -- ^ a name reference. novel!

           -- how can this case match on the first param? should it not
           -- take a PTerm?
           | PPi Name PTerm PTerm -- ^ (n : t1) -> t2

           -- why not PApp PTerm PTerm?
           | PApp PTerm [PArg] -- ^ e.g. IO (), List Char, length x

           | PCase PTerm [(PTerm, PTerm)]

           -- needed?
           | PConstant Const

data ReactComponent

component :: PTerm -> ReactComponent
component tm@PRef{}      = ffi "Reference(%1)" tm
component tm@PPi{}       = ffi "Pi(%1)" tm
component tm@PApp{}      = ffi "App(%1)" tm
component tm@PCase{}     = ffi "Case(%1)" tm
component tm@PConstant{} = ffi "Constant(%1)" tm

flat :: PTerm -> Text
flat (PRef name) = showName name
flat (PPi name tm1 tm2) = "(" ++ showName name ++ " : " ++ flat tm1 ++ ") -> " flat tm2
flat (PApp (PRef name) args) = showName name ++ flattenArgs args
flat (PApp tm args) = "(" ++ flat tm ++ ")" ++ flattenArgs args
flat (PCase tm cases) = "(PCase " ++ flat tm ++ " of " ++ flattenCases cases ++ ")"
flat (PConstant const) = showConstant const

flattenArgs = foldr (\tm str -> flat tm ++ " " ++ str) ""
flattenCases = foldr (\(ifTm, thenTm) str -> "(" ++ flat ifTm ++ " => " ++ flat thenTm ++ ") " ++ str) ""

-- find all the places in the second term accepting the first
-- howwwww
holesAccepting :: PTerm -> PTerm -> [PTerm]
holesAccepting = undefined
