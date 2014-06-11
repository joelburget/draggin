{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE RebindableSyntax #-}

module AbsSyntax where

import FFI
import Prelude hiding (concat, intercalate)
import Fay.Text hiding (map)
import DOM

data ReactComponent
data WorkspaceState
type Lens = [Text]

data Name = UserName Text
          | MachineName Int

nameComponent :: Name -> Lens -> WorkspaceState -> ReactComponent
nameComponent tm l st = nameComponent' tm tm l st where
    nameComponent' UserName{} = ffiUserName
    nameComponent' MachineName{} = ffiMachineName

ffiUserName :: Name -> Lens -> WorkspaceState -> ReactComponent
ffiUserName = ffi "UserName({ast: %1, lens: %2, workspace: %3})"

ffiMachineName :: Name -> Lens -> WorkspaceState -> ReactComponent
ffiMachineName = ffi "MachineName({ast: %1, lens: %2, workspace: %3})"

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

-- why is this done is such a convoluted way?
-- https://github.com/faylang/fay/issues/253
termComponent :: Term -> Lens -> WorkspaceState -> ReactComponent
termComponent tm l st = component' tm tm l st where
    component' Ref{}  = ffiRef
    component' Pi{}   = ffiPi
    component' App{}  = ffiApp
    component' Case{} = ffiCase
    component' Type{} = ffiType

ffiRef :: Term -> Lens -> WorkspaceState -> ReactComponent
ffiRef = ffi "Ref({ast: %1, lens: %2, workspace: %3})"

ffiPi :: Term -> Lens -> WorkspaceState -> ReactComponent
ffiPi = ffi "Pi({ast: %1, lens: %2, workspace: %3})"

ffiApp :: Term -> Lens -> WorkspaceState -> ReactComponent
ffiApp = ffi "App({ast: %1, lens: %2, workspace: %3})"

ffiCase :: Term -> Lens -> WorkspaceState -> ReactComponent
ffiCase = ffi "Case({ast: %1, lens: %2, workspace: %3})"

ffiType :: Term -> Lens -> WorkspaceState -> ReactComponent
ffiType = ffi "Type({ast: %1, lens: %2, workspace: %3})"

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
-- howwwww
-- holesAccepting :: Term -> Term -> [Term]
-- holesAccepting = undefined

renderComponent :: ReactComponent -> Element -> Fay ()
renderComponent = ffi "React.renderComponent(%1, %2)"

testTerm = Ref (UserName "x")
               (Pi (Ref (UserName "A") Type)
                   (Ref (UserName "B") Type))
