{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE RebindableSyntax #-}

import FFI
import Prelude hiding (concat, intercalate)
import Fay.Text hiding (map)
import DOM

data ReactComponent

data Name = UserName Text
          | MachineName Int

nameComponent :: Name -> ReactComponent
nameComponent tm = nameComponent' tm tm where
    nameComponent' UserName{} = ffiUserName
    nameComponent' MachineName{} = ffiMachineName

ffiUserName :: Name -> ReactComponent
ffiUserName = ffi "UserName(%1)"

ffiMachineName :: Name -> ReactComponent
ffiMachineName = ffi "MachineName(%1)"

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

-- why is this done is such a convoluted way?
-- https://github.com/faylang/fay/issues/253
termComponent :: Term -> ReactComponent
termComponent tm = component' tm tm where
    component' Ref{}  = ffiRef
    component' Pi{}   = ffiPi
    component' App{}  = ffiApp
    component' Case{} = ffiCase

ffiRef :: Term -> ReactComponent
ffiRef = ffi "Ref(%1)"

ffiPi :: Term -> ReactComponent
ffiPi = ffi "Pi(%1)"

ffiApp :: Term -> ReactComponent
ffiApp = ffi "App(%1)"

ffiCase :: Term -> ReactComponent
ffiCase = ffi "Case(%1)"

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
holesAccepting :: Term -> Term -> [Term]
holesAccepting = undefined

renderComponent :: ReactComponent -> Element -> Fay ()
renderComponent = ffi "React.renderComponent(%1, %2)"

main :: Fay ()
main = do
    div <- getElementById "main"
    renderComponent (nameComponent (UserName "x")) div
