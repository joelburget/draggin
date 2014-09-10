{-# LANGUAGE OverloadedStrings #-}

module AbsSyntax where

import Data.List (intercalate)
import Data.String
import Prelude
import Haste.Foreign

data Name = UserName String
          | MachineName Int
		  deriving (Eq, Show)

data Term = Ref Name Term -- ^ n : t
          | Pi Term Term -- ^ n -> t2
          | App Term [Term] -- ^ e.g. IO (), List Char, length x
          | Case Term [(Term, Term)]
          | Type
          deriving Eq

instance Show Term where
    show = flat

flat :: Term -> String
flat (Ref (UserName name) Type) = name
flat (Ref (UserName name) ty) = concat [name, " : ", parenthesize ty]
flat (Ref mn@(MachineName name) ty) = concat [show mn, " : ", parenthesize ty]
flat (Pi tm1 tm2) = concat [parenthesize tm1, " -> ", parenthesize tm2]
flat (App (Ref name _) args) = concat [show name, " ", flattenArgs args]
flat (App tm args) = concat ["(", parenthesize tm, ") ", flattenArgs args]
flat (Case tm cases) = concat
    ["(Case ", flat tm, " of ", flattenCases cases, ")"]
flat Type = "Type"

parenthesize :: Term -> String
parenthesize tm@Type = flat tm
parenthesize tm@(Ref (UserName name) Type) = flat tm
parenthesize tm = concat ["(", flat tm, ")"]

flattenArgs = intercalate " " . map flat
flattenCases = intercalate " " . map (\(ifTm, thenTm) ->
    concat ["(", parenthesize ifTm, " => ", parenthesize thenTm, ") "])

-- findMachineNames :: Term -> [Name]
identify :: Int -> String -> Term -> Term
identify mn un (Ref nm'@(UserName _) subTm) = Ref nm' (identify mn un subTm)
identify mn un (Ref nm'@(MachineName nm) subTm) = let name' = if nm == mn then (UserName un) else nm' in Ref name' (identify mn un subTm)
identify mn un (Pi tm1 tm2) = Pi (identify mn un tm1) (identify mn un tm2)
identify mn un (App ctr args) = App (identify mn un ctr) (map (identify mn un) args)
-- identify mn un (Case subTm matches) =
identify _ _ Type = Type

{-
type Lens = [String]

-- find all the places in the second term accepting the first
holesAccepting :: Term -> Term -> [Lens]
-- a ref accepts everything but is accepted by nothing
holesAccepting Ref{} _ = []
holesAccepting _ Ref{} = [[]]

holesAccepting x (Pi tm1 tm2) =
    map ("slot1":) (holesAccepting x tm1) ++
    map ("slot2":) (holesAccepting x tm2)
holesAccepting x (App tm tms) =
    map ("slot1":) (holesAccepting x tm) ++
    map ("slot2":) (concatMap (holesAccepting x) tms) -- TODO
holesAccepting x (Case tm cases) =
    map ("slot1":) (holesAccepting x tm) ++
    map ("slot2":) (concatMap (\(tm1, tm2) -> holesAccepting x tm1 ++ holesAccepting x tm2) cases) -- TODO
holesAccepting _ Type = []
-}

testTerm = Ref (UserName "x")
               (Pi (Ref (UserName "A") Type)
                   (Ref (UserName "B") Type))
