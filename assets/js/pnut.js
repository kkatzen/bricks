

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

  function collectStructureStyleFacts(ast) {
    var dObj      = {};

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

/******************************************************************/
/* 3. Style Grading for Declaration and Use of Object             */
/*    a. numDecObjs(ast)                 ==> integer >= 0         */
/*    b. listDecObjs(ast)                ==> [ string ]           */
/*    c. numUndecObjs(ast)               ==> integer >= 0         */
/*    d. listUndecObjs(ast)              ==> [ string ]           */
/*    e. numObjsUsed(ast)                ==> integer >= 0         */
/*    f. listObjsUsed(ast)               ==> [ string ]           */
/*    g. isAnyFuncBoundToAFuncRtnObj(ast)==> boolean ? true:false */
/******************************************************************/    
    dObj.nDO      = numDecObjs(ast);
    dObj.lDO      = listDecObjs(ast);
    dObj.nUDO     = numUndecObjs(ast);
    dObj.lUDO     = listUndecObjs(ast);
    dObj.nOU      = numObjsUsed(ast);
    dObj.lOU      = listObjsUsed(ast);
    dObj.isFBAFRO = isAnyFuncBoundToAFuncRtnObj(ast);

/******************************************************************/
/* 4. Style Grading for Use of While Loop                         */
/*    a. numWhileLoopsInGloLev(ast)       ==> integer >= 0        */
/*    b. numNestedWhileLoopsInGloLev(ast) ==> integer >= 0        */
/*    c. numWhileLoopsInFuncs(ast)        ==> integer >= 0        */
/*    d. numNestedWhileLoopsInFuncs(ast)  ==> integer >= 0        */
/*    e. numWhileLoopsInAProgram(ast)     ==> integer >= 0        */
/******************************************************************/
    dObj.nWLGL    = numWhileLoopsInGloLev(ast);
    dObj.nNWLGL   = numNestedWhileLoopsInGloLev(ast);
    dObj.nWLF     = numWhileLoopsInFuncs(ast);
    dObj.nNWLF    = numNestedWhileLoopsInFuncs(ast);
    dObj.nWLAP    = numWhileLoopsInAProgram(ast);


/******************************************************************/
/* 5. Style Grading for Use of For Loop                           */
/*    a. numForLoopsInGloLev(ast)         ==> integer >= 0        */
/*    b. numNestedForLoopsInGloLev(ast)   ==> integer >= 0        */
/*    c. numForLoopsInFuncs(ast)          ==> integer >= 0        */
/*    d. numNestedForLoopsInFuncs(ast)    ==> integer >= 0        */
/*    e. numForLoopsInAProgram(ast)       ==> integer >= 0        */
/******************************************************************/    
    dObj.nFLGL    = numForLoopsInGloLev(ast);
    dObj.nNFLGL   = numNestedForLoopsInGloLev(ast);
    dObj.nFLF     = numForLoopsInFuncs(ast);
    dObj.nNFLF    = numNestedForLoopsInFuncs(ast);
    dObj.nFLAP    = numForLoopsInAProgram(ast);


/******************************************************************/
/* 7. Style Grading for Recursive Function                        */
/*    a. isRecuriveFunction(ast)  ==> boolean ? true:false        */
/******************************************************************/   
    dObj.isRF      = isRecuriveFunction(ast);


    return dObj;
  }





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
//      ex: function bar() {
//            var d = 0;
//    
//            for(var i=0; i<10; i++) {
//              while(d==0) {
//                var d=1;
//              }
//            }
//          }
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
          if(nd.init != null && nd.init.type=="VariableDeclaration") {
           arr.push(nd.init.declarations[0].id.name + " <= " + floop); 
          }

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
      if(map.getItem(usedVars[m]) == undefined) {
        arr.push(usedVars[m]);
      }
    }

    // console.log("ListUndecVars: "+arr);
    return arr;
  } 


//------------------------------------------------------------------------
// 1-e. list all variables that are used in a program
//      ex. (array) arr.push(val)
//          alert(val)
//          var num = val + 1
//          num = val + 1
//------------------------------------------------------------------------ 
  function listVarsUsed(ast) {
    var count      = 0;
    var usedVars = [];
    var nd, m, args, cal;
    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":
          decs = nd.declarations;

          for(d in decs) {
            if(decs[d].init!=null && decs[d].init.type=="Identifier") {
              usedVars.push(decs[d].init.name);
            }
            else if(decs[d].init!=null && decs[d].init.type=="BinaryExpression") {
              usedVars = usedVars.concat(listOperatorVars(decs[d].init.left));
              usedVars = usedVars.concat(listOperatorVars(decs[d].init.right));
            }
          }
          break;
        case "ExpressionStatement":
          exp = nd.expression;

          switch(exp.type) {
            case "UpdateExpression":
              usedVars.push(exp.argument.name);
              break;
            case "AssignmentExpression":
              usedVars = usedVars.concat(listOperatorVars(exp.left));
              usedVars = usedVars.concat(listOperatorVars(exp.right));
              break;
            case "CallExpression":
              cal = exp.callee;

              // check for passing arguments in call functions
              if(cal.type=="Identifier") {
                args = exp.arguments;

                if(args.length>0) {
                  for(n in args) {
                    if(args[n].type=="Identifier") {
                      usedVars.push(args[n].name);
                    }
                  }
                }
              }
              else if(cal.type=="MemberExpression") {
                args = exp.arguments;

                // check for objects that calls their property functions
                if(cal.object=="Identifier") {
                  usedVars.push(cal.object.name);
                }

                // check for passing arguments in call functions
                if(args.length>0) {
                  for(n in args) {
                    if(args[n].type=="Identifier") {
                      usedVars.push(args[n].name);
                    }
                  }
                }
              }
              break;
          }
          break;
        case "ForStatement":
          var floop = "for loop";

          /* check var in loop initilization */

          if(nd.init != null && nd.init.type=="AssignmentExpression") { 
            var left  = listOperatorVars(nd.init.left);
            var right = listOperatorVars(nd.init.right);

            for(n in left)  { usedVars.push(left  + " <= " + floop); }
            for(n in right) { usedVars.push(right + " <= " + floop); }
          }
          else if(nd.init != null && nd.init.type=="VariableDeclaration") { 
            // left-hand side var declaration
            usedVars.push(nd.init.declarations[0].id.name + " <= " + floop);

            // right-hand side possilble var assignment
            if(nd.init.declarations[0].init.type=="BinaryExpression") {
              var left  = listOperatorVars(nd.init.declarations[0].init.left);
              var right = listOperatorVars(nd.init.declarations[0].init.right);

              for(n in left)  { usedVars.push(left  + " <= " + floop); }
              for(n in right) { usedVars.push(right + " <= " + floop); }
            }
          } else {
            // check vars in loop body
            if(nd.body.body.length > 0) { 
              var lpVars = listVarsUsed(nd.body);
              for(n in lpVars) { usedVars.push(lpVars[n] + " <= " + floop); }
            }
          }
          break;
        case "WhileStatement":
          /* skip conditional vars in while test bracket */

          // check vars in loop body
          var wloop = "while loop";
          if(nd.body.body.length > 0) { 
            var wpVars = listVarsUsed(nd.body);
            for(n in wpVars) { usedVars.push(wpVars[n] + " <= " + wloop); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName = nd.id.name;
            var ndVars = listVarsUsed(nd.body);
            for(n in ndVars) { usedVars.push(ndVars[n] + " <= Function " + ndName + "()"); }
          }
          break;
      }
    }
    // console.log("ListVarsUsed:" +usedVars);
    return usedVars;
  } 

//------------------------------------------------------------------------
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
              if(!func.has(subnode[n].init.name) && !used.has(subnode[n].init.name)){
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
            if(!func.has(exp.right.name) && !used.has(exp.left.name)) { 
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





/******************************************************************/
/* 2. Style Grading for Declaration and Use of Array              */
/*    a. numDecArrs(ast)      ==> integer >= 0                    */
/*    b. listDecArrs(ast)     ==> [ string ]                      */
/*    c. numUndecArrs(ast)    ==> integer >= 0                    */
/*    d. listUndecArrs(ast)   ==> [ string ]                      */
/*    e. numArrsUsed(ast)     ==> integer >= 0                    */
/*    f. listArrsUsed(ast)    ==> [ string ]                      */
/******************************************************************/

//------------------------------------------------------------------------
// 2-a. calculate total number of declared arrays in a program
//      ex: 
//          var a, e=[], f="empty";
//          var b = [one, two, three];
//          var c = new Array();
//------------------------------------------------------------------------  
  function numDecArrs(ast) {
    // console.log("numDecArrs: " + listDecArrs(ast).length);
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
    // console.log("listDecArrs: " + arr);
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
    // console.log("numUndecArrs: " + listUndecArrs(ast).length);
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
      if(map.getItem(usedArrs[m]) == undefined) {
        arr.push(usedArrs[m]);
      }
    }
    // console.log("listUndecArrs: " + arr);
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
    // console.log("numArrsUsed: " + arr.size);
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
              if(exp.callee.type=="MemberExpression") {
                method = exp.callee.property.name;

                if(method=="push" || method=="sort"  || method=="join" || method=="valueOf" ||
                   method=="pop"  || method=="shift" || method=="unshift") {
                  usedArrs.push(exp.callee.object.name);
                } 
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
    // console.log("listArrsUsed: " + usedArrs);
    return usedArrs;
  } 


/******************************************************************/
/* 3. Style Grading for Declaration and Use of Object             */
/*    a. numDecObjs(ast)                 ==> integer >= 0         */
/*    b. listDecObjs(ast)                ==> [ string ]           */
/*    c. numUndecObjs(ast)               ==> integer >= 0         */
/*    d. listUndecObjs(ast)              ==> [ string ]           */
/*    e. numObjsUsed(ast)                ==> integer >= 0         */
/*    f. listObjsUsed(ast)               ==> [ string ]           */
/*    g. isAnyFuncBoundToAFuncRtnObj(ast)==> boolean ? true:false */
/******************************************************************/

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
    // console.log("numDecObjs: "+ listDecObjs(ast).length);
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
            var ndName = nd.id.name;
            var ndObjs = listDecObjs(nd.body);
            for(n in ndObjs) { arr.push(ndObjs[n] + " <= Function " + ndName + "()"); }
          }
          break;
      }
    }
    // console.log("listDecObjs: "+ arr);
    // console.log("isAnyFuncBoundToAFuncRtnObj: " + isAnyFuncBoundToAFuncRtnObj(ast));
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
// 3-g. identify if any function return object is bound to a function
//      ex:
//        function foo() {
//          var ob = {
//            someField: 5,
//            someFn : function () {}
//          };
//          return ob;
//        }
//
//        OR
//
//        function foo() {
//          function inner() {}
//
//          var ob = {
//            someFn : inner,
//            someField: 5
//          };
//          return ob;
//        }
//------------------------------------------------------------------------  
  function isAnyFuncBoundToAFuncRtnObj(ast) {
    var list  = [];
    var nd, bodys, decs, props, funcs, funcObjs;

    for(m in ast.body) {
      nd = ast.body[m];

      if(nd.type=="FunctionDeclaration") {
        bodys    = nd.body.body;
        funcs    = new Set();
        funcObjs = new Set();

        for(n in bodys) {
          switch(bodys[n]) {
            case "FunctionDeclaration":
              funcs.add(bodys[n].id.name);
              break;
            case "VariableDeclaration":
              decs = bodys[n].declarations;

              for(d in decs) {
                if(decs[d].init!=null && decs[d].init.type=="ObjectExpression") {
                  props = decs[d].init.properties;

                  for(p in props) {
                    if(props[p].value.type=="FunctionExpression") {
                      funcObj.add(decs[d].id.name);
                    }
                    else if(props[p].value.type=="Identifier") {
                      if(funcs.has(props[p].value.name)) {
                        funcObj.add(decs[d].id.name);
                      }
                    }
                  }
                }
              }
              break;
            case "ReturnStatement":
              if(bodys[n].argument.type=="Identifier" && 
                funcObjs.has(bodys[n].argument.name)) {
                return true;
              }
              break;
          }
        }
      }
    }

    return false;
  }


//------------------------------------------------------------------------
// private function:
// list all declared functions in a function   
//------------------------------------------------------------------------  
  function setFuncsInAFunc(nd) {
    var s = new Set();
    var snd;
    for(m in nd.body) {
      snd = nd.body[m];

      if(snd.type=="FunctionDeclaration") {
        s.add(snd.id.name);
      }
    }

    return s;
  }

//------------------------------------------------------------------------
// private function:
// list all declared objects in a function   
//------------------------------------------------------------------------  
  function setObjsInAFunc(nd) {
    var s = new Set();
    var snd, decs;
    for(m in nd.body) {
      snd = nd.body[m];

      if(snd.type=="VariableDeclaration") {
        for(n in snd.declarations) {
          decs = snd.declarations[n];

          if(decs.init.type=="ObjectExpression") {
            s.add(decs.id.name);
          }
        }
      }
    }

    return s;
  }



/******************************************************************/
/* 4. Style Grading for Use of While Loop                         */
/*    a. numWhileLoopsInGloLev(ast)       ==> integer >= 0        */
/*    b. numNestedWhileLoopsInGloLev(ast) ==> integer >= 0        */
/*    c. numWhileLoopsInFuncs(ast)        ==> integer >= 0        */
/*    d. numNestedWhileLoopsInFuncs(ast)  ==> integer >= 0        */
/*    e. numWhileLoopsInAProgram(ast)     ==> integer >= 0        */
/******************************************************************/    

//------------------------------------------------------------------------
// 4-a. calculate total number of while loops in global level
//      ex.
//         var a = 0;
//         while(a<2) {
//           while(a<a) {
//             alert(a;)
//           }
//           alert(a);
//           a++;
//         }
//
//         while(a<2) {
//           alert(a);
//           a++;
//        }
//------------------------------------------------------------------------  
  function numWhileLoopsInGloLev(ast) {
    // console.log("numGloLevWhileLoops: " + numWhileLoops(ast));
    return numWhileLoops(ast);
  }


//------------------------------------------------------------------------
// 4-b. calculate total number of nested while loops in global level
//      ex.
//         var a = 0;
//         while(a<2) {
//           while(a<a) {
//             alert(a);
//           }
//           alert(a);
//           a++;
//         }
//
//         while(a<2) {
//           alert(a);
//           a++;
//        }
//------------------------------------------------------------------------  
  function numNestedWhileLoopsInGloLev(ast) {
    var count = 0;
    var nd;
    for(m in ast.body) {
      nd = ast.body[m];

      count = (nd.type=="WhileStatement" && numWhileLoops(nd.body)>0) ? count+1:count;
    }
    // console.log("numGloLevNestedWhileLoops: " + count);
    return count;
  }


//------------------------------------------------------------------------
// 4-c. calculate total number of while loops in functions (local level)
//      ex.
//          function bar(){
//            var a = 0;
//            while(a<2) {
//              while(a<a) {
//                alert(a);
//              }
//              alert(a);
//              a++;
//            }
//            while(a<2) {
//              alert(a);
//              a++;
//            }
//          }
//------------------------------------------------------------------------  
  function numWhileLoopsInFuncs(ast) {
    var count = 0;
    var nd;
    for(m in ast.body) {
      nd = ast.body[m];

      count = (nd.type=="FunctionDeclaration") ? count+numWhileLoops(nd.body):count;
    }

    // console.log("numWhileLoopsInFuncs: " + count);
    return count;
  }

//------------------------------------------------------------------------
// 4-d. calculate total number of nested while loops in functions (local)
//------------------------------------------------------------------------  
  function numNestedWhileLoopsInFuncs(ast) {
    var count = 0;
    var nd, snd;
    for(m in ast.body) {
      nd = ast.body[m];

      if(nd.type=="FunctionDeclaration") {
        for(n in nd.body.body) {
          snd = nd.body.body[n];
          count = (snd.type=="WhileStatement" && numWhileLoops(snd.body)>0) ? count+1:count;

        }
      }
    }

    // console.log("numNestedWhileLoopsInFuncs: " + count);
    return count;
  }

//------------------------------------------------------------------------
// 4-e. calculate total number of while loops in a program
//------------------------------------------------------------------------  
  function numWhileLoopsInAProgram(ast) {
    // console.log("numWhileLoopsInAProgram: " + (numWhileLoopsInGloLev(ast)+numWhileLoopsInFuncs(ast)));
    return numWhileLoopsInGloLev(ast)+numWhileLoopsInFuncs(ast);
  }

//------------------------------------------------------------------------
// private function:
// calculate total number of while loops in a calling scope
//------------------------------------------------------------------------  
  function numWhileLoops(nd) {
    var count = 0;
    var snd;
    for(m in nd.body) {
      snd = nd.body[m];
      count = (snd.type=="WhileStatement") ? 1+count+numWhileLoops(snd.body):count;
    } 
    return count;
  }




/******************************************************************/
/* 5. Style Grading for Use of For Loop                           */
/*    a. numForLoopsInGloLev(ast)         ==> integer >= 0        */
/*    b. numNestedForLoopsInGloLev(ast)   ==> integer >= 0        */
/*    c. numForLoopsInFuncs(ast)          ==> integer >= 0        */
/*    d. numNestedForLoopsInFuncs(ast)    ==> integer >= 0        */
/*    e. numForLoopsInAProgram(ast)       ==> integer >= 0        */
/******************************************************************/ 

//------------------------------------------------------------------------
// 5-a. calculate total number of for loops in global level
//      ex.
//         var a = 0;
//         for(;a<2;a++) {
//           for(;a<1;a++) {
//             alert(a;)
//           }
//           alert(a);
//         }
//
//         for(;a<2;a++) {
//           alert(a);
//        }
//------------------------------------------------------------------------  
  function numForLoopsInGloLev(ast) {
    // console.log("numForLoopsInGloLev: " + numForLoops(ast));
    return numForLoops(ast);
  }


//------------------------------------------------------------------------
// 5-b. calculate total number of nested for loops in global level
//      ex.
//         var a = 0;
//         for(;a<2;a++) {
//           for(;a<1;a++) {
//             alert(a;)
//           }
//           alert(a);
//         }
//
//         for(;a<2;a++) {
//           alert(a);
//        }
//------------------------------------------------------------------------  
  function numNestedForLoopsInGloLev(ast) {
    var count = 0;
    var nd;
    for(m in ast.body) {
      nd = ast.body[m];

      count = (nd.type=="ForStatement" && numForLoops(nd.body)>0) ? count+1:count;
    }
    // console.log("numNestedForLoopsInGloLev: " + count);
    return count;
  }


//------------------------------------------------------------------------
// 5-c. calculate total number of for loops in functions (local level)
//      ex.
//          function bar(){
//            var a = 0;
//            for(;a<2;a++) {
//              for(;a<1;a++) {
//                alert(a);
//              }
//              alert(a);
//            }
//            for(;a<1; a++) {
//              alert(a);
//            }
//          }
//------------------------------------------------------------------------  
  function numForLoopsInFuncs(ast) {
    var count = 0;
    var nd;
    for(m in ast.body) {
      nd = ast.body[m];

      count = (nd.type=="FunctionDeclaration") ? count+numForLoops(nd.body):count;
    }

    // console.log("numForLoopsInFuncs: " + count);
    return count;
  }

//------------------------------------------------------------------------
// 5-d. calculate total number of nested for loops in functions (local)
//      ex.
//          function bar(){
//            var a = 0;
//            for(;a<2;a++) {
//              for(;a<1;a++) {
//                alert(a);
//              }
//              alert(a);
//            }
//            for(;a<1; a++) {
//              alert(a);
//            }
//          }
//------------------------------------------------------------------------  
  function numNestedForLoopsInFuncs(ast) {
    var count = 0;
    var nd, snd;
    for(m in ast.body) {
      nd = ast.body[m];

      if(nd.type=="FunctionDeclaration") {
        for(n in nd.body.body) {
          snd = nd.body.body[n];
          count = (snd.type=="ForStatement" && numForLoops(snd.body)>0) ? count+1:count;

        }
      }
    }

    // console.log("numNestedForLoopsInFuncs: " + count);
    return count;
  }

//------------------------------------------------------------------------
// 5-e. calculate total number of for loops in a program
//------------------------------------------------------------------------  
  function numForLoopsInAProgram(ast) {
    // console.log("numForLoopsInAProgram: " + (numForLoopsInGloLev(ast)+numForLoopsInFuncs(ast)));
    return numForLoopsInGloLev(ast)+numForLoopsInFuncs(ast);
  }

//------------------------------------------------------------------------
// private function:
// calculate total number of for loops in a calling scope
//------------------------------------------------------------------------  
  function numForLoops(nd) {
    var count = 0;
    var snd;
    for(m in nd.body) {
      snd = nd.body[m];
      count = (snd.type=="ForStatement") ? 1+count+numForLoops(snd.body):count;
    } 
    return count;
  }




/******************************************************************/
/* 6. Style Grading for Declaration and Use of Function           */
/*    a. numDecFuncs(ast)               ==> integer >= 0          */
/*    b. listDecFuncs(ast)              ==> [ string ]            */
/*    c. areCallExpsAllValid(ast)       ==> integer >= 0          */
/*    d. listInvalidFuncCallExps(ast)   ==> [ string ]            */
/*    e. areDecFuncsCalled(ast)         ==> boolean ? true:false  */
/*    f. areDecFuncsCalledOnce(ast)     ==> boolean ? true:false  */
/*    g. isAnyDecFuncPassedByRef(ast)   ==> boolean ? true:false  */
/*    h. isAnyFuncReturnObj(ast)        ==> boolean ? true:false  */
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
// 6-c. exam call expressions that all call declared functions in which 
//      functions are declared on the top of call expressions.
//      ex:
//        CORRECT: function myMain() { return 5; }
//                 myMain();
//        WRONG:   1. function myMain() { return 5; }
//                    foo();
//                 2. foo();
//                    function foo() { return 5; }
//------------------------------------------------------------------------
  function areCallExpsAllValid(ast) {
    return listInvalidFuncCallExps(ast).length>0;
  }

//------------------------------------------------------------------------
// 6-d. list invalid function call expressions in which a call expression calls 
//      an undeclared function
//      ex:
//        CORRECT: function myMain() { return 5; }
//                 myMain();
//        WRONG:   1. function myMain() { return 5; }
//                    foo();
//                 2. foo();
//                    function foo() { return 5; }
//------------------------------------------------------------------------
  function listInvalidFuncCallExps(ast) {
    var decs  = DictDecFuncs(ast);
    var calls = DictFuncCalls(ast);
    var exps  = decs.keys;
    var list  = [];

    for(m in exps) {
      if(decs.getItem(exps[m])==undefined) {
        list.push(exps[m]);
      } 
      else if(decs.getItem(exps[m])>calls.getItem(exps[m])){
        list.push(exps[m]);
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
    var dict = dictFuncsAndCallNum(ast);
    var nums = dict.values; // num of each function gets called

    for(m in nums) {
      if(nums[m]==0) {
        return false;
      }
    }

    return true;
  }


//------------------------------------------------------------------------
// 6-f. exam all declared functions get called exactly once in a program
//      ex: function bar() { return 5; }
//          function foo() { return 5; }
//          bar();
//          foo();
//------------------------------------------------------------------------
  function areDecFuncsCalledOnce(ast) {
    var dict = dictFuncsAndCallNum(ast);
    var nums = dict.values; // num of each function gets called

    for(m in nums) {
      if(nums[m]!=1) {
        return false;
      }
    }

    return true;
  }


//------------------------------------------------------------------------
// 6-g. exam if any function is a pass-by-reference function or not
//      ex: CORRECT: function bar(x) { return x; }
//          WRONG:   funciton bar()  { return 5; }
//------------------------------------------------------------------------
  function isADecFuncPassedByRef(ast) {
    var nd;

    for(m in ast.body) {
      nd = ast.body[m];
      if(nd.type=="FunctionDeclaration" &&
        nd.params.length>0) {
        return true;
      }
    }

    return false;
  }

//------------------------------------------------------------------------
// 6-h. identify if any function returns an object in a program
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
        var rtn  = nd.body.body[nd.body.body.length-1];

        if(rtn.type=="ReturnStatement") {

          switch(rtn.argument.type) {
            case "Identifier":
              var set = setObjsInAFunc(nd.body);

              if(set.has(rtn.argument.name)) {
                return true;
              }
              break;
            case "ObjectExpression":
                if(rtn.properties.length>0) {
                  return true;
                }
              break;
          }
        }
      }
    }
    return false;
  } 


//------------------------------------------------------------------------
// private function:
// create a dictionary to map funcionts with their occurrence order.
//------------------------------------------------------------------------
  function DictDecFuncs(ast) {
    var dict  = new HashMap();
    var nd, name;
    for(m in ast.body) {
      nd = ast.body[m];
      switch(nd.type) {
        case "FunctionDeclaration":
          if(nd.params.length<2) {
            name = "Function " + nd.id.name + " ("+ nd.params.length+" param)";
          } else {
            name = "Function " + nd.id.name + " ("+ nd.params.length+" params)";
          }

          if(dict.getItem(name)==undefined) {
            dict.setItem(name, nd.start);
          }
          break;
        case "VariableDeclaration":
          var decs = nd.declarations;
          for(n in decs) {
            if(decs[n].init!=null && decs[n].init.type=="FunctionExpression") {
              if(decs[n].init.params.length<2) {
                name = "Function " + decs[n].id.name + " ("+ decs[n].init.params.length +" param)";
              } else {
                name = "Function " + decs[n].id.name + " ("+ decs[n].init.params.length +" params)";
              }

              if(dict.getItem(name)==undefined) {
                dict.setItem(name, nd.start);
              }
            }
          }
          break;
      }
    }
    return dict;  
  }

//------------------------------------------------------------------------
// private function:
// create a dictionary to map function calls with their occurrence order.
//------------------------------------------------------------------------
  function DictFuncCalls(ast) {
    var calls = new HashMap();
    var nd, dec, name, exp;

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "ExpressionStatement":
          for(n in nd.declarations) {
            dec = nd.declarations[n];
            if(dec.init!=null && dec.init.type=="CallExpression") {
              if(dec.init.arguments.length<2) {
                name = "Function " + dec.init.callee.name + 
                       " ("+ dec.init.arguments.length+" param)";
              } else {
                name = "Function " + dec.init.callee.name + 
                       " ("+ dec.init.arguments.length+" params)";
              }

              if(calls.getItem(name)==undefined) {
                calls.setItem(name, nd.start);
              }
            }
          }
          break;
        case "VariableDeclaration":
          exp = nd.expression;
          if(exp.type=="CallExpression") {
            if(exp.arguments.length<2) {
              name = "Function " + exp.callee.name + 
                     " ("+ exp.arguments.length+" param)";
            } else {
              name = "Function " + exp.callee.name + 
                     " ("+ exp.arguments.length+" params)";
            }

            if(calls.getItem(name)==undefined) {
              calls.setItem(name, nd.start);
            }
          }
          break;
      }
    }
    return calls;
  }

//------------------------------------------------------------------------
// private function:
// create a dictionary to map declared functions with the number 
// how many times they get called in a program.
//------------------------------------------------------------------------
  function dictDecFuncsAndCallNum (ast) {
    var funcs = DictDecFuncs(ast);
    var calls = DictFuncCalls(ast);
    var dict  = new HashMap();
    var exp;

    for(m in funcs.keys) {
      dict.setItem(funcs.keys[m], 0);
    }

    for(m in calls.keys) {
      exp = calls.keys[m];

      if(dict.getItem(exp)!=undefined) {
        dict.setItem(exp, dict.getItem(exp)+1);
      }
    }

    return dict;
  }

//------------------------------------------------------------------------
// private function:
// create a dictionary to map declared functions with its 
// declared return object
//------------------------------------------------------------------------
  function dictDecFuncsAndDecRtnObj(ast) {
    var map = new HashMap();
    var nd;

    for(m in ast.body) {
      nd = ast.body[m];

      if(nd.type=="FunctionDeclaration") {
        var rtn  = nd.body.body[nd.body.body.length-1];

        if(rtn.type=="ReturnStatement") {
          var set = setObjsInAFunc(nd.body);

          if(rtn.argument.type=="Identifier") {
            map.setItem(nd.id.name, rtn.argument.name);
          }
        }
      }
    }
    return map;
  }





/******************************************************************/
/* 7. Style Grading for Recursive Function                        */
/*    a. isRecuriveFunction(ast)  ==> boolean ? true:false        */
/******************************************************************/ 

//------------------------------------------------------------------------------
// 7-a. exam if a function is recursive or not by checking its return statement
//      ex: CORRECT: function myMain() {
//                      var x = foo(3);
//                      alert(x);
//                   }
//
//                   function foo(x) {
//                      if (x==1) return 1;
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
    var funcList = listDecFuncs(ast);
    var numFuncNode;
    var func;

    for(var m=0; m<numTopLevelNode; m++) {
      func = ast.body[m];
      if(func.type == "FunctionDeclaration") {
        numFuncNode = func.body.body.length;
        for(var n=0; n<numFuncNode; n++) {
          var block = func.body.body[n];
          if(block.type == "ReturnStatement" && recursionDetector(block.argument, func.id.name)) {
            console.log("Recursion: " + true);
            return true;
          }
        }
      }
    }
    console.log("Recursion: " + false);
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
    collectStructureStyleFacts: collectStructureStyleFacts,

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

    /* 3. Style Grading for Declaration and Use of Object     */
    numDecObjs                 : numDecObjs,
    listDecObjs                : listDecObjs,
    numUndecObjs               : numUndecObjs,
    listUndecObjs              : listUndecObjs,
    numObjsUsed                : numObjsUsed,
    listObjsUsed               : listObjsUsed,
    isAnyFuncBoundToAFuncRtnObj: isAnyFuncBoundToAFuncRtnObj,

    /* 4. Style Grading for Use of While Loop                 */
    numWhileLoopsInGloLev      : numWhileLoopsInGloLev,
    numNestedWhileLoopsInGloLev: numNestedWhileLoopsInGloLev,
    numWhileLoopsInFuncs       : numWhileLoopsInFuncs,
    numNestedWhileLoopsInFuncs : numNestedWhileLoopsInFuncs,
    numWhileLoopsInAProgram    : numWhileLoopsInAProgram,

    /* 5. Style Grading for Use of For Loop                   */
    numForLoopsInGloLev        : numForLoopsInGloLev,
    numNestedForLoopsInGloLev  : numNestedForLoopsInGloLev,
    numForLoopsInFuncs         : numForLoopsInFuncs,
    numNestedForLoopsInFuncs   : numNestedForLoopsInFuncs,
    numForLoopsInAProgram      : numForLoopsInAProgram,

    /* 7. Style Grading for Recursive Function                */
    isRecuriveFunction         : isRecuriveFunction,


  }

})  // end anonymous function declaration 
(); // now run it to create and return the object with all the methods
