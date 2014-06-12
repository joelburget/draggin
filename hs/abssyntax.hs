{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE RebindableSyntax #-}

module AbsSyntax where

import FFI
import Prelude hiding (concat, intercalate)
import Fay.Text hiding (map, concatMap)
import DOM

data Name = UserName Text
          | MachineName Int

showName :: Name -> Text
showName (UserName x) = x
showName (MachineName i) = "MachineName " `append` textInt i

showInt :: Int -> String
showInt = ffi "%1+''"

textInt :: Int -> Text
textInt = fromString . showInt

data Term = Ref Name Term -- ^ n : t
          | Pi Term Term -- ^ n -> t2
          | App Term [Term] -- ^ e.g. IO (), List Char, length x
          | Case Term [(Term, Term)]
          | Type

flat :: Term -> Text
flat (Ref name _) = showName name
flat (Pi tm1 tm2) = concat [flat tm1, " -> ", flat tm2]
flat (App (Ref name _) args) = concat [showName name, " ", flattenArgs args]
flat (App tm args) = concat ["(", flat tm, ") ", flattenArgs args]
flat (Case tm cases) = concat
    ["(Case ", flat tm, " of ", flattenCases cases, ")"]

flattenArgs = intercalate " " . map flat
flattenCases = intercalate " " . map (\(ifTm, thenTm) ->
    concat ["(", flat ifTm, " => ", flat thenTm, ") "])

-- find all the places in the second term accepting the first
-- this needs to return a lens rather than the term itself so that we can
-- compare without using ===
holesAccepting :: Term -> Term -> [Term]
-- a ref accepts everything but is accepted by nothing
holesAccepting Ref{} _ = []
holesAccepting _ r@(Ref{}) = [r]

holesAccepting x (Pi tm1 tm2) = holesAccepting x tm1 ++ holesAccepting x tm2
holesAccepting x (App tm tms) =
    holesAccepting x tm ++ concatMap (holesAccepting x) tms
holesAccepting x (Case tm cases) = holesAccepting x tm ++
    concatMap (\(tm1, tm2) -> holesAccepting x tm1 ++ holesAccepting x tm2) cases
holesAccepting _ Type = []

testTerm = Ref (UserName "x")
               (Pi (Ref (UserName "A") Type)
                   (Ref (UserName "B") Type))