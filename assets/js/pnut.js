

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
//  Yuxin Mo, 2/12/2015 
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
  var dObj      = {};

  dObj.nTFD     = numTopFuncDecls(ast);
  dObj.nTFC     = numTopFuncCalls(ast);
  dObj.nBGD     = numBadGlobalDecls(ast);
  dObj.nBGU     = numBadGlobalUses(ast);
  dObj.nTFL     = numForLoops(ast);
  dObj.nTWL     = numWhileLoops(ast);
  dObj.uBGV     = usesBadGlobalVars(ast);
  dObj.nAFL     = numForLoopsInAllFuncDecls(ast);
  dObj.nAWL     = numWhileLoopsInAllFuncDecls(ast);

  dObj.isAFD1C  = isAllFuncDeclsPlusOneCall(ast);
  dObj.isPBR    = isFunctionCallPassByReference(ast);
  dObj.nVGOD    = numValidGlobalObjectDeclared(ast);
  dObj.nVODF    = numValidObjectDeclaredInAllFunctions(ast);
  dObj.nDOU     = numDeclaredObjectsUsed(ast);
  dObj.isRC     = isRecuriveFunction(ast);

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
//
// NEW FUNCIONTS (update at Feb 21, 2015):
//   listFunctions(ast)                 ==>  [ string ]
//   isAValidProgram(ast)               ==>  boolean
//   isAValidFunction(func)             ==>  boolean
//   isAllFuncDeclsPlusOneCall(ast)     ==>  boolean
//   isFunctionCallPassByReference(ast) ==>  boolean
//   numValidObjectDeclared(ast)        ==>  integer >= 0
//   numDeclaredObjectUsed(ast)         ==>  integer >= 0
//   isRecuriveFunction(ast)            ==>  boolean
//   numValidObjectDeclaredInAllFunctions(ast)
//                                      ==>  integer >= 0
//   
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
  var nst = ast.body.length;  // the num of nodes in ast root
  var list = [];              
  for (var i=0; i<nst; i++) { list[i] = ast.body[i].type ; }
  return list; // array of strings
}


//------------------------------------------------------------------------
// return a list of all functions delcared in a program 
//------------------------------------------------------------------------
function listFunctions(ast) {
  var list = [];
  var len = ast.body.length;
  var funcName;

  for(var m=0; m<len; m++) {
    if(ast.body[m].type == "FunctionDeclaration") {
      funcName = ast.body[m].id.name;
      for(var s=0; s<list.lenght; s++) {
        if(funcName != list[s]) { list.push(funcName); }
      }
    }
  }

  return list;
}

//------------------------------------------------------------------------
// Check for if all declared functions get called exactly once 
//------------------------------------------------------------------------

function isAllFuncDeclsPlusOneCall (ast) {
  if(isAValidProgram(ast)) {
    var numFuncDecls    = 0;                      // num of functiona get declared
    var funcName        = []; 
    var funcNameCallNum = [];                     // match the index of funcName
    var expName         = [];
    var funcCallOnce    = true;
    var name;

    for(var s=0; s<ast.body.length; s++) {
      switch (ast.body[s].type) {
        case "FunctionDeclaration":
          // cool this is ok, so count and just keep going
          name = ast.body[s].id.name;
          if(numFuncDecls == 0) { 
            funcName.push(name); 
            numFuncDecls++;
            funcNameCallNum.push(0);
          } else {
            for(var i=0; i<numFuncDecls; i++) {
              if(name == funcName[i]) {
                alert("Warn: You are redefining an existing function " + funcName[i]);
              } else {
                funcName.push(name); 
                funcNameCallNum.push(0);          
              }
            }
            numFuncDecls++;
          }
          break;
        case "VariableDeclaration":
             // check if a var declaration also call a function 
            if(ast.body[s].declarations[0].init.type != "FunctionExpression") {
              return false;
            } 
            break;
        case "ExpressionStatement":
            if(numFuncDecls > 0) {
              // IF statement works only for one function declaration
              for(var i=0; i<numFuncDecls; i++) {
                if(ast.body[s].expression.callee.name == funcName[i]) {
                  funcNameCallNum[i]++;
                }
              }
            }  
            break;
        default:
       } // end switch
    } // end for loop

    // check for single call to each declared function
    for(var i=0; i<numFuncDecls; i++) {
      if(funcNameCallNum[i]==0 || funcNameCallNum>1) {
        funcCallOnce = false;
      }
    }
    console.log("is all functions declared and called once: " + funcCallOnce);
    return funcCallOnce;  
  } else {
    return false;
  }
}

//------------------------------------------------------------------------
// check if a program is non-empty
//------------------------------------------------------------------------

function isAValidProgram(ast) {
  return ast.body.length>0;
}

//------------------------------------------------------------------------
// check if a function is non-empty
//------------------------------------------------------------------------

function isAValidFunction(func) {
  return func.body.body.length>0;
}



//------------------------------------------------------------------------
// check if a function is pass-by-reference
//------------------------------------------------------------------------

function isFunctionCallPassByReference(ast) {
  if(!isAValidProgram(ast)) { return false; }

  var func;
  for(var i=0; i<ast.body.length; i++) {
    func = ast.body[i];
    if(func.type == "ExpressionStatement" &&
        func.expression.arguments.name!=null) {
      return true; 
    }
  }

  return false;
}


//------------------------------------------------------------------------
// calculate the number of valid global objects declaration
//------------------------------------------------------------------------

function numValidGlobalObjectDeclared(ast) {
  if(!isAValidProgram(ast)) { return 0; }

  var objs = [];
  var func;
  var funcName;

  for(var m=0; m<ast.body.length; m++) {
    func = ast.body[m];
    if(func.type == "VariableDeclaration") {
      funcName = func.declarations[0].id.name;
      objs.push(funcName);
    }
  } 
  console.log("global obj declared: " + objs.length);
  return objs.length;
}

//------------------------------------------------------------------------
// calculate the number of valid objects declaration in all functions
//------------------------------------------------------------------------

function numValidObjectDeclaredInAllFunctions(ast) {
  if(!isAValidProgram(ast)) { return 0; }

  var objs = [];
  var func;

  for(var s=0; s<ast.body.length; s++) {
    func = ast.body[s];
    if(func.type == "FunctionDeclaration") {
      for(var m=0; m<func.body.body.length; m++) {
        var funcblock = func.body.body[m];
        if(funcblock.type == "VariableDeclaration") {
          objs.push(funcblock.declarations[0].id.name);
        }
      }
    }
  }
  console.log("function obj declared: " + objs.length);
  return objs.length;
}


//------------------------------------------------------------------------
// calculate the number of declared objects in use
//------------------------------------------------------------------------

function numDeclaredObjectsUsed(ast) {
  if(!isAValidProgram(ast)) { return 0; }

  // calculate for the num of all global objects
  var gbObjs          = new Set;
  var funcObjs        = [];
  var numTopLevelNode = ast.body.length;
  var func;

  for(var i=0; i<numTopLevelNode; i++) {
    func = ast.body[i];
    switch(func.type) {
      case "VariableDeclaration":  // calculate for the num of global objects declared in functions
        gbObjs.add(func.declarations[0].id.name);
        break;
      case "FunctionDeclaration":   // calculate for the num of all objects declared in functions
        for(var m=0; m<func.body.body.length; m++) {
          var funcblock = func.body.body[m];
          if(funcblock.type == "VariableDeclaration") {
            funcObjs.push(funcblock.declarations[0].id.name);
          }
        }        
        break;
      default:
    }
  } 

  var glbObjNum   = gbObjs.length;
  var funcObjNum  = funcObjs.length;
  var gUsedNum    = 0;
  var fUsedNum    = 0;

  // how to calculate how an global object in use
  //    1. obj is passed to a function
  //
  // how to calculate how an function's object in use
  //    1. obj is passed to another function
  //    2. obj is an Out parameter
  //    ?. obj is updated in a loop?
  for(var m=0; m<numTopLevelNode; m++) {
    func = ast.body[m];
    if(func.type == "FunctionDeclaration") {
      if(gbObjs.has(func.params.name)) { gUsedNum++; }
      else {
        for(var n=0; n<func.body.body.length; n++) {
          var funcblock = func.body.body[n];
          switch(funcblock.type) {
            case "ExpressionStatement":
              var args = funcblock.expression.arguments[0];
              if(args!=null && args.type=="Identifier") {
                for(var i=0; i<funcObjNum; i++) {
                  if(args.name == funcObjs[i]) { fUsedNum++; }
                }
              }
              break;
            case "ReturnStatement":
              var arg = funcblock.argument;
              if(arg != null) { fUsedNum+=subnode(arg, funcObjs, funcObjNum); }
              break;
          }
        }
      }  
    }
  }
  console.log("objs in use: " + (gUsedNum+fUsedNum));
  return (gUsedNum + fUsedNum);
}

function subnode(nd, funcList, funcnNum) { 
  if(nd.type == "CallExpression") { return 0; }
  else if(nd.type == "Literal") { return 0; }
  else if(nd.type == "Identifier") { 
    var count = 0;
    for(var i=0; i<funcnNum; i++) { count = (nd.name==funcList[i]) ? count+1: count; }
    return count;
  }

  return subnode(nd.left)+subnode(nd.right);
}


//------------------------------------------------------------------------
// check if a function is recursive by its return statement
//------------------------------------------------------------------------

function isRecuriveFunction(ast) { 
  if(!isAValidProgram(ast)) { return false; }

  var numTopLevelNode = ast.body.length;
  var funcList = listFunctions(ast);
  var numFuncNode;
  var func;

  for(var m=0; m<numTopLevelNode; m++) {
    func = ast.body[m];
    if(func.type == "FunctionDeclaration") {
      numFuncNode = func.body.body.length;
      for(var n=0; n<numFuncNode; n++) {
        var block = func.body.body[n];
        if(block.type == "ReturnStatement" && recursionDetector(block.argument, func.id.name)) {
          console.log("Recursion: " + recursionDetector(block.argument, func.id.name));
          return true;
        }
      }
    }
  }
  return false;
}

function recursionDetector(nd, funcName) {
  if(nd.type=="Identifier") { return false; }
  else if(nd.type=="Literal") { return false; }
  else if(nd.type=="CallExpression") { return nd.callee.name==funcName; }

  return recursionDetector(nd.left, funcName)||recursionDetector(nd.right, funcName);
}


// all functions have been declared local to this anonymous function
// now put them all into an object as methods and send that object back

return {
  collectStructureStyleFacts: collectStructureStyleFacts,
  numBadGlobalDecls: numBadGlobalDecls, 
  numBadGlobalUses: numBadGlobalUses,
  usesBadGlobalVars: usesBadGlobalVars,
  numForLoops: numForLoops, 
  numWhileLoops: numWhileLoops, 
  numForNestLevels: numForNestLevels, 
  numWhileNestLevels: numWhileNestLevels, 
  numForLoopsInAllFuncDecls: numForLoopsInAllFuncDecls,
  numWhileLoopsInAllFuncDecls: numWhileLoopsInAllFuncDecls,
  numTopFuncDecls: numTopFuncDecls, 
  numTopFuncCalls: numTopFuncCalls, 
  listTopLevelTypes: listTopLevelTypes, 

  isAllFuncDeclsPlusOneCall: isAllFuncDeclsPlusOneCall,
  isFunctionCallPassByReference: isFunctionCallPassByReference, 
  numValidGlobalObjectDeclared: numValidGlobalObjectDeclared,
  numValidObjectDeclaredInAllFunctions: numValidObjectDeclaredInAllFunctions,
  numDeclaredObjectsUsed: numDeclaredObjectsUsed,
  isRecuriveFunction: isRecuriveFunction
}

})  // end anonymous function declaration 
(); // now run it to create and return the object with all the methods
