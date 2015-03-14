

//------------------------------------------------------------------------
//
//  This JavaScript code implements an API for AST analysis
//    the analysis is intended for simple auto grading 
//    and for enforcing basic programming structure and style guidelines 
//    for an intro programming class
//
//  We use the Acorn parser to generate an AST 
//    The AST is a JSON object, in Mozilla SpiderMonkey format
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
    dObj.uBGV     = usesBadGlobalVars(ast);


    // Improved style grading features
    dObj.nGFL     = numGlobalForLoops(ast);
    dObj.nGWL     = numGlobalWhileLoops(ast);
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



//------------------------------------------------------------------------
//
// API functions
//
//   numBadGlobalDecls (ast)          ==>  integer >= 0
//   numBadGlobalUses (ast)           ==>  integer >= 0
//   usesBadGlobalVars (ast)          ==>  boolean
//   numWhileLoops (ast)              ==>  integer >= 0
//   numForLoopsInAllFuncDecls(ast)   ==>  integer >= 0
//   numWhileLoopsInAllFuncDecls(ast) ==>  integer >= 0
//   numWhileNestLevels (ast)         ==>  integer >= 0
//   numTopFuncDecls (ast)            ==>  integer >= 0
//   numTopFuncCalls (ast)            ==>  integer >= 0
//   isFuncCall (obj)                 ==>  boolean
//   listTopLevelTypes (ast)          ==>  [ string ]
//
// NEW FUNCIONTS (update at Feb 21, 2015):
//   numGlobalForLoops(ast)             ==>  integer >= 0
//   numForLoopsInAllFuncDecls(ast)     ==>  integer >= 0
//   numNestedForLoops(ast)             ==>  integer >= 0
//
//   numGlobalWhileLoops(ast)           ==>  integer >= 0
//   numWhileLoopsInAllFuncDecls(ast)   ==>  integer >= 0
//   numNestedWhileLoops(ast)           ==>  integer >= 0
//
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
//   style grading parser:
//    
//------------------------------------------------------------------------
  function styleGrading(ast) {

  }



/**********************************************************/
/* 1. Style Grading for Declaration and Use of Variable   */
/*    a. numDecVars(ast)                                  */
/*    b. listDecVars(ast)                                 */
/*    c. numUndecVars(ast)                                */
/*    d. listUndecVars(ast)                               */
/*    e. listVarsUsed(ast)                                */
/**********************************************************/

//------------------------------------------------------------------------
// 1-a. calculate total number of declared variables in a program
//------------------------------------------------------------------------  
  function numDecVars(ast) {
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

          if(nd.body.body.length > 0) { 
            var wpVars = listDecVars(nd.body);
            for(n in wpVars) { arr.push(wpVars[n] + " <= " + wloop); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName = nd.body.id.name;
            var ndVars = listDecVars(nd.body);
            for(n in ndVars) { arr.push(ndVars[n] + " <= Function " + ndName + "()"); }
          }
          break;
      }
    }
    return arr;
  }


//------------------------------------------------------------------------
// 1-c. calculate total number of undeclared variables 
//      that get used in a program
//------------------------------------------------------------------------  
  function numUndecVars(ast) {
    return listUndecVars(ast).length;
  } 


//------------------------------------------------------------------------
// 1-d. list all undeclacred variables that get used in a program
//------------------------------------------------------------------------ 
  function listUndecVars(ast) {
    var decVars  = listDecVars(ast);
    var usedVars = listVarsUsed(ast);
    var map      = new HashMap();
    var arr      = [];

    // store all declared vars in a hashmap
    for(m in decVars) { 
      map.setItem(decVars[m], 0); 
    }

    // check for the use of undelcared vars
    for(m in usedVars) { 
      if(typeof map.getItem(usedVars[m]) != undefined) {
        arr.push(usedVars[m]);
      }
    }

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
            var left  = listOperatorVars(nd.init.declarations[0].init.left);
            var right = listOperatorVars(nd.init.declarations[0].init.right);

            for(n in left)  { usedVarArr.push(left  + " <= " + floop); }
            for(n in right) { usedVarArr.push(right + " <= " + floop); }
          } else {
            // check vars in loop body
            if(nd.body.body.length > 0) { 
              var lpVars = listVarsUsed(nd.body);
              for(n in lpVars) { usedVarArr.push(lpVars[n] + " <= " + floop); }
            }
          }
          break;
        case "WhileStatement":
          /* skip testing vars*/

          // check vars in loop body
          var wloop = "while loop";
          if(nd.body.body.length > 0) { 
            var wpVars = listVarsUsed(nd.body);
            for(n in wpVars) { usedVarArr.push(wpVars[n] + " <= " + wloop); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName = nd.body.id.name;
            var ndVars = listVarsUsed(nd.body);
            for(n in ndVars) { usedVarArr.push(ndVars[n] + " <= Function " + ndName + "()"); }
          }
          break;
      }
    }
    return usedVarArr;
  } 

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



/**********************************************************/
/* 2. Style Grading for Declaration and Use of Array      */
/*    a. numDecArrs(ast)                                  */
/*    b. listDecArrs(ast)                                 */
/*    c. numUndecArrs(ast)                                */
/*    d. listUndecArrs(ast)                               */
/*    e. numArrsUsed(ast)                                 */
/*    f. listArrsUsed(ast)                                */
/**********************************************************/

//------------------------------------------------------------------------
// 2-a. calculate total number of declared arrays in a program
//      ex: 
//          var a, e=[], f="empty";
//          var b = [one, two, three];
//          var c = new Array();
//------------------------------------------------------------------------  
  function numDecArrs(ast) {
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
            var ndName = nd.body.id.name;
            var ndArrs = listDecArrs(nd.body);
            for(n in ndArrs) { arr.push(ndArrs[n] + " <= Function " + ndName + "()"); }
          }
          break;
      }
    }
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
            var ndName = nd.body.id.name;
            var ndArrs = listArrsUsed(nd.body);
            for(n in ndArrs) { usedArrs.push(ndArrs[n] + " <= Function " + ndName + "()"); }
          }
          break;
      }
    }
    return usedArrs;
  } 



/**********************************************************/
/* 3. Style Grading for Declaration and Use of Object     */
/*    a. numDecObjs(ast)                                  */
/*    b. listDecObjs(ast)                                 */
/*    c. numUndecObjs(ast)                                */
/*    d. listUndecObjs(ast)                               */
/*    e. numObjsUsed(ast)                                 */
/*    f. listObjsUsed(ast)                                */
/*    g. isAnyFuncReturnObj(ast)                          */
/**********************************************************/

//------------------------------------------------------------------------
// 3-a. calculate total number of declared objects in a program
//      ex: 
//          var car = {name:"Tom", age:20};
//          var obj = new Object();
//          
//      the followings do not count as objects:
//          var x = new String();       
//          var y = new Number();    
//          var z = new Boolean(); 
//------------------------------------------------------------------------  
  function numDecObjs(ast) {
    return listDecObjs(ast).length;  
  } 


//------------------------------------------------------------------------
// 3-b. list all declared objects in a program
//      ex: 
//          var car = {name:"Tom", age:20};
//          var obj = new Object();
//          
//      the followings do not count as objects:
//          var x = new String();       
//          var y = new Number();    
//          var z = new Boolean(); 
//------------------------------------------------------------------------  
  function listDecObjs(ast) {
    var arr = [];
    var nd, m, n;
    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":
          decs = nd.declarations;

          for(n in decs) {
            if(decs[n].init != null) {
              if(decs[n].init.type=="ObjectExpression") { 
                arr.push(decs[n].id.name); 
              }
              else if(decs[n].init.type=="NewExpression" && 
                decs[n].init.callee.name == "Object") {
               arr.push(decs[n].id.name); 
             }
            }
          } 
          break;
        case "ForStatement":
          var floop = "for loop";

          // check var in loop body
          if(nd.body.body.length > 0) { 
            var lpObjs = listDecObjs(nd.body);
            for(n in lpObjs) { arr.push(lpObjs[n] + " <= " + floop); }
          }
          break;
        case "WhileStatement":
          var wloop = "while loop";

          if(nd.body.body.length > 0) { 
            var wpObjs = listDecObjs(nd.body);
            for(n in wpObjs) { arr.push(wpObjs[n] + " <= " + wloop); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName = nd.body.id.name;
            var ndObjs = listDecObjs(nd.body);
            for(n in ndObjs) { arr.push(ndObjs[n] + " <= Function " + ndName + "()"); }
          }
          break;
      }
    }
    return arr;   
  } 


//------------------------------------------------------------------------
// 3-c. calculate total number of undeclared objects 
//      that get used in a program
//      ex:
//        (undeclared obj) objName.methodName() ==> car.name() 
//        (undeclared a)   a = { name: "A", age:20 }
//------------------------------------------------------------------------  
  function numUndecObjs(ast) {
    return 0;
  } 


//------------------------------------------------------------------------
// 3-d. list all undeclared objects that get used in a program
//      that get used in a program
//      ex:
//        (undeclared obj) objName.methodName() ==> car.name() 
//        (undeclared a)   a = { name: "A", age:20 }
//------------------------------------------------------------------------  
  function listUndecObjs(ast) {
    return [];
  } 


//------------------------------------------------------------------------
// 3-e. calculate total number of objects that are used in a program
//      ex:
//        objName.methodName() ==> car.name() 
//        a = { name: "A", age:20 }
//------------------------------------------------------------------------  
  function numObjsUsed(ast) {
    return 0;
  } 


//------------------------------------------------------------------------
// 3-f. list all objecs that are used in a program
//      ex:
//        a = { name: "A", age:20 }
//------------------------------------------------------------------------  
  function listObjsUsed(ast) {
    return [];
  } 

//------------------------------------------------------------------------
// 3-g. identify if any function returns an object in a program
//      ex:
//        function foo() {
//          var ob = { a:3, b:5 };
//          return ob;
//        }
//
//        function foo() {
//          return { a:3, b:5 }; 
//        }
//------------------------------------------------------------------------  
  function isAnyFuncReturnObj(ast) {
    var nd;
    for(m in ast.body) {
      nd = ast.body[m];

      if(nd.type=="FunctionDeclaration") {
        var rtnBlk  = nd.body[nd.body.length-1];

        if(rtnBlk.type=="ReturnStatement") {
          var list = listObjsInAFunc(nd.body);

          switch(rtnBlk.argument.type) {
            case "Identifier":
              if(typeof list.has(rtnBlk.argument.name) != undefined) {
                return true;
              }
              break;
            case "ObjectExpression":
                return true;
              break;
          }
        }
      }
    }
    return false;
  } 

  function listObjsInAFunc(nd) {
    var list = new Set();
    var snd, decs;
    for(m in nd.body) {
      snd = nd.body[m];

      if(snd.type=="VariableDeclaration") {
        for(n in snd.declarations) {
          decs = snd.declarations[n];

          if(decs.init.type=="ObjectExpression") {
            list.add(decs.id.name);
          }
        }
      }
    }

    return list;
  }





/**********************************************************/
/* 4. Style Grading for Use of While Loop                 */
/*    a. numGloLevWhileLoops(ast)                         */
/*    b. numLocLevWhileLoops(ast)                         */
/*    c. numWhileLoopsInAProgram(ast)                     */
/**********************************************************/

//------------------------------------------------------------------------
// 4-a. calculate total number of while loops in global level
//------------------------------------------------------------------------  
  function numGloLevWhileLoops(ast) {
    console.log("global while loop: " + numWhileLoops(ast));
    return numWhileLoops(ast);
  }

//------------------------------------------------------------------------
// 4-b. calculate total number of while loops in functions (local level)
//------------------------------------------------------------------------  
  function numLocLevWhileLoops(ast) {
    var count = 0;
    var nd;
    for (var m=0; m<ast.body.length; m++) {
      nd = ast.body[m];
      count = (nd.type=="WhileStatement") ? count+numWhileLoops(nd.body):count;
    }

    console.log("while loop in functions: " + count);

    return count;
  }

//------------------------------------------------------------------------
// 4-c. calculate total number of while loops in a program
//      1. global level while loops: unnested and nested
//      2. local level while loops: unnested and nested
//------------------------------------------------------------------------  
  function numWhileLoopsInAProgram(ast) {

    console.log("global while loop: " + (numLocLevWhileLoops(ast)+numLocLevWhileLoops(ast));

    return numLocLevWhileLoops(ast)+numLocLevWhileLoops(ast);
  }

//------------------------------------------------------------------------
// calculate total number of while loops in a calling scope
//------------------------------------------------------------------------  
  function numWhileLoops(nd) {
    var count = 0;
    var snd;
    for(var m=0; m<nd.body.length; m++) {
      snd = nd.body[m];
      count = (snd.type=="WhileStatement") ? numWhileLoops(snd.body)+1:count;
    } 

    return count;
  }

//------------------------------------------------------------------------
// calculate total number of nested while loops in a calling scope
//------------------------------------------------------------------------  
  function numNestedWhileLoops(nd) {
    var count = 0;
    var snd;
    for(var m=0; m<nd.body.length; m++) {
      snd = nd.body[m];
      count = (snd.type=="WhileStatement" && numWhileLoops(snd.body)>0) ? count+1:count;
    }
    return count;
  }



/**********************************************************/
/* 5. Style Grading for Use of For Loop                   */
/*    a. numGlobalForLoops(ast)                           */
/*    b. numForLoopsInAllFunctions(ast)                   */
/*    c. numForLoopsInAProgram(ast)                       */
/**********************************************************/

//------------------------------------------------------------------------
// 5-a. calculate total number of for loops in global level
//------------------------------------------------------------------------  
  function numGlobalForLoops(ast) {
    return numForLoops(ast);
  }

//------------------------------------------------------------------------
// 5-b. calculate total number of for loops in functions (local level)
//------------------------------------------------------------------------  
  function numForLoopsInAllFunctions(ast) {
    var count = 0;
    var nst = ast.body.length;
    var nd;
    for (var m=0; m<nst; m++) {
      nd = ast.body[m];
      count = (nd.type=="FunctionDeclaration") ? count+numForLoops(nd.body):count;
    }
    return count;
  }

//------------------------------------------------------------------------
// 5-c. calculate total number of for loops in a program
//      1. global level for loops: unnested and nested
//      2. local level for loops: unnested and nested
//------------------------------------------------------------------------  
  function numForLoopsInAProgram(ast) {
    return numGlobalForLoops(ast)+numForLoopsInAllFunctions(ast);
  }

//------------------------------------------------------------------------
// calculate total number of for loops in a calling scope
//------------------------------------------------------------------------  
  function numForLoops(nd) {
    var count = 0;
    var snd;
    for(var m=0; m<nd.body.length; m++) {
      snd = nd.body[m];
      count = (snd.type=="ForStatement") ? numForLoops(snd.body)+1:count;
    } 

    console.log("for loop: " + count);
    return count;
  }

//------------------------------------------------------------------------
// calculate total number of nested for loops in a calling scope
//------------------------------------------------------------------------  
  function numNestedForLoops(nd) {
    var count = 0;
    var snd;
    for(var m=0; m<nd.body.length; m++) {
      snd = nd.body[m];
      count = (snd.type=="ForStatement" && numForLoops(snd.body)>0) ? count+1:count;
    }
    return count;
  }




/* 6. */
//------------------------------------------------------------------------
// calculate declared function in global level:
//  1. function a() {}
//  2. var a = function() {}
//------------------------------------------------------------------------
  function numGlobalFuncDecls(ast) {
    var count = 0;
    var nd;
    for(var m=0; m<ast.body.length; m++) {
      nd = ast.body[m];
      switch(nd.type) {
        case "FunctionDeclaration":
          count++;
          break;
        case "VariableDeclaration":
          var decs = nd.declarations;
          for(var m=0; m<decs.length; m++) {
            count = (decs[m].init.type=="FunctionExpression") ? count+1:count;
          }
          break;
      }
    }
    return count;
  }




  function isAFuncCallToGloFunc(ast) {
    var check = false;
    for(var m=0; m<ast.body.length; m++) {
      var nd = ast.body[m];
      check  = isFuncCall(nd);
    }
    return check;
  }

  function isLocLelFuncCall(ast) {

  }

  function isAFuncCall (nd) { 
    switch (nd.type) {
      case "ExpressionStatement":
        if (nd.expression.type=="CallExpression") return true;
        if (nd.expression.type=="AssignmentExpression") {
  	     if (nd.expression.right.type=="CallExpression") return true;
        }
        break;
      case "VariableDeclaration":
        if (nd.declarations[0].init.type=="CallExpression") return true;
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
            }

            numFuncDecls++;
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
        } 
      } 

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
      if(func.type=="ExpressionStatement"   &&
          func.expression.arguments!=null   &&
          func.expression.arguments.name!=null) {
        return true; 
      }
    }

    return false;
  }


//------------------------------------------------------------------------
// calculate the number of valid global objects declaration
//------------------------------------------------------------------------
  function numGlobalVariableDeclared(ast) {
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
    var gbObjs          = new Set();
    var funcObjs        = [];
    var numTopLevelNode = ast.body.length;
    var func;

    for(var i=0; i<numTopLevelNode; i++) {
      func = ast.body[i];
      switch(func.type) {
        case "VariableDeclaration":   // calculate for the num of global objects declared in functions
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


//------------------------------------------------------------------------
// HashMap:
//  1. setItem(key, value) ==> map a new key to a value in the map
//  2. getItem(key)        ==> retrieve a value of a key
//  3. hasItem(key)        ==> check if a key is in the dic or not
//  4. removeItem(key)     ==> remove a key with its associative value
//  5. keys()              ==> a list of all keys in the map
//  6. values()            ==> a list of all values in the map
//  7. clear()             ==> clear the map
//------------------------------------------------------------------------
  function HashMap(obj) {
      this.length = 0;
      this.items = {};

      for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
          this.items[p] = obj[p];
          this.length++;
        }
      }

      this.setItem = function(key, value) {
        var previous = undefined;
        if (this.hasItem(key)) {
          previous = this.items[key];
        } else {
          this.length++;
        }
        this.items[key] = value;
        return previous;
      }

      this.getItem = function(key) {
        return this.hasItem(key) ? this.items[key] : undefined;
      }

      this.hasItem = function(key) {
        return this.items.hasOwnProperty(key);
      }
     
      this.removeItem = function(key) {
        if (this.hasItem(key)) {
          previous = this.items[key];
          this.length--;
          delete this.items[key];
          return previous;
        } else {
          return undefined;
        }
      }

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
          if (this.hasItem(k)) {
            values.push(this.items[k]);
          }
        }
        return values;
      }

      this.clear = function() {
        this.items = {}
        this.length = 0;
      }
  }
        




// all functions have been declared local to this anonymous function
// now put them all into an object as methods and send that object back

  return {
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

})  // end anonymous function declaration 
(); // now run it to create and return the object with all the methods
