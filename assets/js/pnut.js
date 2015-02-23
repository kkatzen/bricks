

//------------------------------------------------------------------------
//
//  this JavaScript code implements an API for AST analysis
//  the analysis is intended for simple auto grading 
//  and for enforcing basic programming structure and style guidelines 
//  for an intro programming class
//
//  We use the Acorn parser to generate an AST 
//  The AST is a JSON object, in Mozilla SpiderMonkey format
//
//  To adapt this API to another language you will have to
//   -- get an AST for the target language in SpiderMonkey format 
//   -- rewrite the code bodies
//   -- or write adapter functions
//
//  David Stotts, 5/16/2014
//
//------------------------------------------------------------------------


// global "package" name is pnut

var pnut = (function () {  

//------------------------------------------------------------------------
//   - traverse the AST and collect all the interesting facts
//   - store facts in an object and return the object
//   - data object will be sent to the server for analysis/grading
//------------------------------------------------------------------------

function collectStructureStyleFacts (ast) {
  var dObj = {};

  dObj.nTFD = numTopFuncDecls(ast);
  dObj.nTFC = numTopFuncCalls(ast);
  dObj.nBGD = numBadGlobalDecls(ast);
  dObj.nBGU = numBadGlobalUses(ast);
  dObj.nTFL = numForLoops(ast);
  dObj.nTWL = numWhileLoops(ast);

  dObj.uBGV = usesBadGlobalVars(ast);
  dObj.isAFD1C = isAllFuncDeclsPlusOneCall(ast);
  dObj.nAFL =  numForLoopsInAllFuncDecls(ast);
  dObj.nAWL =  numWhileLoopsInAllFuncDecls(ast);

  return dObj;
}



//------------------------------------------------------------------------
//
// API functions
//
//   numBadGlobalDecls (ast)          ==>  integer >= 0
//   numBadGlobalUses (ast)           ==>  integer >= 0
//   usesBadGlobalVars (ast)          ==>  boolean
//   numForLoops (ast)                ==>  integer >= 0
//   numWhileLoops (ast)              ==>  integer >= 0
//   numForLoopsInAllFuncDecls(ast)   ==>  integer >= 0
//   numWhileLoopsInAllFuncDecls(ast) ==>  integer >= 0
//   numForNestLevels (ast)           ==>  integer >= 0
//   numWhileNestLevels (ast)         ==>  integer >= 0
//   numTopFuncDecls (ast)            ==>  integer >= 0
//   numTopFuncCalls (ast)            ==>  integer >= 0
//   isFuncCall (obj)                 ==>  boolean
//   listTopLevelTypes (ast)          ==>  [ string ]
//   isAllFuncDeclsPlusOneCall (ast)  ==>  boolean
//
//------------------------------------------------------------------------


//------------------------------------------------------------------------
//   global variables, declaration and use
//-----------------------------------------------------------------------

function numBadGlobalDecls (ast) {
  // global var decl
  // but we exclude function value assignments to global
  var count = 0;
  var nst = ast.body.length;
  var st;
  for (var i=0; i<nst; i++) {
    st = ast.body[i]; 
    if (st.type == "VariableDeclaration") {
      var decs = st.declarations; // an array of obj
      for (var d=0; d<decs.length; d++) {
        if (decs[d].init.type != "FunctionExpression") { count++; }
      }
    }
  }
  return count;
}


function numBadGlobalUses(ast) {
  // global var on left of assignment
  // but we exclude function value assignments to global
  var count = 0;
  var nst = ast.body.length;
  var st;
  for (var i=0; i<nst; i++) {
    st = ast.body[i]; 
    if (st.type == "ExpressionStatement") {
      if (st.expression.type != "CallExpression") { count++; }
    }
  }
  return count;
}


function usesBadGlobalVars(ast) { 
  return (numBadGlobalDecls(ast) > 0 || numBadGlobalUses(ast) > 0); 
}



//------------------------------------------------------------------------
//   loops (top level)
//------------------------------------------------------------------------

function numForLoops (ast) {
  // only counts for loops at the global level for now
  var count = 0;
  var nst = ast.body.length;
  for (var i=0; i<nst; i++) {
    if (ast.body[i].type == "ForStatement") { count++; }
  }
  return count;
}


function numWhileLoops (ast) {
  // only counts while loops at the global level for now
  var count = 0;
  var nst = ast.body.length;
  for (var i=0; i<nst; i++) {
    if (ast.body[i].type == "WhileStatement") { count++; }
  }
  return count;
}


function numForNestLevels (ast) { 
  // yet to be implemented
  return 0; 
}


function numWhileNestLevels (ast) { 
  // yet to be implemented
  return 0; 
}


//------------------------------------------------------------------------
//   loops in functions
//------------------------------------------------------------------------

function numForLoopsInAllFuncDecls(ast) {
  // search tree and when find a func decl we do the loop count 
  // skips global level
  var count = 0;
  var nst = ast.body.length;
  for (var i=0; i<nst; i++) {
    if (ast.body[i].type == "FunctionDeclaration") { 
       count += numForLoops( ast.body[i].body);
       //alert("in func for count: " +count);
    }
  }
  return count;
}


function numWhileLoopsInAllFuncDecls(ast) {
  // search tree and when find a func decl we do the loop count 
  // skips global level
  var count = 0;
  var nst = ast.body.length;
  for (var i=0; i<nst; i++) {
    if (ast.body[i].type == "FunctionDeclaration") { 
       count += numWhileLoops( ast.body[i].body);
       //alert("in func for count: " +count);
    }
  }
  return count;
}



//------------------------------------------------------------------------
//   function declarations (top level)
//   function calls (top level)
//------------------------------------------------------------------------

function numTopFuncDecls (ast) {
  // counts top level function foo () { ... } syntax
  // also counts top level var foo = function () { ... }
  var count = 0;
  var nst = ast.body.length;
  var st;
  for (var i=0; i<nst; i++) {
    st = ast.body[i];
    if (st.type == "FunctionDeclaration") {
      // syntax: function foo(n) { ... }
      count++; 
    } 
    else if (st.type == "VariableDeclaration") {
      // syntax: var foo = function (n) { ... } 
      var decs = st.declarations; // an array of obj
      for (var d=0; d<decs.length; d++) {
        if (decs[d].init.type == "FunctionExpression") { count++; }
      }
    } 
    else { // move along to next statement, nothing to do for now
    }
  } // end for loop
  return count;
}


function isFuncCall (ob) { 
  switch (ob.type) {
    case "ExpressionStatement":
      if (ob.expression.type === "CallExpression") return true;
      if (ob.expression.type === "AssignmentExpression") {
	if (ob.expression.right.type === "CallExpression") return true;
      }
      break;
    case "VariableDeclaration":
      if (ob.declarations[0].init.type === "CallExpression") return true;
      break;
    default: return false;
  }
  return false; 
}


function numTopFuncCalls (ast) {
  var count = 0;
  var nst = ast.body.length;
  var st;
  for (var i=0; i<nst; i++) {
    st = ast.body[i];
    if (isFuncCall(st)) count += 1;
  }
  /*
  for (var i=0; i<nst; i++) {
    st = ast.body[i];
    if (st.type == "ExpressionStatement") {
      // syntax: myMain();
      if (st.expression.type == "CallExpression") { count += 1; }
      // syntax: z = myMain(); 
      if (st.expression.type == "AssignmentStatement") { 
	if (st.expression.right == "CallExpression") { count += 1; }
      }
    } 
  } // end for loop
  */
  return count;
}


//------------------------------------------------------------------------
//   top level structure check
//   is it nothing but func decls and one func call?
//------------------------------------------------------------------------


function listTopLevelTypes (ast) {
  // what are the main top level statements in the program
  var nst = ast.body.length;
  var list = [];
  for (var i=0; i<nst; i++) { list[i] = ast.body[i].type ; }
  return list; // array of strings
}


function isAllFuncDeclsPlusOneCall (ast) {
  if (numTopFuncCalls(ast) != 1) return false;
  
  var numFuncDecls = 0;
  var stList = listTopLevelTypes(ast); // array of strings

  for (var s=0; s<stList.length; s++) {
     switch (stList[s]) {
        case "FunctionDeclaration":
           // cool this is ok, so count and just keep going
           numFuncDecls += 1;
           break;
        case "VariableDeclaration":
           // is this var decl really a func decl?
           if (ast.body[s].declarations[0].init.type == "FunctionExpression") { 
             numFuncDecls += 1; 
           } else { 
             return false; 
           }
           break;
        case "ExpressionStatement":
           // is this expression a single func call?
	   if (!isFuncCall(ast.body[s])) return false;
           break;
        default: return false;
     } // end switch
  } // end for loop
  return ( numFuncDecls > 0 ) ;
}

// all functions have been declared local to this anonymous function
// now put them all into an object as methods and send that object back

return {
  collectStructureStyleFacts: collectStructureStyleFacts
  ,numBadGlobalDecls: numBadGlobalDecls 
  ,numBadGlobalUses: numBadGlobalUses
  ,usesBadGlobalVars: usesBadGlobalVars
  ,numForLoops: numForLoops 
  ,numWhileLoops: numWhileLoops 
  ,numForNestLevels: numForNestLevels 
  ,numWhileNestLevels: numWhileNestLevels 
  ,numForLoopsInAllFuncDecls: numForLoopsInAllFuncDecls
  ,numWhileLoopsInAllFuncDecls: numWhileLoopsInAllFuncDecls
  ,numTopFuncDecls: numTopFuncDecls 
  ,numTopFuncCalls: numTopFuncCalls 
  ,listTopLevelTypes: listTopLevelTypes 
  ,isAllFuncDeclsPlusOneCall: isAllFuncDeclsPlusOneCall 
}

})  // end anonymous function declaration 
(); // now run it to create and return the object with all the methods
