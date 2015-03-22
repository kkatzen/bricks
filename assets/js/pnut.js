

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

    /* 1. Style Grading for Declaration and Use of Variable   */
    dObj.nDV      = numDecVars(ast);
    dObj.lDV      = listDecVars(ast);
    dObj.nUDV     = numUndecVars(ast);
    dObj.lUDV     = listUndecVars(ast);
    dObj.lVU      = listVarsUsed(ast);
    dObj.isFV     = isAnyFuncVars(ast);
    dObj.lFV      = listFuncVars(ast);

    /* 2. Style Grading for Declaration and Use of Array      */
    dObj.nDA      = numDecArrs(ast);
    dObj.lDA      = listDecArrs(ast);
    dObj.nUDA     = numUndecArrs(ast);
    dObj.lUDA     = listUndecArrs(ast);
    dObj.nAU      = numArrsUsed(ast);
    dObj.lAU      = listArrsUsed(ast);

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



//------------------------------------------------------------------------
//   style grading parser:
//    
//------------------------------------------------------------------------
  function styleGrading(ast) {

  }



/**********************************************************/
/* 1. Style Grading for Declaration and Use of Variable   */
/*    a. numDecVars(ast)      ==> integer >= 0            */
/*    b. listDecVars(ast)     ==> [ string ]              */
/*    c. numUndecVars(ast)    ==> integer >= 0            */
/*    d. listUndecVars(ast)   ==> [ string ]              */
/*    e. listVarsUsed(ast)    ==> [ string ]              */
/*    f. isAnyFuncVars(ast)   ==> boolean ? true:false    */
/*    g. listFuncVars(ast)    ==> [ string]               */
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

//------------------------------------------------------------------------
// 1-f. exam if any function gets assigned to a variable in global level
//      ex: function bar() { }
//          var f2 = bar;
//------------------------------------------------------------------------
  function isAnyFuncVar(ast) {
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
              if(typeof(funcs.has(subnode[n].init.name)) != undefined &&
                typeof(used.has(subnode[n].init.name)) != undefined )) {
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
            if(typeof(funcs.has(exp.right.name)) != undefined &&
              typeof(used.has(exp.left.name)) != undefined )) {
              used.add(exp.left.name);
              arr.push(exp.left.name);
            }                    
          }
          break;
      }
    }
    return arr;
  }




/**********************************************************/
/* 2. Style Grading for Declaration and Use of Array      */
/*    a. numDecArrs(ast)      ==> integer >= 0            */
/*    b. listDecArrs(ast)     ==> [ string ]              */
/*    c. numUndecArrs(ast)    ==> integer >= 0            */
/*    d. listUndecArrs(ast)   ==> [ string ]              */
/*    e. numArrsUsed(ast)     ==> integer >= 0            */
/*    f. listArrsUsed(ast)    ==> [ string ]              */
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
/*    a. numDecObjs(ast)         ==> integer >= 0         */
/*    b. listDecObjs(ast)        ==> [ string ]           */
/*    c. numUndecObjs(ast)       ==> integer >= 0         */
/*    d. listUndecObjs(ast)      ==> [ string ]           */
/*    e. numObjsUsed(ast)        ==> integer >= 0         */
/*    f. listObjsUsed(ast)       ==> [ string ]           */
/*    g. isAnyFuncReturnObj(ast) ==> boolean ? true:false */
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

//------------------------------------------------------------------------
// private function:
// list all declared objects in a function   
//------------------------------------------------------------------------  
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
// private function:
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
// private function:
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
/*    a. numGloLevForLoops(ast)       ==> integer >= 0    */
/*    b. numLocLevForLoops(ast)       ==> integer >= 0    */
/*    c. numForLoopsInAProgram(ast)   ==> integer >= 0    */
/**********************************************************/

//------------------------------------------------------------------------
// 5-a. calculate total number of for loops in global level
//------------------------------------------------------------------------  
  function numGloLevForLoops(ast) {
    return numForLoops(ast);
  }

//------------------------------------------------------------------------
// 5-b. calculate total number of for loops in functions (local level)
//------------------------------------------------------------------------  
  function numLocLevForLoops(ast) {
    var count = 0;
    var nd;
    for (var m in ast.body) {
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
// private function:
// calculate total number of for loops in a calling scope
//------------------------------------------------------------------------  
  function numForLoops(nd) {
    var count = 0;
    var snd;
    for(var m in nd.body) {
      snd = nd.body[m];
      count = (snd.type=="ForStatement") ? numForLoops(snd.body)+1:count;
    } 

    console.log("for loop: " + count);
    return count;
  }

//------------------------------------------------------------------------
// private function:
// calculate total number of nested for loops in a calling scope
//------------------------------------------------------------------------  
  function numNestedForLoops(nd) {
    var count = 0;
    var snd;
    for(var m in nd.body) {
      snd = nd.body[m];
      count = (snd.type=="ForStatement" && numForLoops(snd.body)>0) ? count+1:count;
    }
    return count;
  }




/******************************************************************/
/* 6. Style Grading for Declaration and Use of Function           */
/*    a. numDecFuncs(ast)               ==> integer >= 0          */
/*    b. numForLoopsInAllFunctions(ast) ==> integer >= 0          */
/*    c. numForLoopsInAProgram(ast)     ==> integer >= 0          */
/*    d. listInvalidFuncCallExps(ast)   ==> [ string ]            */
/*    e. areDecFuncsCalled(ast)         ==> boolean ? true:false  */
/*    f. areDecFuncsCalledOnce(ast)     ==> boolean ? true:false  */
/*    g. isAFuncPassedByReference(ast)  ==> boolean ? true:false  */
/******************************************************************/

//------------------------------------------------------------------------
// 6-a. calculate the number of declared functions in global level:
//      ex:
//        function a() {}
//        var a = function() {}
//------------------------------------------------------------------------
  function numDecFuncs(ast) {
    return listDecFunc(ast).length;
  }

//------------------------------------------------------------------------
// 6-b. list all declared functions in global level with occuring number:
//      ex:
//        function a() {}
//        function b(x) {}
//        function b(x, y) {}
//        var a = function() {}
//------------------------------------------------------------------------
  function listDecFuncs(ast) {
    return DictDecFuncs(ast).keys; 
  }

//------------------------------------------------------------------------
// private method:
// create a dictionary to map funcionts with their occurrence order.
//------------------------------------------------------------------------
  function DictDecFuncs(ast) {
    var dict  = new HashMap();
    var index = 0;
    var nd, name;
    for(var m in ast.body) {
      nd = ast.body[m];
      switch(nd.type) {
        case "FunctionDeclaration":
          if(nd.params.length<2) {
            name = "Function " + nd.id.name + " ("+ nd.params.length+" param)";
          } else {
            name = "Function " + nd.id.name + " ("+ nd.params.length+" params)";
          }
          dict.setItem(name, index);
          index += 1;
          break;
        case "VariableDeclaration":
          var decs = nd.declarations;
          for(var n in decs) {
            if(decs[n].init.type=="FunctionExpression") {
              name = "Function Variable "+ decs[n].id.name;
              dict.setItem(name, index);
              index += 1;
            }
          }
          break;
      }
    }
    return dict;  
  }


//------------------------------------------------------------------------
// 6-c. exam call expressions that all call declared functions in which 
//      functions are declared on the top of call expressions.
//      ex:
//        CORRECT: function myMain() { return 5; }
//                 myMain();
//        WRONG:   1. function myMain() { return 5; }
//                    foo();
//                 2. foo()
//                    function foo() { return 5; }
//------------------------------------------------------------------------
  function areCallExpsAllValid(ast) {
    var check = false;
    var nd;
    for(var m in ast.body) {
      nd = ast.body[m];
      check  = isFuncCall(nd);
    }
    return check;
  }


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
    }
    return false; 
  }

//------------------------------------------------------------------------
// 6-d. list invalid function call expressions in which a call expression calls 
//      an undeclared function
//      ex:
//        CORRECT: function myMain() { return 5; }
//                 myMain();
//        WRONG:   1. function myMain() { return 5; }
//                    foo();
//                 2. foo()
//                    function foo() { return 5; }
//------------------------------------------------------------------------
  function listInvalidFuncCallExps(ast) {
    var dict = DictDecFuncs(ast);
    var list = [];
    var node;
    for(m in ast.body) {
      node = ast.body[m];

      if(node.type=="ExpressionStatement"       && 
        node.expression.type=="CallExpression"  &&
        node.expression.callee.type=="Identifier") {
        var name = node.expression.callee.name;
        var argnum = node.expression.arguments;
        var func1;
        var func2 = "Function Variable "+ name;

        if(argnum<2) {
          func1 = "Function " + name + " (" + argnum+ " param)";
        } else {
          func1 = "Function " + name + " (" + argnum+ " params)";
        }


        if(!dict.hasItem(func1) && !dict.hasItem(func2)) {
          list.push(func1);
        }
      }
    }
    return list;
  }

//------------------------------------------------------------------------
// 6-e. exam all declared functions get called in a program
//      * the number that a function gets called is regardless
//      ex: function bar() { return 5; }
//          function foo() { return 5; }
//          bar(); bar();
//          foo(); foo();
//------------------------------------------------------------------------
  function areDecFuncsCalled(ast) {

  }


//------------------------------------------------------------------------
// 6-f. exam all declared functions get called exactly once in a program
//      ex: function bar() { return 5; }
//          function foo() { return 5; }
//          bar();
//          foo();
//------------------------------------------------------------------------
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
  }



//------------------------------------------------------------------------
// 6-g. exam if any function is a pass-by-reference function or not
//      ex: CORRECT: function bar(x) { return x; }
//          WRONG:   funciton bar()  { return 5; }
//------------------------------------------------------------------------
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

    return false;
  }


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
          }
        }
      }
    }
    return false;
  }


//------------------------------------------------------------------------------
// private function:
// check a funciton's returnstatement if it is a call of the function or not
//------------------------------------------------------------------------------
  function recursionDetector(nd, funcName) {
    if(nd.type=="Identifier") { return false; }
    else if(nd.type=="Literal") { return false; }
    else if(nd.type=="CallExpression") { return nd.callee.name==funcName; }

    return recursionDetector(nd.left, funcName)||recursionDetector(nd.right, funcName);
  }



//------------------------------------------------------------------------
// private function:
//  HashMap:
//    1. setItem(key, value) ==> map a new key to a value in the map
//    2. getItem(key)        ==> retrieve a value of a key
//    3. hasItem(key)        ==> check if a key is in the dic or not
//    4. removeItem(key)     ==> remove a key with its associative value
//    5. keys()              ==> a list of all keys in the map
//    6. values()            ==> a list of all values in the map
//    7. clear()             ==> clear the map
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
        if (this.hasItem(key)) { previous = this.items[key];
        } else { this.length++; }

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
          if (this.hasItem(k)) { values.push(this.items[k]); }
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
    numForLoopsInAProgram   : numForLoopsInAProgram

  }

})  // end anonymous function declaration 
(); // now run it to create and return the object with all the methods
