

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
//  Yuxin Mo, 4/1/2015 
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

    var dObj  = {

    /******************************************************************/
    /* 1. Style Grading for Declaration and Use of Variable           */
    /*    a. numDecVars(ast)            ==> integer >= 0              */
    /*    b. numUndecVars(ast)          ==> integer >= 0              */
    /*    c. isAnyFuncVar(ast)          ==> boolean ? true:false      */
    /*    d. isAnyGloVarUsedInFuns(ast) ==> boolean ? true:false      */
    /******************************************************************/
      nDV      : numDecVars(ast),
      nUDV     : numUndecVars(ast),
      isFV     : isAnyFuncVar(ast),
      isGVF    : isAnyGloVarUsedInFuns(ast),

    /******************************************************************/
    /* 2. Style Grading for Declaration and Use of Array              */
    /*    a. numDecArrs(ast)      ==> integer >= 0                    */
    /*    b. numUndecArrs(ast)    ==> integer >= 0                    */
    /*    c. numArrsUsed(ast)     ==> integer >= 0                    */
    /******************************************************************/
      nDA      : numDecArrs(ast),
      nUDA     : numUndecArrs(ast),
      nAU      : numArrsUsed(ast),

    /******************************************************************/
    /* 3. Style Grading for Declaration and Use of Object             */
    /*    a. numDecObjs(ast)                 ==> integer >= 0         */
    /*    b. numUndecObjs(ast)               ==> integer >= 0         */
    /*    c. numObjsUsed(ast)                ==> integer >= 0         */
    /*    d. isAnyFuncBoundToAFuncRtnObj(ast)==> boolean ? true:false */
    /******************************************************************/    
      nDO      : numDecObjs(ast),
      nUDO     : numUndecObjs(ast),
      nOU      : numObjsUsed(ast),
      isFBAFRO : isAnyFuncBoundToAFuncRtnObj(ast),

    /******************************************************************/
    /* 4. Style Grading for Use of While Loop                         */
    /*    a. numWhileLoopsInGloLev(ast)       ==> integer >= 0        */
    /*    b. numNestedWhileLoopsInGloLev(ast) ==> integer >= 0        */
    /*    c. numWhileLoopsInFuncs(ast)        ==> integer >= 0        */
    /*    d. numNestedWhileLoopsInFuncs(ast)  ==> integer >= 0        */
    /*    e. numWhileLoopsInAProgram(ast)     ==> integer >= 0        */
    /******************************************************************/  
      nWLGL    : numWhileLoopsInGloLev(ast),
      nNWLGL   : numNestedWhileLoopsInGloLev(ast),
      nWLF     : numWhileLoopsInFuncs(ast),
      nNWLF    : numNestedWhileLoopsInFuncs(ast),
      nWLAP    : numWhileLoopsInAProgram(ast),

    /******************************************************************/
    /* 5. Style Grading for Use of For Loop                           */
    /*    a. numForLoopsInGloLev(ast)            ==> integer >= 0     */
    /*    b. numNestedForLoopsInGloLev(ast)      ==> integer >= 0     */
    /*    c. numForLoopsInFuncs(ast)             ==> integer >= 0     */
    /*    d. numNestedForLoopsInFuncs(ast)       ==> integer >= 0     */
    /*    e. numForLoopsInAProgram(ast)          ==> integer >= 0     */
    /******************************************************************/   
      nFLGL    : numForLoopsInGloLev(ast),
      nNFLGL   : numNestedForLoopsInGloLev(ast),
      nFLF     : numForLoopsInFuncs(ast),
      nNFLF    : numNestedForLoopsInFuncs(ast),
      nFLAP    : numForLoopsInAProgram(ast),

    /******************************************************************/
    /* 6. Style Grading for Declaration and Use of Function           */
    /*    a. numDecFuncs(ast)               ==> integer >= 0          */
    /*    b. areCallExpsAllValid(ast)       ==> integer >= 0          */
    /*    c. areDecFuncsCalled(ast)         ==> boolean ? true:false  */
    /*    d. areDecFuncsCalledOnce(ast)     ==> boolean ? true:false  */
    /*    e. isAnyDecFuncPassedByRef(ast)   ==> boolean ? true:false  */
    /*    f. isAnyFuncReturnObj(ast)        ==> boolean ? true:false  */
    /******************************************************************/
      nDF      : numDecFuncs(ast),
      areCEAV  : areCallExpsAllValid(ast),
      areDFC   : areDecFuncsCalled(ast),
      areDFCO  : areDecFuncsCalledOnce(ast),
      isADFPBR : isAnyDecFuncPassedByRef(ast),
      isAFRO   : isAnyFuncReturnObj(ast),

    /******************************************************************/
    /* 7. Style Grading for Recursive Function                        */
    /*    a. isRecuriveFunction(ast)  ==> boolean ? true:false        */
    /******************************************************************/   
      isRF     : isRecuriveFunction(ast)
    };

    return dObj;
  }



/******************************************************************/
/* 1. Style Grading for Declaration and Use of Variable           */
/*    a. numDecVars(ast)            ==> integer >= 0              */
/*    b. numUndecVars(ast)          ==> integer >= 0              */
/*    c. isAnyFuncVar(ast)          ==> boolean ? true:false      */
/*    d. isAnyGloVarUsedInFuns(ast) ==> boolean ? true:false      */
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
    console.log("numDecVars: "+listDecVars(ast).length);
    return listDecVars(ast).length;
  }

//------------------------------------------------------------------------
// 1-b. calculate total number of undeclared variables 
//      that get used in a program
//------------------------------------------------------------------------  
  function numUndecVars(ast) {
    console.log("numUndecVars: " + listUndecVars(ast).length);
    return listUndecVars(ast).length;
  } 


//------------------------------------------------------------------------
// 1-c. exam if any function gets assigned to a variable in global level
//      ex: function bar() { }
//          var f2 = bar;
//------------------------------------------------------------------------
  function isAnyFuncVar(ast) {
    console.log("isAnyFuncVar: " + (listFuncVars(ast).length>0));
    return listFuncVars(ast).length>0;
  }

//------------------------------------------------------------------------
// 1-d. exam if any variable declared in global level gets used
//      in functions
//      ex: 
//          var globj = {name: "xxx", age:20};
//          function bar() {
//            var num = globj;
//            alert(globj.name);
//          }
//------------------------------------------------------------------------
  function isAnyGloVarUsedInFuns(ast) {
    return null;
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
// private function:
// list all declared variables in a program
//------------------------------------------------------------------------ 
  function listDecVars(ast, decVars) {
    var map, nd, m, n, decs;
    var arr = [];

    if(arguments.length!=1) { 
      map = decVars; 
    }
    else {
      map = new HashMap(); 
    }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":  // base case for a variable declaration
          decs = nd.declarations;

          for(n in decs) {
            if(decs[n].init!=null) { // make sure a declaration trys to bind a var with a value;
              var add = 0;

              if(decs[n].init.type=="Identifier") {  // check for variable pointer 
                var pos = map.getItem(decs[n].init.name);

                if(pos!=undefined && pos[0]<nd.start && pos[1]>nd.end) {
                  arr.push("var " + decs[n].id.name); 
                  add = 1;
                }
              } 
              else if(decs[n].init.type=="Literal") {// check for variable initialization    
                arr.push("var " + decs[n].id.name);
                add = 1;
              }

              if(add==1 && map.getItem(decs[n].id.name)==undefined) {
                map.setItem(decs[n].id.name, [ast.start, ast.end]);
              }
            }
          }
          break;
        case "ForStatement":
          var floop = "for loop";

          // check var in loop initilization
          if(nd.init!=null                      && 
            nd.init.type=="VariableDeclaration" &&
            nd.init.declarations[0].init!= null) {
            var dec = nd.init.declarations[0];
            var add = 0;

            if(dec.init.type=="Literal") {
              arr.push(dec.id.name + " <= " + floop);
              add = 1;
            }
            else if(dec.init.type=="Identifier") {
              var pos = map.getItem(dec.init.name);

              // exam if a declared var is in a calling scope or not
              if(pos!=undefined && pos[0]<nd.start && pos[1]>nd.end) {
                arr.push(dec.id.name + " <= " + floop);
                add = 1;
              }
            }

            if(add==1 && map.getItem(dec.id.name)==undefined) { 
              map.setItem(dec.id.name, [ast.start, ast.end]);
            }
          }

          // check var in loop body
          if(nd.body.body.length > 0) { 
            var obj     = listDecVars(nd.body, map);
            var lpVars  = obj.arr;
            map         = obj.map;

            for(n in lpVars) { arr.push(lpVars[n] + " <= " + floop); }
          }
          break;
        case "WhileStatement":
          var wloop = "while loop";

          if(nd.body.body.length > 0) { 
            var obj    = listDecVars(nd.body, map);
            var wpVars = obj.arr;
            map        = obj.map;

            for(n in wpVars) { arr.push(wpVars[n] + " <= " + wloop); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName  = nd.id.name;
            var obj     = listDecVars(nd.body, map);
            var ndVars  = obj.arr;
            map         = obj.map;

            for(n in ndVars) { arr.push(ndVars[n] + " <= Function " + ndName + "()"); }
          }
          break;
      }
    }


    /* function overlading */
    switch(arguments.length) {
      case 1: // do listDecVars(ast)
        // console.log("ListDecVars(ast): "+ arr);
        return arr;  
      case 2: // do listDecVars(ast, map)
        // console.log("ListDecVars(ast, map): "+ {arr: arr, map: map});
        return {arr: arr, map: map};
    }
  }

//------------------------------------------------------------------------
// private function:
// list all undeclacred variables that get used in a program
//------------------------------------------------------------------------ 
  function listUndecVars(ast) {
    var decVars  = listDecVars(ast);
    var usedVars = listVarsUsed(ast);
    var map      = new HashMap();
    var arr      = [];

    // store all declared vars in a hashmap
    for(m in decVars) { map.setItem(decVars[m], 0); }

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
// private function:
// list all variables that are used in a program
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
// private function:
// list global variables in which directly points to a function
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

      switch(node.type) {
        case "FunctionDeclaration":  
          func.add(node.id.name); // collect declared functions into Set func
        case "VariableDeclaration":
          /* loop through the program to validate each var-to-func pair */
          
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
          /* loop through the program to validate each var-to-func pair */

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




/******************************************************************/
/* 2. Style Grading for Declaration and Use of Array              */
/*    a. numDecArrs(ast)      ==> integer >= 0                    */
/*    b. numUndecArrs(ast)    ==> integer >= 0                    */
/*    c. numArrsUsed(ast)     ==> integer >= 0                    */
/******************************************************************/

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
// 2-b. calculate total number of undeclared arrays 
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
// 2-c. calculate total number of arrays that are used in a program
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
// private function:
// list declared arrays in a program
//      ex: 
//          var a, e=[], f="empty";
//          var b = [one, two, three];
//          var c = new Array();
//------------------------------------------------------------------------ 
  function listDecArrs(ast, decArrs) {
    var map, nd, m, n;
    var arr = [];

    if(arguments.length!=1) { 
      map = decArrs; 
    }
    else {
      map = new HashMap(); 
    }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":
          decs = nd.declarations;
          for(n in decs) {
            if(decs[n].init != null) {
              var add = 0;
              if(decs[n].init.type == "ArrayExpression") { 
                add = 1;
              }
              else if(decs[n].init.type == "NewExpression" && 
                decs[n].init.callee.name == "Array") {
                add = 1;
              }
              else if(decs[n].init.type=="Identifier") {
                var pos = map.getItem(decs[n].init.name);

                if(pos!=undefined && pos[0]<nd.start && pos[1]>nd.end) {
                  add = 1;
                }
              }

              if(add==1) {
                arr.push(decs[n].id.name);

                if(map.getItem(decs[n].id.name)==undefined) {
                  map.setItem(decs[n].id.name, [ast.start, ast.end]);
                }
              }
            }
          } 
          break;
        case "ForStatement":
          // check var in loop body
          if(nd.body.body.length > 0) {
            var floop   = "for loop";
            var obj     = listDecArrs(nd.body, map);
            var lpArrs  = obj.arr;
            map         = obj.map;

            for(n in lpArrs) { arr.push(lpArrs[n] + " <= " + floop); }
          }
          break;
        case "WhileStatement":
          if(nd.body.body.length > 0) { 
            var wloop  = "while loop";
            var obj    = listDecArrs(nd.body, map);
            var wpArrs = obj.arr;
            map        = obj.map;

            for(n in wpArrs) { arr.push(wpArrs[n] + " <= " + wloop); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName  = nd.id.name;
            var obj     = listDecArrs(nd.body, map);
            var ndArrs  = obj.arr;
            map         = obj.map;

            for(n in ndArrs) { arr.push(ndArrs[n] + " <= Function " + ndName + "()"); }
          }
          break;
      }
    }

    /* function overlading */
    switch(arguments.length) {
      case 1: // listDecArrs(ast)
        // console.log("listDecArrs: " + arr);
        return arr;  
      case 2: // do listDecArrs(ast, map)
        return {arr: arr, map: map};
    }
  } 


//------------------------------------------------------------------------
// private function:
// list all undeclared arrays that get used in a program
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
// private function:
// list all arrays that are used in a program 
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
/*    b. numUndecObjs(ast)               ==> integer >= 0         */
/*    c. numObjsUsed(ast)                ==> integer >= 0         */
/*    d. isAnyFuncBoundToAFuncRtnObj(ast)==> boolean ? true:false */
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
    console.log("numDecObjs: "+ dictDecObjs(ast).keys().length);
    return dictDecObjs(ast).keys().length;
  } 

//------------------------------------------------------------------------
// 3-b. calculate total number of undeclared objects 
//      that get used in a program
//      ex:
//        (undeclared obj) objName.methodName() ==> car.name() 
//        (undeclared a)   a = { name: "A", age:20 }
//------------------------------------------------------------------------  
  function numUndecObjs(ast) {
    console.log("numUndecObjs: "+ listUndecObjs(ast).length);
    return listUndecObjs(ast).length;
  } 


//------------------------------------------------------------------------
// 3-c. calculate total number of objects that are used in a program
//      ex:
//        objName.methodName() ==> car.name() 
//        a = { name: "A", age:20 }
//------------------------------------------------------------------------  
  function numObjsUsed(ast) {
    console.log("numObjsUsed: " +dictUsedObjs(ast).keys().length);
    return dictUsedObjs(ast).keys().length;
  } 


//------------------------------------------------------------------------
// 3-d. identify if any function return object is bound to a function
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
//        function bar() {
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
    var check = false;

    for(m in ast.body) {
      nd = ast.body[m];

      if(nd.type=="FunctionDeclaration") {
        bodys    = nd.body.body;
        funcs    = new Set();
        funcObjs = new Set();

        for(n in bodys) {
          switch(bodys[n].type) {
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
                      funcObjs.add(decs[d].id.name);
                    }
                    else if(props[p].value.type=="Identifier") {
                      if(funcs.has(props[p].value.name)) {
                        funcObjs.add(decs[d].id.name);
                      }
                    }
                  }
                }
              }
              break;
            case "ReturnStatement":
              if(bodys[n].argument.type=="Identifier" && 
                funcObjs.has(bodys[n].argument.name)) {
                check = true;
              }
              break;
          }
        }
      }
    }
    // console.log("isAnyFuncBoundToAFuncRtnObj: " + check);
    return check;
  }

//------------------------------------------------------------------------
// private function:
// create a dictionary that maps all declared objects 
// with their occurance orders  
//      ex: 
//          var car = {name:"Tom", age:20};
//          var obj = new Object();
//          
//      the followings do not count as objects:
//          var x = new String();       
//          var y = new Number();    
//          var z = new Boolean(); 
//------------------------------------------------------------------------  
  function dictDecObjs(ast, decObjs) {
    var dict, nd, m, n, name, keys;
    var floop = "for loop";
    var wloop = "while loop";

    // a naive way to do function overloading 
    if(arguments.length!=1) { 
      dict = decObjs; 
    }
    else {
      dict = new HashMap(); 
    }

    // look through the input program body
    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":
          decs = nd.declarations;

          for(n in decs) {
            if(decs[n].init != null) {
              var add = 0;

              if(decs[n].init.type=="ObjectExpression") { add = 1; }
              else if(decs[n].init.type=="NewExpression" && 
                decs[n].init.callee.name == "Object") {
                add = 1;
              }
              else if(decs[n].init.type=="Identifier") {
                var pos = dict.getItem(decs[n].init.name);

                if(pos!=undefined && pos[0]<nd.start && pos[1]>nd.end) {
                  add = 1;
                }
              }

              if(add==1 && dict.getItem(decs[n].id.name)==undefined) {
                dict.setItem(decs[n].id.name, [ast.start, ast.end]);
              }
            }
          } 
          break;
        case "ForStatement":
          // check objs in loop body
          if(nd.body.body.length > 0) { dict = dictDecObjs(nd.body, dict); }
          break;
        case "WhileStatement":
          // check objs in loop body
          if(nd.body.body.length > 0) { dict = dictDecObjs(nd.body, dict); }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) { dict = dictDecObjs(nd.body, dict); }
          break;
      }
    } 
    return dict;   
  }


//------------------------------------------------------------------------
// private function:
// create a dictionary that maps all used objects with occurance orders
//      ex:
//        a = { name: "A", age:20 }
//------------------------------------------------------------------------  
  function dictUsedObjs(ast) {
    var usedObjs = new HashMap();
    var floop    = "for loop";
    var wloop    = "while loop";
    var nd, m, n, name, keys;

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "ExpressionStatement":
          exp = nd.expression;

          if(exp.type=="AssignmentExpression") {
            if(exp.right.type=="ObjectExpression" && exp.left.type=="Identifier"){
              usedObjs.setItem(exp.left.name, nd.start);
            }
            else if(exp.right.type=="NewExpression" && exp.left.type=="Identifier") {
              usedObjs.setItem(exp.left.name, nd.start);
            }
            else if(exp.left.type=="MemberExpression") {
              usedObjs.setItem(exp.left.object.name, nd.start);
            }
          }
          else if(exp.type=="CallExpression" &&
            exp.callee.type=="MemberExpression") {
            usedObjs.setItem(exp.callee.object.name, nd.start);
          }

          break;
        case "ForStatement":
          // check objs in loop body
          if(nd.body.body.length > 0) { 
            var lpObjs = dictUsedObjs(nd.body);
            keys       = lpObjs.keys();

            for(n in keys) {
              name = keys[n] + " <= " + floop;
              usedObjs.setItem(name, lpObjs.getItem(keys[n]));
            }
          }
          break;
        case "WhileStatement":
          // check objs in loop body
          if(nd.body.body.length > 0) { 
            var wpObjs = dictUsedObjs(nd.body);
            keys       = wpObjs.keys();

            for(n in keys) {
              name = keys[n] + " <= " + wloop;
              usedObjs.setItem(name, wpObjs.getItem(keys[n]));
            }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName = nd.id.name;
            var ndObjs = dictUsedObjs(nd.body);
            keys       = ndObjs.keys();

            for(n in keys) {
              name = keys[n] + " <= Function " + ndName + "()";
              usedObjs.setItem(name, ndObjs.getItem(keys[n]));
            }
          }
          break;
      }
    }

    return usedObjs;   
  }


//------------------------------------------------------------------------
// private function:
// list all undeclared objects that get used in a program
//      that get used in a program
//      ex:
//        (undeclared obj) objName.methodName() ==> car.name() 
//        (undeclared a)   a = { name: "A", age:20 }
//------------------------------------------------------------------------  
  function listUndecObjs(ast) {
    var decObjs  = dictDecObjs(ast);
    var usedObjs = dictUsedObjs(ast);
    var dict     = new HashMap();
    var keys     = usedObjs.keys();
    var dec, use;

    for(m in keys) {
      dec = decObjs.getItem(keys[m]);
      use = usedObjs.getItem(keys[m]);

      if(dec==undefined) {
        dict.setItem(keys[m], usedObjs.getItem(keys[m]));
      }
      else if(dec[0]<use[0] && dec[1]>use[1]) {
        dict.setItem(keys[m], usedObjs.getItem(keys[m]));
      }
    }
    // console.log("listUndecObjs: "+ dict.keys());
    return dict.keys();
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
    console.log("numWhileLoopsInGloLev: " +numWhileLoops(ast).wlgl);
    return numWhileLoops(ast).wlgl;
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
    console.log("numNestedWhileLoopsInGloLev: " +numWhileLoops(ast).nwlgl);
    return numWhileLoops(ast).nwlgl;
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
    console.log("numWhileLoopsInFuncs: " +numWhileLoops(ast).wlf);
    return numWhileLoops(ast).wlf;
  }


//------------------------------------------------------------------------
// 4-d. calculate total number of nested while loops in functions (local)
//------------------------------------------------------------------------  
  function numNestedWhileLoopsInFuncs(ast) {
    console.log("numNestedWhileLoopsInFuncs: " +numWhileLoops(ast).nwlf);
    return numWhileLoops(ast).nwlf;
  }


//------------------------------------------------------------------------
// 4-e. calculate total number of while loops in a program
//------------------------------------------------------------------------  
  function numWhileLoopsInAProgram(ast) {
    console.log("numWhileLoopsInAProgram: " +(numWhileLoops(ast).wlgl+numWhileLoops(ast).wlf));
    return (numWhileLoops(ast).wlgl+numWhileLoops(ast).wlf);
  }


//------------------------------------------------------------------------
// private function:
// calculate total number of while loops in a calling scope
//------------------------------------------------------------------------  
  function numWhileLoops(ast) {
    var counts = {wlgl:0, nwlgl:0, wlf:0, nwlf:0};
    var nd, snd, lowLevLoops;

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "WhileStatement":
          lowLevLoops = numWhileLoops(nd.body);

          // numWhileLoopsInGloLev
          counts.wlgl = counts.wlgl + 1 + lowLevLoops.wlgl;

          // numNestedWhileLoopsInGloLev
          counts.nwlgl = (lowLevLoops.wlgl>0) ? counts.nwlgl+1:counts.nwlgl;

          // keep examming if there has a multiple level nested loop
          counts.nwlgl = (lowLevLoops.nwlgl>0) ? counts.nwlgl+lowLevLoops.nwlgl:counts.nwlgl;
          break;
        case "FunctionDeclaration":
          for(n in nd.body.body) {
            snd = nd.body.body[n];

            if(snd.type=="WhileStatement") {
              lowLevLoops = numWhileLoops(nd.body);

              // numForLoopsInFuncs
              counts.wlf = lowLevLoops.wlgl;

              // numNestedForLoopsInFuncs
              counts.nwlf = (lowLevLoops.nwlgl>0) ? lowLevLoops.nwlgl:counts.nwlf;
            }
          }
          break;
      }
    }
    return counts;
  }


/******************************************************************/
/* 5. Style Grading for Use of For Loop                           */
/*    a. numForLoopsInGloLev(ast)            ==> integer >= 0     */
/*    b. numNestedForLoopsInGloLev(ast)      ==> integer >= 0     */
/*    c. numForLoopsInFuncs(ast)             ==> integer >= 0     */
/*    d. numNestedForLoopsInFuncs(ast)       ==> integer >= 0     */
/*    e. numForLoopsInAProgram(ast)          ==> integer >= 0     */
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
    console.log("numForLoopsInGloLev: " +numForLoops(ast).flgl);
    return numForLoops(ast).flgl;
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
    console.log("numNestedForLoopsInGloLev: " +numForLoops(ast).nflgl);
    return numForLoops(ast).nflgl;
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
    console.log("numForLoopsInFuncs: " +numForLoops(ast).flf);
    return numForLoops(ast).flf;
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
    console.log("numNestedForLoopsInFuncs: " +numForLoops(ast).nflf);
    return numForLoops(ast).nflf;
  }

//------------------------------------------------------------------------
// 5-e. calculate total number of for loops in a program
//------------------------------------------------------------------------  
  function numForLoopsInAProgram(ast) {
    console.log("numForLoopsInAProgram: " +(numForLoops(ast).flgl+numForLoops(ast).flf));
    return (numForLoops(ast).flgl+numForLoops(ast).flf);
  }

//------------------------------------------------------------------------
// private function:
// calculate total number of for loops in a calling scope
//------------------------------------------------------------------------  
  function numForLoops(ast) {
    var counts = {flgl:0, nflgl:0, flf:0, nflf:0};
    var nd, snd;

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "ForStatement":
          lowLevLoops = numForLoops(nd.body);

          // numForLoopsInGloLev
          counts.flgl = counts.flgl + 1 + lowLevLoops.flgl;

          // numNestedForLoopsInGloLev
          counts.nflgl = (lowLevLoops.flgl>0) ? counts.nflgl+1:counts.nflgl;

          // keep examming if there has a multiple level nested loop
          counts.nflgl = (lowLevLoops.nflgl>0) ? counts.nflgl+lowLevLoops.nflgl:counts.nflgl;
          break;
        case "FunctionDeclaration":
          for(n in nd.body.body) {
            snd = nd.body.body[n];

            if(snd.type=="ForStatement") {
              lowLevLoops = numForLoops(nd.body);

              // numForLoopsInFuncs
              counts.flf  = lowLevLoops.flgl;

              // numNestedForLoopsInFuncs
              counts.nflf = (lowLevLoops.nflgl>0) ? lowLevLoops.nflgl:counts.nflf;
            }
          }
          break;
      }
    }
    return counts;
  }





/******************************************************************/
/* 6. Style Grading for Declaration and Use of Function           */
/*    a. numDecFuncs(ast)               ==> integer >= 0          */
/*    b. areCallExpsAllValid(ast)       ==> integer >= 0          */
/*    c. areDecFuncsCalled(ast)         ==> boolean ? true:false  */
/*    d. areDecFuncsCalledOnce(ast)     ==> boolean ? true:false  */
/*    e. isAnyDecFuncPassedByRef(ast)   ==> boolean ? true:false  */
/*    f. isAnyFuncReturnObj(ast)        ==> boolean ? true:false  */
/******************************************************************/

//------------------------------------------------------------------------
// 6-a. calculate the number of declared functions in global level:
//      ex:
//        function a() {}
//        var a = function() {}
//------------------------------------------------------------------------
  function numDecFuncs(ast) {
    console.log("numDecFuncs: "+dictDecFuncs(ast).keys().length);
    return dictDecFuncs(ast).keys().length;
  }


//------------------------------------------------------------------------
// 6-b. exam call expressions that all call declared functions in which 
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
    console.log("areCallExpsAllValid: " + (listInvalidFuncCallExps(ast).length==0));
    return listInvalidFuncCallExps(ast).length==0;
  }



//------------------------------------------------------------------------
// 6-c. exam all declared functions get called in a program
//      * the number that a function gets called is regardless
//      ex: function bar() { return 5; }
//          function foo() { return 5; }
//          bar(); bar();
//          foo(); foo();
//------------------------------------------------------------------------
  function areDecFuncsCalled(ast) {
    var nums = dictDecFuncsAndCallNum(ast).values(); // num of each function gets called

    for(m in nums) {
      if(nums[m]==0) {
        console.log("areDecFuncsCalled: " + false);
        return false;
      }
    }
    console.log("areDecFuncsCalled: " + true);
    return true;
  }


//------------------------------------------------------------------------
// 6-d. exam all declared functions get called exactly once in a program
//      ex: function bar() { return 5; }
//          function foo() { return 5; }
//          bar();
//          foo();
//------------------------------------------------------------------------
  function areDecFuncsCalledOnce(ast) {
    var nums = dictDecFuncsAndCallNum(ast).values(); // num of each function gets called

    for(m in nums) {
      if(nums[m]!=1) {
        console.log("areDecFuncsCalledOnce: " + false);
        return false;
      }
    }
    console.log("areDecFuncsCalledOnce: " + true);
    return true;
  }


//------------------------------------------------------------------------
// 6-e. exam if any function is a pass-by-reference function or not
//      ex: CORRECT: function bar(x) { return x; }
//          WRONG:   funciton bar()  { return 5; }
//------------------------------------------------------------------------
  function isAnyDecFuncPassedByRef(ast) {
    var nd;

    for(m in ast.body) {
      nd = ast.body[m];
      if(nd.type=="FunctionDeclaration" &&
        nd.params.length>0) {
        console.log("isADecFuncPassedByRef: " + true);
        return true;
      }
    }
    console.log("isADecFuncPassedByRef: " + false);
    return false;
  }


//------------------------------------------------------------------------
// 6-f. identify if any function returns an object in a program
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

      if(nd.type=="FunctionDeclaration" && nd.body.body.length>0) {
        var rtn  = nd.body.body[nd.body.body.length-1];

        if(rtn.type=="ReturnStatement") {

          switch(rtn.argument.type) {
            case "Identifier":
              var set = setObjsInAFunc(nd.body);

              if(set.has(rtn.argument.name)) {
                console.log("isAnyFuncReturnObj: " + true);
                return true;
              }
              break;
            case "ObjectExpression":
                if(rtn.properties.length>0) {
                  console.log("isAnyFuncReturnObj: " + true);
                  return true;
                }
              break;
          }
        }
      }
    }
    console.log("isAnyFuncReturnObj: " + false);
    return false;
  } 


//------------------------------------------------------------------------
// private function:
// create a dictionary to map declared funcionts with 
// their occurrence order.
//      ex:
//        function a() {}
//        function b(x) {}
//        function b(x, y) {}
//        var a = function() {}
//------------------------------------------------------------------------
  function dictDecFuncs(ast) {
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
  function dictFuncCalls(ast) {
    var calls = new HashMap();
    var nd, dec, name, exp;

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":
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
        case "ExpressionStatement":
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
    var funcs = dictDecFuncs(ast).keys();
    var calls = dictFuncCalls(ast).keys(); 
    var dict  = new HashMap();
    var exp;

    for(m in funcs) {
      dict.setItem(funcs[m], 0);
    }

    for(m in calls) {
      exp = calls[m];

      if(dict.getItem(exp)!=undefined) {
        dict.setItem(exp, dict.getItem(exp)+1);
      }
    }
    return dict;
  }


//------------------------------------------------------------------------
// private function:
// list invalid function call expressions in which a call expression calls 
// an undeclared function
//      ex:
//        CORRECT: function myMain() { return 5; }
//                 myMain();
//        WRONG:   1. function myMain() { return 5; }
//                    foo();
//                 2. foo();
//                    function foo() { return 5; }
//------------------------------------------------------------------------
  function listInvalidFuncCallExps(ast) {
    var decs  = dictDecFuncs(ast); 
    var calls = dictFuncCalls(ast); 
    var exps  = decs.keys();
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
    var func, nds;

    for(m in ast.body) {
      func = ast.body[m];
      if(func.type == "FunctionDeclaration") {
        nds = func.body.body;

        for(n in nds) {
          var block = nds[n];
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
    numUndecVars               : numUndecVars,
    isAnyFuncVar               : isAnyFuncVar,
    isAnyGloVarUsedInFuns      : isAnyGloVarUsedInFuns,

    /* 2. Style Grading for Declaration and Use of Array      */
    numDecArrs                 : numDecArrs,
    numUndecArrs               : numUndecArrs,
    numArrsUsed                : numArrsUsed,

    /* 3. Style Grading for Declaration and Use of Object     */
    numDecObjs                 : numDecObjs,
    numUndecObjs               : numUndecObjs,
    numObjsUsed                : numObjsUsed,
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

    /* 6. Style Grading for Declaration and Use of Function   */
    numDecFuncs                : numDecFuncs,
    areCallExpsAllValid        : areCallExpsAllValid,
    areDecFuncsCalled          : areDecFuncsCalled,
    areDecFuncsCalledOnce      : areDecFuncsCalledOnce,
    isAnyDecFuncPassedByRef    : isAnyDecFuncPassedByRef,
    isAnyFuncReturnObj         : isAnyFuncReturnObj,

    /* 7. Style Grading for Recursive Function                */
    isRecuriveFunction         : isRecuriveFunction,


  }

})  // end anonymous function declaration 
(); // now run it to create and return the object with all the methods
