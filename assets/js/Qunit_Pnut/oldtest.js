

// // NEW FUNCIONTS (update at Feb 21, 2015):
// // 1.  listFunctions(ast)                        ==>  [ string ]
// //  assert.ok(true, pnut.listFunctions(AST) );
// // Died: undefined is not a function (evaluating 'pnut.listFunctions(AST)')@ 1 ms 
// // file:///Users/nesfield/git/bricks/assets/js/Qunit_Pnut/tests.js:13:21

// // 2.  isAValidProgram(ast)                      ==>  boolean 
// // assert.ok(  pnut.isAValidProgram(AST), "isAValidProgram( \" " + code + " \" ) returns "+ pnut.isAValidProgram(AST));
// // Died on test #1 global code@file:///Users/nesfield/git/bricks/assets/js/Qunit_Pnut/tests.js:5:11: undefined is not a function (evaluating 'pnut.isAValidProgram(AST)')@ 2 ms
// // file:///Users/nesfield/git/bricks/assets/js/Qunit_Pnut/tests.js:24:35


// // 3.  isAValidFunction(func)                     ==>  boolean
// //     failed failed, expected argument to be truthy, was: undefined
//   assert.ok(  ssOb.isAValidFunction, ssOb.isAValidFunction);




// // 4.  isAllFuncDeclsPlusOneCall(ast)             ==>  boolean
//   assert.ok(  (false == pnut.isAllFuncDeclsPlusOneCall(AST)), 
//     "isAllFuncDeclsPlusOneCall( \" " + code + " \" ) returns "+pnut.isAllFuncDeclsPlusOneCall(AST));
  


// // 5.  isFunctionCallPassByReference(ast)         ==>  boolean
//   assert.ok(  (false == pnut.isFunctionCallPassByReference(AST)), 
//     "isFunctionCallPassByReference( \" " + code + " \" ) returns "+pnut.isFunctionCallPassByReference(AST));

// // 6.  numValidObjectDeclared(ast)                ==>  integer >= 0
// //  assert.ok(  (0 == pnut.numValidObjectDeclared(AST)), 
// //    "numValidObjectDeclared( \" " + code + " \" ) returns "+pnut.numValidObjectDeclared(AST));
// // Died on: undefined is not a function (evaluating 'pnut.numValidObjectDeclared(AST)')@ 3 ms	
// // file:///Users/nesfield/git/bricks/assets/js/Qunit_Pnut/tests.js:37:48


// // 7.  numDeclaredObjectUsed(ast)                 ==>  integer >= 0
// //  assert.ok(  ( 0 == pnut.numDeclaredObjectUsed(AST)), 
// //    "numDeclaredObjectUsed( \" " + code + " \" ) returns "+pnut.numDeclaredObjectUsed(AST));
// // Died on: undefined is not a function (evaluating 'pnut.numDeclaredObjectUsed(AST)')@ 2 ms 	
// // file:///Users/nesfield/git/bricks/assets/js/Qunit_Pnut/tests.js:44:48


// // 8.  isRecuriveFunction(ast)                    ==>  boolean
//   assert.ok(  (false == pnut.isRecuriveFunction(AST)), 
//     "isRecuriveFunction( \" " + code + " \" ) returns "+pnut.isRecuriveFunction(AST));



// // 9.  numValidObjectDeclaredInAllFunctions(ast)  ==>  integer >= 0
//   assert.ok(  (false == pnut.numValidObjectDeclaredInAllFunctions(AST)), 
//     "numValidObjectDeclaredInAllFunctions( \" " + code + " \" ) returns "+pnut.numValidObjectDeclaredInAllFunctions(AST));

//   assert.ok( ( 1 == pnut.numTopFuncCalls(AST) ),                      "numTopFuncCalls( \" " + code + " \" ) returns "+ pnut.numTopFuncCalls(AST));
 