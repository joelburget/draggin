module Main where

import Test.Framework (defaultMain, defaultMainWithOpts, testGroup)
-- import Test.Framework.Options (TestOptions, TestOptions'(..))
-- import Test.Framework.Runners.Options (RunnerOptions, RunnerOptions'(..))
import Test.Framework.Providers.HUnit
import Test.Framework.Providers.QuickCheck2 (testProperty)

import Test.QuickCheck
import Test.HUnit

import AbsSyntax

main = defaultMain tests

tests = [
    testGroup "Term Printing" [
        testCase "term1" prop_print_1,
        testCase "term2" prop_identify_1
    ]
    ]

term1 :: Term
term1 = Ref (UserName "x")
               (Pi (Ref (UserName "A") Type)
                   (Ref (UserName "B") Type))

prop_print_1 = show term1 @?= "x : (A -> B)"

term2 :: Term
term2 = Pi (Ref (MachineName 0) Type) (Ref (UserName "T") Type)

prop_identify_1 = identify 0 "A" term2 @?= Pi (Ref (UserName "A") Type) (Ref (UserName "T") Type)
