

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

<<<<<<< Updated upstream
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


/******************************************************************/
/* 1. Style Grading for Declaration and Use of Variable           */
/*    a. numDecVars(ast)      ==> integer >= 0                    */
/*    b. listDecVars(ast)     ==> [ string ]                      */
/*    c. numUndecVars(ast)    ==> integer >= 0                    */
/*    d. listUndecVars(ast)   ==> [ string ]                      */
/*    e. listVarsUsed(ast)    ==> [ string ]                      */
/*    f. isAnyFuncVar(ast)    ==> boolean ? true:false            */
/*    g. listFuncVars(ast)    ==> [ string]                       */
/******************************************************************/
=======
<<<<<<< HEAD
  function collectStructureStyleFacts (ast) {
    var dObj      = {};

    dObj.nTFD     = numTopFuncDecls(ast);
    dObj.nTFC     = numTopFuncCalls(ast);
    dObj.nBGD     = numBadGlobalDecls(ast);
    dObj.nBGU     = numBadGlobalUses(ast);
    dObj.uBGV     = usesBadGlobalVars(ast);

    /* 1. Style Grading for Declaration and Use of Variable   */
>>>>>>> Stashed changes
    dObj.nDV      = numDecVars(ast);
    dObj.lDV      = listDecVars(ast);
    dObj.nUDV     = numUndecVars(ast);
    dObj.lUDV     = listUndecVars(ast);
    dObj.lVU      = listVarsUsed(ast);
    dObj.isFV     = isAnyFuncVar(ast);
    dObj.lFV      = listFuncVars(ast);

/******************************************************************/
/* 2. Style Grading for Declaration and Use of Array              */
/*    a. numDecArrs(ast)      ==> integer >= 0                    */
/*    b. listDecArrs(ast)     ==> [ string ]                      */
/*    c. numUndecArrs(ast)    ==> integer >= 0                    */
/*    d. listUndecArrs(ast)   ==> [ string ]                      */
/*    e. numArrsUsed(ast)     ==> integer >= 0                    */
/*    f. listArrsUsed(ast)    ==> [ string ]                      */
/******************************************************************/
    dObj.nDA      = numDecArrs(ast);
    dObj.lDA      = listDecArrs(ast);
    dObj.nUDA     = numUndecArrs(ast);
    dObj.lUDA     = listUndecArrs(ast);
    dObj.nAU      = numArrsUsed(ast);
    dObj.lAU      = listArrsUsed(ast);

<<<<<<< Updated upstream
=======
    /* 3. Style Grading for Declaration and Use of Object     */
    dObj.nDO      = numDecObjs(ast);
    dObj.lDO      = listDecObjs(ast);
    dObj.nUDO     = numUndecObjs(ast);
    dObj.lUDO     = listUndecObjs(ast);
    dObj.nOU      = numObjsUsed(ast);
    dObj.lOU      = listObjsUsed(ast);
    dObj.isAFRO   = isAnyFuncReturnObj(ast);

    /* 4. Style Grading for Use of While Loop                 */
    dObj.nGLWL    = numGloLevWhileLoops(ast);
    dObj.nLLWL    = numLocLevWhileLoops(ast);
    dObj.nWLinAP  = numWhileLoopsInAProgram(ast);

    /* 5. Style Grading for Use of For Loop                   */
    dObj.nGLFL    = numGloLevForLoops(ast);
    dObj.nLLFL    = numLocLevForLoops(ast);
    dObj.nFLinAP  = numForLoopsInAProgram(ast);

    /* 6. Style Grading for Declaration and Use of Function   */




    // Improved style grading features
    dObj.nGFL     = numGlobalForLoops(ast);//x
    dObj.nGWL     = numGlobalWhileLoops(ast);//x
    dObj.nFLIF    = numForLoopsInAllFuncDecls(ast);
    dObj.nWLIF    = numWhileLoopsInAllFuncDecls(ast);
    dObj.nNFL     = numNestedForLoops(ast);
    dObj.nNWL     = numNestedWhileLoops(ast);
    dObj.isAFD1C  = isAllFuncDeclsPlusOneCall(ast);
    dObj.isPBR    = isFunctionCallPassByReference(ast);
    dObj.nGVD     = numGlobalVariableDeclared(ast);
    dObj.nVODF    = numValidObjectDeclaredInAllFunctions(ast);
    dObj.nDOU     = numDeclaredObjectsUsed(ast);
    dObj.isRC     = isRecuriveFunction(ast);

    return dObj;
  }
=======
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
>>>>>>> parent of 0f52c73... Merge branch 'myx'
>>>>>>> Stashed changes

  return dObj;
}


<<<<<<< Updated upstream
=======
//------------------------------------------------------------------------
<<<<<<< HEAD
//   style grading parser:
//    
//------------------------------------------------------------------------
  function styleGrading(ast) {
>>>>>>> Stashed changes



/******************************************************************/
/* 1. Style Grading for Declaration and Use of Variable           */
/*    a. numDecVars(ast)      ==> integer >= 0                    */
/*    b. listDecVars(ast)     ==> [ string ]                      */
/*    c. numUndecVars(ast)    ==> integer >= 0                    */
/*    d. listUndecVars(ast)   ==> [ string ]                      */
/*    e. listVarsUsed(ast)    ==> [ string ]                      */
/*    f. isAnyFuncVar(ast)    ==> boolean ? true:false            */
/*    g. listFuncVars(ast)    ==> [ string]                       */
/******************************************************************/

//------------------------------------------------------------------------
// 1-a. calculate total number of declared variables in a program
//------------------------------------------------------------------------  
  function numDecVars(ast) {
    // console.log("numDecVars: "+listDecVars(ast).length);
    return listDecVars(ast).length;
  }


//------------------------------------------------------------------------
// 1-b. list all declared variables in a program
//------------------------------------------------------------------------  
  function listDecVars(ast) {
    var arr = [];
    var nd, m, n;
    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":
          for(n in nd.declarations) { arr.push("var " + nd.declarations[n].id.name); }
          break;
        case "ForStatement":
          var floop = "for loop";

          // check var in loop initilization
          if(nd.init != null) { arr.push(nd.init.declarations[0].id.name + " <= " + floop); }

          // check var in loop body
          if(nd.body.body.length > 0) { 
            var lpVars = listDecVars(nd.body);
            for(n in lpVars) { arr.push(lpVars[n] + " <= " + floop); }
          }
          break;
        case "WhileStatement":
          var wloop = "while loop";
<<<<<<< Updated upstream

          if(nd.body.body.length > 0) { 
            var wpVars = listDecVars(nd.body);
            for(n in wpVars) { arr.push(wpVars[n] + " <= " + wloop); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName = nd.id.name;
            var ndVars = listDecVars(nd.body);
            for(n in ndVars) { arr.push(ndVars[n] + " <= Function " + ndName + "()"); }
          }
          break;
      }
    }
    // console.log("ListDecVars: "+arr);
    return arr;
  }


//------------------------------------------------------------------------
// 1-c. calculate total number of undeclared variables 
//      that get used in a program
//------------------------------------------------------------------------  
  function numUndecVars(ast) {
    // console.log("NumUndecVars: " + listUndecVars(ast).length);
    return listUndecVars(ast).length;
  } 
=======
=======
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
>>>>>>> Stashed changes


//------------------------------------------------------------------------
//   global variables, declaration and use
//-----------------------------------------------------------------------
>>>>>>> parent of 0f52c73... Merge branch 'myx'

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
<<<<<<< HEAD

    // check for the use of undelcared vars
    for(m in usedVars) { 
      if(typeof map.getItem(usedVars[m]) != undefined) {
        arr.push(usedVars[m]);
      }
    }

    // console.log("ListUndecVars: "+arr);
    return arr;
  } 


//------------------------------------------------------------------------
// 1-e. list all variables that are used in a program
//------------------------------------------------------------------------ 
  function listVarsUsed(ast) {
    var count      = 0;
    var usedVarArr = [];
    var nd, m;
    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "ExpressionStatement":
          switch(nd.expression.type) {
            case "Identifier":
              usedVarArr.push(nd.expression.name);
              break;
            case "UpdateExpression":
              usedVarArr.push(nd.expression.argument.name);
              break;
            case "AssignmentExpression":
              usedVarArr = usedVarArr.concat(listOperatorVars(nd.expression.left));
              usedVarArr = usedVarArr.concat(listOperatorVars(nd.expression.right));
              break;
          }
          break;
        case "ForStatement":
          var floop = "for loop";

          /* check var in loop initilization */

          if(nd.init != null && nd.init.type=="AssignmentExpression") { 
            var left  = listOperatorVars(nd.init.left);
            var right = listOperatorVars(nd.init.right);

            for(n in left)  { usedVarArr.push(left  + " <= " + floop); }
            for(n in right) { usedVarArr.push(right + " <= " + floop); }
          }
          else if(nd.init != null && nd.init.type=="VariableDeclaration") { 
            // left-hand side var declaration
            usedVarArr.push(nd.init.declarations[0].id.name + " <= " + floop);

            // right-hand side possilble var assignment
            if(nd.init.declarations[0].init.type=="BinaryExpression") {
              var left  = listOperatorVars(nd.init.declarations[0].init.left);
              var right = listOperatorVars(nd.init.declarations[0].init.right);

              for(n in left)  { usedVarArr.push(left  + " <= " + floop); }
              for(n in right) { usedVarArr.push(right + " <= " + floop); }
            }
          } else {
            // check vars in loop body
            if(nd.body.body.length > 0) { 
              var lpVars = listVarsUsed(nd.body);
              for(n in lpVars) { usedVarArr.push(lpVars[n] + " <= " + floop); }
            }
          }
          break;
        case "WhileStatement":
          /* skip conditional vars in while test bracket */

          // check vars in loop body
          var wloop = "while loop";
          if(nd.body.body.length > 0) { 
            var wpVars = listVarsUsed(nd.body);
            for(n in wpVars) { usedVarArr.push(wpVars[n] + " <= " + wloop); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName = nd.id.name;
            var ndVars = listVarsUsed(nd.body);
            for(n in ndVars) { usedVarArr.push(ndVars[n] + " <= Function " + ndName + "()"); }
          }
          break;
      }
    }
    // console.log("ListVarsUsed:" +usedVarArr);
    return usedVarArr;
  } 

//------------------------------------------------------------------------
<<<<<<< Updated upstream
=======
// private function:
// list all operator variables (right-hand side variables)
//------------------------------------------------------------------------ 
  function listOperatorVars(nd) {
    var arr = [];
    switch(nd.type) {
      case "Identifier":
        arr.push(nd.name);
        break;
      case "BinaryExpression":
        arr = arr.concat(listOperatorVars(nd.left));
        arr = arr.concat(listOperatorVars(nd.right));
        break;
      case "Literal":
        break;
      case "CallExpression":
        break;
    }
    return arr;
=======
>>>>>>> parent of 0f52c73... Merge branch 'myx'
  }
  return count;
}

//------------------------------------------------------------------------
>>>>>>> Stashed changes
// 1-f. exam if any function gets assigned to a variable in global level
//      ex: function bar() { }
//          var f2 = bar;
//------------------------------------------------------------------------
  function isAnyFuncVar(ast) {
    // console.log("isAnyFuncVar: " + listFuncVars(ast).length>0);
    return listFuncVars(ast).length>0;
  }

//------------------------------------------------------------------------
// 1-g. list global variables in which directly points to a function
//      ex: function bar() { }
//          var f2 = bar;
//------------------------------------------------------------------------
  function listFuncVars(ast) {
    var node;
    var func = new Set();
    var used = new Set();
    var arr  = [];


    for(m in ast.body) {
      node = ast.body[m];

      if(node.type=="FunctionDeclaration" && node.id.type=="Identifier") {
        func.add(node.id.name);
      }
    }

    for(m in ast.body) {
      node = ast.body[m];

      switch(node.type) {
        case "VariableDeclaration":
          var subnode = node.declarations;
          for(n in subnode) {
            if(subnode[n].init!=null && subnode[n].init.type=="Identifier") {
              if(!funcs.has(subnode[n].init.name) && !used.has(subnode[n].init.name)){
                used.add(subnode[n].id.name);
                arr.push(subnode[n].id.name);
              }
            } 
          }
          break;
        case "ExpressionStatement":
          var exp = node.expression;
          if(exp.type=="AssignmentExpression" && 
            exp.left.type=="Identifier" && exp.right.type=="Identifier") {
            if(!funcs.has(exp.right.name) && !used.has(exp.left.name)) { 
              used.add(exp.left.name);
              arr.push(exp.left.name);
            }                    
          }
          break;
      }
    }
    // console.log("ListFuncVars: " +arr);
    return arr;
  }

//------------------------------------------------------------------------
// private function:
// list all operator variables (right-hand side variables)
//------------------------------------------------------------------------ 
  function listOperatorVars(nd) {
    var arr = [];
    switch(nd.type) {
      case "Identifier":
        arr.push(nd.name);
        break;
      case "BinaryExpression":
        arr = arr.concat(listOperatorVars(nd.left));
        arr = arr.concat(listOperatorVars(nd.right));
        break;
      case "Literal":
        break;
      case "CallExpression":
        break;
    }
    return arr;
  }



function usesBadGlobalVars(ast) { 
  return (numBadGlobalDecls(ast) > 0 || numBadGlobalUses(ast) > 0); 
}

<<<<<<< Updated upstream

/******************************************************************/
/* 2. Style Grading for Declaration and Use of Array              */
/*    a. numDecArrs(ast)      ==> integer >= 0                    */
/*    b. listDecArrs(ast)     ==> [ string ]                      */
/*    c. numUndecArrs(ast)    ==> integer >= 0                    */
/*    d. listUndecArrs(ast)   ==> [ string ]                      */
/*    e. numArrsUsed(ast)     ==> integer >= 0                    */
/*    f. listArrsUsed(ast)    ==> [ string ]                      */
/******************************************************************/
=======
<<<<<<< HEAD
/**********************************************************/
/* 2. Style Grading for Declaration and Use of Array      */
/*    a. numDecArrs(ast)      ==> integer >= 0            */
/*    b. listDecArrs(ast)     ==> [ string ]              */
/*    c. numUndecArrs(ast)    ==> integer >= 0            */
/*    d. listUndecArrs(ast)   ==> [ string ]              */
/*    e. numArrsUsed(ast)     ==> integer >= 0            */
/*    f. listArrsUsed(ast)    ==> [ string ]              */
/**********************************************************/
>>>>>>> Stashed changes

//------------------------------------------------------------------------
// 2-a. calculate total number of declared arrays in a program
//      ex: 
//          var a, e=[], f="empty";
//          var b = [one, two, three];
//          var c = new Array();
//------------------------------------------------------------------------  
  function numDecArrs(ast) {
    console.log("numDecArrs: " + listDecArrs(ast).length);
    return listDecArrs(ast).length;
  } 


//------------------------------------------------------------------------
// 2-b. list declared arrays in a program
//      ex: 
//          var a, e=[], f="empty";
//          var b = [one, two, three];
//          var c = new Array();
//------------------------------------------------------------------------  
  function listDecArrs(ast) {
    var arr = [];
    var nd, m, n;
    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":
          decs = nd.declarations;
          for(n in decs) {
            if(decs[n].init != null) {
              if(decs[n].init.type == "ArrayExpression") { 
                arr.push(decs[n].id.name); 
              }
              else if(decs[n].init.type == "NewExpression" && 
                decs[n].init.callee.name == "Array") {
                arr.push(decs[n].id.name);
              }
            }
          } 
          break;
        case "ForStatement":
          var floop = "for loop";

          // check var in loop body
          if(nd.body.body.length > 0) { 
            var lpArrs = listDecArrs(nd.body);
            for(n in lpArrs) { arr.push(lpArrs[n] + " <= " + floop); }
          }
          break;
        case "WhileStatement":
          var wloop = "while loop";

          if(nd.body.body.length > 0) { 
            var wpArrs = listDecArrs(nd.body);
            for(n in wpArrs) { arr.push(wpArrs[n] + " <= " + wloop); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName = nd.id.name;
            var ndArrs = listDecArrs(nd.body);
            for(n in ndArrs) { arr.push(ndArrs[n] + " <= Function " + ndName + "()"); }
          }
          break;
      }
    }
    console.log("listDecArrs: " + arr);
    return arr;  
  } 


//------------------------------------------------------------------------
// 2-c. calculate total number of undeclared arrays 
//      that get used in a program
//      ex:
//        (undeclared p) p.push("p");
//        (undeclared a) a = [one, two, three];
//        (undeclared b) b = new Array({});
//        (undeclared c) c = [];
//------------------------------------------------------------------------  
  function numUndecArrs(ast) {
    console.log("numUndecArrs: " + listUndecArrs(ast).length);
    return listUndecArrs(ast).length;
  } 


//------------------------------------------------------------------------
// 2-d. list all undeclared arrays that get used in a program
//      ex:
//        (undeclared p) p.push("p");
//        (undeclared a) a = [one, two, three];
//        (undeclared b) b = new Array({});
//        (undeclared c) c = [];
//------------------------------------------------------------------------  
  function listUndecArrs(ast) {
    var decArrs  = listDecArrs(ast);
    var usedArrs = listArrsUsed(ast);
    var map      = new HashMap();
    var arr      = [];

    // store all declared vars in a hashmap
    for(m in decArrs) { 
      map.setItem(decArrs[m], 0); 
    }

    // check for the use of undelcared vars
    for(m in usedArrs) { 
      if(typeof map.getItem(usedArrs[m]) != undefined) {
        arr.push(usedVars[m]);
      }
    }
    console.log("listUndecArrs: " + arr);
    return arr;
  } 


//------------------------------------------------------------------------
// 2-e. calculate total number of arrays that are used in a program
//      ex:
//        p.push("p"), p.sort(), p.shift()...
//        a = [one, two, three];
//        b = new Array({});
//        c = [];
//------------------------------------------------------------------------  
  function numArrsUsed(ast) {
    var usedArrs = listArrsUsed(ast);
    var arr      = new Set();

    for(m in usedArrs) { arr.add(usedArrs[m]); }
    console.log("numArrsUsed: " + arr.size);
    return arr.size;
  } 


//------------------------------------------------------------------------
// 2-f. list all arrays that are used in a program 
//      ex:
//        p.push("p"), p.sort(), p.shift()...
//        a = [one, two, three];
//        b = new Array({});
//        c = [];
//------------------------------------------------------------------------  
  function listArrsUsed(ast) {
    var count    = 0;
    var usedArrs = [];
    var nd, m, exp, func;
    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "ExpressionStatement":
          exp = nd.expression;
          switch(exp.type) {
            case "AssignmentExpression":
              if(exp.right.type=="ArrayExpression") { 
                usedArrs.push(exp.left.name); 
              }
              else if(exp.right.type=="NewExpression" && exp.right.callee.name=="Array") {
                usedArrs.push(exp.left.name);
              }              
              break;
            case "CallExpression":
              method = exp.callee.property.name;
              if(method=="push" || method=="sort"  || method=="join" || method=="valueOf" ||
                 method=="pop"  || method=="shift" || method=="unshift") {
                usedArrs.push(exp.callee.object.name);
              } 
              break;
          }
          break;
        case "ForStatement":
          var floop = "for loop";
          // check vars in loop body
          if(nd.body.body.length > 0) { 
            var lpArrs = listArrsUsed(nd.body);
            for(n in lpArrs) { usedArrs.push(lpArrs[n] + " <= " + floop); }
          }
          break;
        case "WhileStatement":
          /* skip testing vars*/

          // check vars in loop body
          var wloop = "while loop";
          if(nd.body.body.length > 0) { 
            var wpArrs = listArrsUsed(nd.body);
            for(n in wpArrs) { usedArrs.push(wpArrs[n] + " <= " + wloop); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName = nd.id.name;
            var ndArrs = listArrsUsed(nd.body);
            for(n in ndArrs) { usedArrs.push(ndArrs[n] + " <= Function " + ndName + "()"); }
          }
          break;
      }
    }
    console.log("listArrsUsed: " + usedArrs);
    return usedArrs;
  } 










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


<<<<<<< Updated upstream
=======
=======


//------------------------------------------------------------------------
//   loops (top level)
>>>>>>> parent of 0f52c73... Merge branch 'myx'
//------------------------------------------------------------------------
>>>>>>> Stashed changes

<<<<<<< HEAD
//------------------------------------------------------------------------
//   loops (top level)
//------------------------------------------------------------------------

<<<<<<< Updated upstream
=======
    return list;
=======
>>>>>>> Stashed changes
function numForLoops (ast) {
  // only counts for loops at the global level for now
  var count = 0;
  var nst = ast.body.length;
  for (var i=0; i<nst; i++) {
    if (ast.body[i].type == "ForStatement") { count++; }
<<<<<<< Updated upstream
=======
>>>>>>> parent of 0f52c73... Merge branch 'myx'
>>>>>>> Stashed changes
  }
  return count;
}


<<<<<<< Updated upstream
=======
<<<<<<< HEAD



/**********************************************************/
/* 4. Style Grading for Use of While Loop                 */
/*    a. numGloLevWhileLoops(ast)      ==> integer >= 0   */
/*    b. numLocLevWhileLoops(ast)      ==> integer >= 0   */
/*    c. numWhileLoopsInAProgram(ast)  ==> integer >= 0   */
/**********************************************************/

//------------------------------------------------------------------------
// 4-a. calculate total number of while loops in global level
//------------------------------------------------------------------------  
  function numGloLevWhileLoops(ast) {
    console.log("global while loop: " + numWhileLoops(ast));
    return numWhileLoops(ast);
=======
>>>>>>> Stashed changes
function numWhileLoops (ast) {
  // only counts while loops at the global level for now
  var count = 0;
  var nst = ast.body.length;
  for (var i=0; i<nst; i++) {
    if (ast.body[i].type == "WhileStatement") { count++; }
<<<<<<< Updated upstream
=======
>>>>>>> parent of 0f52c73... Merge branch 'myx'
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
    return numLocLevWhileLoops(ast)+numLocLevWhileLoops(ast);
  }
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream

function numTopFuncCalls (ast) {
  var count = 0;
  var nst = ast.body.length;
  var st;
  for (var i=0; i<nst; i++) {
    st = ast.body[i];
    if (isFuncCall(st)) count += 1;
=======
//------------------------------------------------------------------------
// 5-b. calculate total number of for loops in functions (local level)
//------------------------------------------------------------------------  
  function numLocLevForLoops(ast) {
    var count = 0;
    var nd;
    for (var m in ast.body) {
      nd = ast.body[m];
      count = (nd.type=="FunctionDeclaration") ? count+numForLoops(nd.body):count;
=======

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
>>>>>>> parent of 0f52c73... Merge branch 'myx'
    }
  }
  return count;
}

<<<<<<< HEAD
//------------------------------------------------------------------------
// 5-c. calculate total number of for loops in a program
//      1. global level for loops: unnested and nested
//      2. local level for loops: unnested and nested
//------------------------------------------------------------------------  
  function numForLoopsInAProgram(ast) {
    return numGlobalForLoops(ast)+numForLoopsInAllFunctions(ast);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
//   top level structure check
//   is it nothing but func decls and one func call?
//------------------------------------------------------------------------
=======
// private function:
// calculate total number of nested for loops in a calling scope
//------------------------------------------------------------------------  
  function numNestedForLoops(nd) {
    var count = 0;
    var snd;
    for(var m in nd.body) {
      snd = nd.body[m];
      count = (snd.type=="ForStatement" && numForLoops(snd.body)>0) ? count+1:count;
=======

function numWhileLoopsInAllFuncDecls(ast) {
  // search tree and when find a func decl we do the loop count 
  // skips global level
  var count = 0;
  var nst = ast.body.length;
  for (var i=0; i<nst; i++) {
    if (ast.body[i].type == "FunctionDeclaration") { 
       count += numWhileLoops( ast.body[i].body);
       //alert("in func for count: " +count);
>>>>>>> parent of 0f52c73... Merge branch 'myx'
    }
  }
  return count;
}
>>>>>>> Stashed changes


function listTopLevelTypes (ast) {
  // what are the main top level statements in the program
  var nst = ast.body.length;  // the num of nodes in ast root
  var list = [];              
  for (var i=0; i<nst; i++) { list[i] = ast.body[i].type ; }
  return list; // array of strings
}

<<<<<<< HEAD

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
    // console.log("is all functions declared and called once: " + funcCallOnce);
    return funcCallOnce;  
  } else {
    return false;
  }
}

//------------------------------------------------------------------------
// check if a program is non-empty
//------------------------------------------------------------------------

<<<<<<< Updated upstream
function isAValidProgram(ast) {
  return ast.body.length>0;
}
=======

  function isAFuncCall(nd) { 
    switch (nd.type) {
      case "ExpressionStatement":
        exp = nd.expression;
        if (exp.type=="CallExpression") { return true; }
        if (exp.type=="AssignmentExpression" && 
          exp.right.type=="CallExpression") {
  	      return true;
        }
        break;
      case "VariableDeclaration":
        if (nd.declarations[0].init.type=="CallExpression") return true;
        break;
=======
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
>>>>>>> parent of 0f52c73... Merge branch 'myx'
    }
  } // end for loop
  return count;
}

<<<<<<< HEAD
=======

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

>>>>>>> Stashed changes

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


>>>>>>> parent of 0f52c73... Merge branch 'myx'
//------------------------------------------------------------------------
// check if a function is non-empty
//------------------------------------------------------------------------
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
  function listInvalidFuncCallExps(ast) {
    var dict = DictDecFuncs(ast);
    var list = [];
    var node;
    for(m in ast.body) {
      node = ast.body[m];
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
  }

  return false;
}


=======
    return list;
=======


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
>>>>>>> parent of 0f52c73... Merge branch 'myx'
  }

  return list;
}

>>>>>>> Stashed changes
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
  // console.log("global obj declared: " + objs.length);
  return objs.length;
}

//------------------------------------------------------------------------
// calculate the number of valid objects declaration in all functions
//------------------------------------------------------------------------
<<<<<<< Updated upstream

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
  // console.log("function obj declared: " + objs.length);
  return objs.length;
}
=======
<<<<<<< HEAD
  function areDecFuncsCalledOnce (ast) {
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
              funcNameCallNum.push(0);
            } else {
              for(var i=0; i<numFuncDecls; i++) {
                if(name == funcName[i]) {
                  alert("Warn: You are redefining an existing function " + funcName[i]);
                } else {
                  funcName.push(name); 
                  funcNameCallNum.push(0);          
                }
=======

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
>>>>>>> parent of 0f52c73... Merge branch 'myx'
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
<<<<<<< HEAD
      console.log("is all functions declared and called once: " + funcCallOnce);
      return funcCallOnce;
  }
=======
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
>>>>>>> parent of 0f52c73... Merge branch 'myx'

>>>>>>> Stashed changes


//------------------------------------------------------------------------
// calculate the number of declared objects in use
//------------------------------------------------------------------------
<<<<<<< Updated upstream

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
  // console.log("objs in use: " + (gUsedNum+fUsedNum));
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
          // console.log("Recursion: " + recursionDetector(block.argument, func.id.name));
          return true;
=======
<<<<<<< HEAD
  function isAFuncPassedByReference(ast) {
    var func;
    for(var i in ast.body) {
      func = ast.body[i];
      if(func.type=="ExpressionStatement"   &&
          func.expression.arguments!=null   &&
          func.expression.arguments.name!=null) {
        return true; 
      }
    }
=======
>>>>>>> parent of 0f52c73... Merge branch 'myx'

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


<<<<<<< HEAD
// //------------------------------------------------------------------------
// // calculate the number of valid global objects declaration
// //------------------------------------------------------------------------
//   function numGlobalVariableDeclared(ast) {
//     if(!isAValidProgram(ast)) { return 0; }
// 
//     var objs = [];
//     var func;
//     var funcName;
// 
//     for(var m=0; m<ast.body.length; m++) {
//       func = ast.body[m];
//       if(func.type == "VariableDeclaration") {
//         funcName = func.declarations[0].id.name;
//         objs.push(funcName);
//       }
//     } 
//     console.log("global obj declared: " + objs.length);
//     return objs.length;
//   }


// //------------------------------------------------------------------------
// // calculate the number of valid objects declaration in all functions
// //------------------------------------------------------------------------
//   function numValidObjectDeclaredInAllFunctions(ast) {
//     if(!isAValidProgram(ast)) { return 0; }
// 
//     var objs = [];
//     var func;
// 
//     for(var s=0; s<ast.body.length; s++) {
//       func = ast.body[s];
//       if(func.type == "FunctionDeclaration") {
//         for(var m=0; m<func.body.body.length; m++) {
//           var funcblock = func.body.body[m];
//           if(funcblock.type == "VariableDeclaration") {
//             objs.push(funcblock.declarations[0].id.name);
//           }
//         }
//       }
//     }
//     console.log("function obj declared: " + objs.length);
//     return objs.length;
//   }


// //------------------------------------------------------------------------
// // calculate the number of declared objects in use
// //------------------------------------------------------------------------
//   function numDeclaredObjectsUsed(ast) {
//     if(!isAValidProgram(ast)) { return 0; }
// 
//     // calculate for the num of all global objects
//     var gbObjs          = new Set();
//     var funcObjs        = [];
//     var numTopLevelNode = ast.body.length;
//     var func;
// 
//     for(var i=0; i<numTopLevelNode; i++) {
//       func = ast.body[i];
//       switch(func.type) {
//         case "VariableDeclaration":   // calculate for the num of global objects declared in functions
//           gbObjs.add(func.declarations[0].id.name);
//           break;
//         case "FunctionDeclaration":   // calculate for the num of all objects declared in functions
//           for(var m=0; m<func.body.body.length; m++) {
//             var funcblock = func.body.body[m];
//             if(funcblock.type == "VariableDeclaration") {
//               funcObjs.push(funcblock.declarations[0].id.name);
//             }
//           }        
//           break;
//       }
//     } 
// 
//     var glbObjNum   = gbObjs.length;
//     var funcObjNum  = funcObjs.length;
//     var gUsedNum    = 0;
//     var fUsedNum    = 0;
// 
//     // how to calculate how an global object in use
//     //    1. obj is passed to a function
//     //
//     // how to calculate how an function's object in use
//     //    1. obj is passed to another function
//     //    2. obj is an Out parameter
//     //    ?. obj is updated in a loop?
//     for(var m=0; m<numTopLevelNode; m++) {
//       func = ast.body[m];
//       if(func.type == "FunctionDeclaration") {
//         if(gbObjs.has(func.params.name)) { gUsedNum++; }
//         else {
//           for(var n=0; n<func.body.body.length; n++) {
//             var funcblock = func.body.body[n];
//             switch(funcblock.type) {
//               case "ExpressionStatement":
//                 var args = funcblock.expression.arguments[0];
//                 if(args!=null && args.type=="Identifier") {
//                   for(var i=0; i<funcObjNum; i++) {
//                     if(args.name == funcObjs[i]) { fUsedNum++; }
//                   }
//                 }
//                 break;
//               case "ReturnStatement":
//                 var arg = funcblock.argument;
//                 if(arg != null) { fUsedNum+=subnode(arg, funcObjs, funcObjNum); }
//                 break;
//             }
//           }
//         }  
//       }
//     }
//     console.log("objs in use: " + (gUsedNum+fUsedNum));
//     return (gUsedNum + fUsedNum);
//   }
// 
//   function subnode(nd, funcList, funcnNum) { 
//     if(nd.type == "CallExpression") { return 0; }
//     else if(nd.type == "Literal") { return 0; }
//     else if(nd.type == "Identifier") { 
//       var count = 0;
//       for(var i=0; i<funcnNum; i++) { count = (nd.name==funcList[i]) ? count+1: count; }
//       return count;
//     }
// 
//     return subnode(nd.left)+subnode(nd.right);
//   }




/************************************************************/
/* 7. Style Grading for Recursive Function                  */
/*    a. isRecuriveFunction(ast)  ==> boolean ? true:false  */
/************************************************************/

//------------------------------------------------------------------------------
// 7-a. exam if a function is recursive or not by checking its return statement
//      ex: CORRECT: function myMain() {
//                      var x = foo(3);
//                      alert(x);
//                   }
//
//                   function foo(x) {
//                      if x=1 return 1;
//                      return x*foo(x-1);
//                   }
//                   myMain();
//
//           WRONG:  function myMain() {
//                      var x = foo(3);
//                      alert(x);
//                   }
//
//                   function foo(x) {
//                      var prod=1;
//                      for (var i=x; i>1; i--) { prod *= i; }
//                      return prod;
//                   }
//                   myMain();
//------------------------------------------------------------------------------
  function isRecuriveFunction(ast) { 
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
=======
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
>>>>>>> Stashed changes
        }
      }
    }
  }
<<<<<<< Updated upstream
  return false;
}

function recursionDetector(nd, funcName) {
  if(nd.type=="Identifier") { return false; }
  else if(nd.type=="Literal") { return false; }
  else if(nd.type=="CallExpression") { return nd.callee.name==funcName; }

  return recursionDetector(nd.left, funcName)||recursionDetector(nd.right, funcName);
}

=======
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
>>>>>>> parent of 0f52c73... Merge branch 'myx'
          }
        }
      }  
    }
  }
  console.log("objs in use: " + (gUsedNum+fUsedNum));
  return (gUsedNum + fUsedNum);
}

<<<<<<< HEAD

//------------------------------------------------------------------------------
// private function:
// check a funciton's returnstatement if it is a call of the function or not
//------------------------------------------------------------------------------
  function recursionDetector(nd, funcName) {
    if(nd.type=="Identifier") { return false; }
    else if(nd.type=="Literal") { return false; }
    else if(nd.type=="CallExpression") { return nd.callee.name==funcName; }

    return recursionDetector(nd.left, funcName)||recursionDetector(nd.right, funcName);
=======
function subnode(nd, funcList, funcnNum) { 
  if(nd.type == "CallExpression") { return 0; }
  else if(nd.type == "Literal") { return 0; }
  else if(nd.type == "Identifier") { 
    var count = 0;
    for(var i=0; i<funcnNum; i++) { count = (nd.name==funcList[i]) ? count+1: count; }
    return count;
>>>>>>> parent of 0f52c73... Merge branch 'myx'
  }
>>>>>>> Stashed changes

  return subnode(nd.left)+subnode(nd.right);
}



//------------------------------------------------------------------------
<<<<<<< HEAD
// private function:
//  HashMap:
//    1. setItem(key, value) ==> map a new key to a value in the map
//    2. getItem(key)        ==> retrieve a value of a key
//    3. hasItem(key)        ==> check if a key is in the dic or not
//    4. removeItem(key)     ==> remove a key with its associative value
//    5. keys()              ==> a list of all keys in the map
//    6. values()            ==> a list of all values in the map
//    7. clear()             ==> clear the map
=======
// check if a function is recursive by its return statement
>>>>>>> parent of 0f52c73... Merge branch 'myx'
//------------------------------------------------------------------------

<<<<<<< HEAD
      this.setItem = function(key, value) {
        var previous = undefined;
        if (this.hasItem(key)) { previous = this.items[key];
        } else { this.length++; }

        this.items[key] = value;
        return previous;
      }
=======
function isRecuriveFunction(ast) { 
  if(!isAValidProgram(ast)) { return false; }
>>>>>>> parent of 0f52c73... Merge branch 'myx'

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
<<<<<<< HEAD

      this.keys = function() {
        var keys = [];
        for (var k in this.items) {
          if (this.hasItem(k)) { keys.push(k); }
        }
        return keys;
      }

      this.values = function() {
        var values = [];
        for (var k in this.items) {
          if (this.hasItem(k)) { values.push(this.items[k]); }
        }
        return values;
      }

      this.clear = function() {
        this.items = {}
        this.length = 0;
      }
=======
    }
>>>>>>> parent of 0f52c73... Merge branch 'myx'
  }
<<<<<<< Updated upstream


=======
  return false;
}
>>>>>>> Stashed changes

function recursionDetector(nd, funcName) {
  if(nd.type=="Identifier") { return false; }
  else if(nd.type=="Literal") { return false; }
  else if(nd.type=="CallExpression") { return nd.callee.name==funcName; }

  return recursionDetector(nd.left, funcName)||recursionDetector(nd.right, funcName);
}


// all functions have been declared local to this anonymous function
// now put them all into an object as methods and send that object back

<<<<<<< Updated upstream
=======
<<<<<<< HEAD
  return {

    /* 1. Style Grading for Declaration and Use of Variable   */
    numDecVars    : numDecVars,
    listDecVars   : listDecVars,
    numUndecVars  : numUndecVars,
    listUndecVars : listUndecVars,
    listVarsUsed  : listVarsUsed,
    isAnyFuncVars : isAnyFuncVars,
    listFuncVars  : listFuncVars,

    /* 2. Style Grading for Declaration and Use of Array      */
    numDecArrs    : numDecArrs,
    listDecArrs   : listDecArrs,
    numUndecArrs  : numUndecArrs,
    listUndecArrs : listUndecArrs,
    numArrsUsed   : numArrsUsed,
    listArrsUsed  : listArrsUsed,

    /* 3. Style Grading for Declaration and Use of Object     */
    numDecObjs          : numDecObjs,
    listDecObjs         : listDecObjs,
    numUndecObjs        : numUndecObjs,
    listUndecObjs       : listUndecObjs,
    numObjsUsed         : numObjsUsed,
    listObjsUsed        : listObjsUsed,
    isAnyFuncReturnObj  : isAnyFuncReturnObj,

    /* 4. Style Grading for Use of While Loop                 */
    numGloLevWhileLoops       : numGloLevWhileLoops,
    numLocLevWhileLoops       : numLocLevWhileLoops,
    numWhileLoopsInAProgram   : numWhileLoopsInAProgram,

    /* 5. Style Grading for Use of For Loop                   */
    numGloLevForLoops       : numGloLevForLoops,
    numLocLevForLoops       : numLocLevForLoops,
    numForLoopsInAProgram   : numForLoopsInAProgram,


    collectStructureStyleFacts: collectStructureStyleFacts,
    numBadGlobalDecls: numBadGlobalDecls, 
    numBadGlobalUses: numBadGlobalUses,
    usesBadGlobalVars: usesBadGlobalVars,
    numWhileLoops: numWhileLoops, 
    numWhileNestLevels: numWhileNestLevels, 
    numForLoopsInAllFuncDecls: numForLoopsInAllFuncDecls,
    numWhileLoopsInAllFuncDecls: numWhileLoopsInAllFuncDecls,
    numTopFuncDecls: numTopFuncDecls, 
    numTopFuncCalls: numTopFuncCalls, 
    listTopLevelTypes: listTopLevelTypes, 


    // modified features return
    numGlobalForLoops: numGlobalForLoops,
    numGlobalWhileLoops: numGlobalWhileLoops,
    numForLoopsInAllFuncDecls: numForLoopsInAllFuncDecls,
    numWhileLoopsInAllFuncDecls: numWhileLoopsInAllFuncDecls,
    numNestedForLoops: numNestedForLoops,
    numNestedWhileLoops: numNestedWhileLoops,
    isAllFuncDeclsPlusOneCall: isAllFuncDeclsPlusOneCall,
    isFunctionCallPassByReference: isFunctionCallPassByReference, 
    numGlobalVariableDeclared: numGlobalVariableDeclared,
    numValidObjectDeclaredInAllFunctions: numValidObjectDeclaredInAllFunctions,
    numDeclaredObjectsUsed: numDeclaredObjectsUsed,
    isRecuriveFunction: isRecuriveFunction
  }
=======
>>>>>>> Stashed changes
return {
  collectStructureStyleFacts: collectStructureStyleFacts,
  numBadGlobalDecls: numBadGlobalDecls, 
  numBadGlobalUses: numBadGlobalUses,
  usesBadGlobalVars: usesBadGlobalVars,
  numForLoops: numForLoops, 
  numWhileLoops: numWhileLoops, 
<<<<<<< Updated upstream
=======
  numForNestLevels: numForNestLevels, 
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  isRecuriveFunction: isRecuriveFunction,


  /* 1. Style Grading for Declaration and Use of Variable   */
  numDecVars                 : numDecVars,
  listDecVars                : listDecVars,
  numUndecVars               : numUndecVars,
  listUndecVars              : listUndecVars,
  listVarsUsed               : listVarsUsed,
  isAnyFuncVar               : isAnyFuncVar,
  listFuncVars               : listFuncVars,

  /* 2. Style Grading for Declaration and Use of Array      */
  numDecArrs                 : numDecArrs,
  listDecArrs                : listDecArrs,
  numUndecArrs               : numUndecArrs,
  listUndecArrs              : listUndecArrs,
  numArrsUsed                : numArrsUsed,
  listArrsUsed               : listArrsUsed,
}
=======
  isRecuriveFunction: isRecuriveFunction
}
>>>>>>> parent of 0f52c73... Merge branch 'myx'
>>>>>>> Stashed changes

})  // end anonymous function declaration 
(); // now run it to create and return the object with all the methods
