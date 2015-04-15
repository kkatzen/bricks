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
    /*    a. numDecVars(ast)               ==> integer >= 0           */
    /*    b. numUndecVars(ast)             ==> integer >= 0           */
    /*    c. numVarsUsed(ast)              ==> integer >= 0           */
    /*    d. numVarsInFuncsUseGloVars(ast) ==> integer >= 0           */
    /*    e. isAnyFuncVar(ast)             ==> boolean ? true:false   */
    /******************************************************************/
      nDV      : numDecVars(ast),
      nUDV     : numUndecVars(ast),
      nVU      : numVarsUsed(ast),
      nVFUGV   : numVarsInFuncsUseGloVars(ast),
      isFV     : isAnyFuncVar(ast),


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
    console.log("numDecVars: "+listDecVars(ast).list.length);
    return listDecVars(ast).list.length;
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
// 1-c. calculate total number of variables used in a program
//      ex. (array) arr.push(val)
//          alert(val)
//          var num = val + 1 (val gets used)
//          num = val + 1 (num and val both get used)
//------------------------------------------------------------------------
  function numVarsUsed(ast) {
    console.log("numVarsUsed: " + listVarsUsed(ast).list.length);
    return listVarsUsed(ast).list.length;
  }


//------------------------------------------------------------------------
// 1-d. calculate the number of variables in functions that uses 
//      global declared variables
//      ex: 
//          var globj = {name: "xxx", age:20};
//          function bar() {
//            var num = globj;
//            alert(globj.name);
//          }
//------------------------------------------------------------------------
  function numVarsInFuncsUseGloVars(ast) {
    console.log("numVarsInFuncsUseGloVars: " + listVarsInFuncsUseGloVars(ast).length);
    return listVarsInFuncsUseGloVars(ast).length;
  }


//------------------------------------------------------------------------
// 1-e. exam if any function gets assigned to a variable in global level
//      ex: function bar() { }
//          var f2 = bar;
//------------------------------------------------------------------------
  function isAnyFuncVar(ast) {
    console.log("isAnyFuncVar: " + (listFuncVars(ast).length>0));
    return listFuncVars(ast).length>0;
  }


//------------------------------------------------------------------------
// private function:
// list all declared variables in a program
//------------------------------------------------------------------------ 
  function listDecVars(ast, decVars) {
    var map, nd, m, n, decs;
    var list    = [];
    var floop    = " <= for { }";
    var wloop    = " <= while { }";
    var ifblock  = " <= if { }";
    var funcblock = " <= Function ";

    if(arguments.length==2) { 
      map = decVars; 
    } else {
      map = new HashMap(); 
    }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "VariableDeclaration":  // base case for a variable declaration
          decs = nd.declarations;

          for(n in decs) {
            var add = 0;
            if(decs[n].init!=null) { // make sure a declaration trys to bind a var with a value;

              if(decs[n].init.type=="Identifier") {  // check for variable pointer 
                var pos = map.getItem(decs[n].init.name);

                if(pos!=undefined && pos[0]<nd.start && pos[1]>nd.end) {
                  list.push("var " + decs[n].id.name); 
                  add = 1;
                }
              } 
              else if(decs[n].init.type=="Literal") {// check for variable initialization    
                list.push("var " + decs[n].id.name);
                add = 1;
              }
            }
            else if(decs[n].id.type=="Identifier"){
              list.push("var " + decs[n].id.name); 
              add = 1;
            }

            if(add==1 && map.getItem(decs[n].id.name)==undefined) {
              map.setItem(decs[n].id.name, [ast.start, ast.end]);
            }
          }
          break;
        case "ForStatement":

          // check vars in loop initilization
          if(nd.init!=null                      && 
            nd.init.type=="VariableDeclaration" &&
            nd.init.declarations[0].init!= null) {
            var dec = nd.init.declarations[0];
            var add = 0;

            if(dec.init.type=="Literal") {
              list.push(dec.id.name + " <= " + floop);
              add = 1;
            }
            else if(dec.init.type=="Identifier") {
              var pos = map.getItem(dec.init.name);

              // exam if a declared var is in a calling scope or not
              if(pos!=undefined && pos[0]<nd.start && pos[1]>nd.end) {
                list.push(dec.id.name + floop);
                add = 1;
              }
            }

            if(add==1 && map.getItem(dec.id.name)==undefined) { 
              // a var declaration has a wider scoping range than a var usage
              map.setItem(dec.id.name, [ast.start, ast.end]); 
            }
          }

          // check vars in loop body
          if(nd.body.body.length > 0) { 
            var obj    = listDecVars(nd.body, map);
            var lpVars = obj.list;
            map        = obj.map;

            for(n in lpVars) { list.push(lpVars[n] + floop); }
          }
          break;
        case "WhileStatement":
          if(nd.body.body.length > 0) { 
            var obj    = listDecVars(nd.body, map);
            var wpVars = obj.list;
            map        = obj.map;

            for(n in wpVars) { list.push(wpVars[n] + wloop); }
          }
          break;
        case "IfStatement":
          if(nd.consequent.body.length > 0) {
            var obj    = listDecVars(nd.consequent, map);
            var ifVars = obj.list;
            map        = obj.map;

            for(n in ifVars) { list.push(ifVars[n] + ifblock); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName = nd.id.name;
            var obj    = listDecVars(nd.body, map);
            var ndVars = obj.list;
            map        = obj.map;

            for(n in ndVars) { list.push(ndVars[n] + funcblock + ndName + "()"); }
          }
          break;
      }
    }

    return {list: list, map: map};
  }


//------------------------------------------------------------------------
// private function:
// list all operator variables (right-hand side variables)
//------------------------------------------------------------------------ 
  function listOperatorVars(nd, map) {
    var list = [];

    switch(nd.type) {
      case "Identifier":
        list.push(nd.name);

        if(map.getItem(nd.name)==undefined) {
          map.setItem(nd.name, [nd.start, nd.end]);
        }
        break;
      case "BinaryExpression":
        var left      = listOperatorVars(nd.left, map);
        var right     = listOperatorVars(nd.right, map);
        var lMap      = left.map;
        var rMap      = right.map;
        var lMapKeys  = lMap.keys();
        var rMapKeys  = rMap.keys();

        list = list.concat(left.list);
        list = list.concat(right.list);

        for(m in lMapKeys) {
          if(map.getItem(lMapKeys[m])==undefined) {
            map.setItem(lMapKeys[m], lMap.getItem(lMapKeys[m]));
          }
        }

        for(m in rMapKeys) {
          if(map.getItem(rMapKeys[m])==undefined) {
            map.setItem(rMapKeys[m], rMap.getItem(rMapKeys[m]));
          }
        }
        break;
      case "Literal":
        break;
      case "CallExpression":
        break;
    }
    return {list:list, map:map};
  }


//------------------------------------------------------------------------
// private function:
// list all undeclacred variables that get used in a program
//------------------------------------------------------------------------ 
  function listUndecVars(ast) {
    var decVars  = listDecVars(ast).map;
    var usedVars = listVarsUsed(ast).map;
    var keys     = usedVars.keys();
    var list     = [];

    // check for the use of undelcared vars
    for(m in keys) { 
      var scopeDecVar  = decVars.getItem(keys[m]);
      var scopeUsedVar = usedVars.getItem(keys[m]);

      if(scopeDecVar == undefined) {
        list.push(keys[m]);
      } 
      else if(scopeUsedVar[0]<scopeDecVar[0] || scopeUsedVar[0]>scopeDecVar[1] ||
       (scopeUsedVar[0]>scopeDecVar[0] && scopeUsedVar[1]>scopeDecVar[1])) {
        list.push(keys[m]);
      }
    }
    return list;
  } 


//------------------------------------------------------------------------
// private function:
// list all variables that are used in a program
//------------------------------------------------------------------------ 
  function listVarsUsed(ast, varUsed) {
    var list    = [];
    var nd, args, cal, add, left, right, lList, rList, map;
    var floop    = " <= for { }";
    var wloop    = " <= while { }";
    var ifblock  = " <= if { }";
    var funblock = " <= Function ";

    if(arguments.length==2) { 
      map = varUsed; 
    } else {
      map = new HashMap(); 
    }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) { // base case
        case "VariableDeclaration":
          decs = nd.declarations;

          for(d in decs) {

            if(decs[d].init!=null && decs[d].init.type=="Identifier") {
              list.push(decs[d].init.name);

              if(map.getItem(decs[d].id.name)==undefined) {
                map.setItem(decs[d].id.name, [nd.start, nd.end]);
              }
            }
            else if(decs[d].init!=null && decs[d].init.type=="BinaryExpression") {
              left   = listOperatorVars(decs[d].init.left, map);
              map    = left.map;
              right  = listOperatorVars(decs[d].init.right, map);
              map    = right.map;
              list   = list.concat(left.list);
              list   = list.concat(right.list);
            }
          }
          break;
        case "ExpressionStatement":
          exp = nd.expression;

          switch(exp.type) {
            case "UpdateExpression":
              list.push(exp.argument.name);

              if(map.getItem(exp.argument.name)==undefined) {
                map.setItem(exp.argument.name, [nd.start, nd.end]);
              }
              break;
            case "AssignmentExpression":
              left   = listOperatorVars(exp.left, map);
              map    = left.map;
              right  = listOperatorVars(exp.right, map);
              map    = right.map;
              list   = list.concat(left.list);
              list   = list.concat(right.list);
              break;
            case "CallExpression":
              cal = exp.callee;

              // check for passing arguments in call functions
              if(cal.type=="Identifier") {
                args = exp.arguments;

                if(args.length>0) {
                  for(n in args) {
                    if(args[n].type=="Identifier") {
                      list.push(args[n].name);

                      if(map.getItem(args[n].name)==undefined) {
                        map.setItem(args[n].name, [nd.start, nd.end]);
                      }
                    }
                  }
                }
              }
              else if(cal.type=="MemberExpression") {
                args = exp.arguments;

                // check for objects that calls their property functions
                if(cal.object=="Identifier") {
                  list.push(cal.object.name);

                  if(map.getItem(cal.object.name)==undefined) {
                    map.setItem(cal.object.name, [nd.start, nd.end]);
                  }
                }

                // check for passing arguments in call functions
                if(args.length>0) {
                  for(n in args) {
                    if(args[n].type=="Identifier") {
                      list.push(args[n].name);

                      if(map.getItem(args[n].name)==undefined) {
                        map.setItem(args[n].name, [nd.start, nd.end]);
                      }
                    }
                  }
                }
              }
              break;
          }
          break;
        case "ForStatement":

          /* check vars in loop initilization */

          if(nd.init != null && nd.init.type=="AssignmentExpression") { 
            left   = listOperatorVars(nd.init.left, map);
            map    = left.map;
            right  = listOperatorVars(nd.init.right, map);
            map    = right.map;
            lList  = left.list;
            rList  = rMap.list;

            for(n in lList) { list.push(lList[n] + floop); }
            for(n in rList) { list.push(rList[n] + floop); }
          }
          else if(nd.init != null && nd.init.type=="VariableDeclaration") { 

            // left-hand side var declaration
            var varName  = nd.init.declarations[0].id.name;
            list.push(varName + " <= " + floop);
            if(map.getItem(varName)==undefined) { map.setItem(varName, [nd.start, nd.end]); }

            // right-hand side possilble var assignment
            if(nd.init.declarations[0].init.type=="BinaryExpression") {
              left   = listOperatorVars(nd.init.declarations[0].init.left, map);
              map    = left.map;
              right  = listOperatorVars(nd.init.declarations[0].init.right, map);
              map    = right.map;
              lList  = left.list;
              rList  = rMap.list;

              for(n in lList) { list.push(lList[n] + floop); }
              for(n in rList) { list.push(rList[n] + floop); }
            }
          } else {
            // check vars in loop body
            if(nd.body.body.length > 0) { 
              var obj     = listVarsUsed(nd.body, map);
              var lpVars  = obj.list;
              map         = obj.map;

              for(n in lpVars) { list.push(lpVars[n] + floop); }
            }
          }
          break;
        case "WhileStatement":
          /* skip conditional vars in while test bracket */

          // check vars in loop body
          if(nd.body.body.length > 0) { 
            var obj    = listVarsUsed(nd.body, map);
            var wpVars = obj.list;
            map        = obj.map;

            for(n in wpVars) { list.push(wpVars[n] + wloop); }
          }

          break;
        case "IfStatement":
          if(nd.consequent.body.length > 0) {
            var obj    = listVarsUsed(nd.consequent, map);
            var ifVars = obj.list;
            map        = obj.map;

            for(n in ifVars) { list.push(ifVars[n] + ifblock); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName  = nd.id.name;
            var obj     = listVarsUsed(nd.body, map);
            var ndVars  = obj.list;
            map         = obj.map;

            for(n in ndVars) { list.push(ndVars[n] + funblock + ndName + "()"); }
          }
          break;
      }
    }

    return {list:list, map:map};
  } 

//------------------------------------------------------------------------
// private function:
// list global variables in which directly points to a function
//      ex: function bar() { }
//          var f2 = bar;
//------------------------------------------------------------------------ 
  function listFuncVars(ast) {
    var nd;
    var funcs = new HashMap();
    var useds = new HashMap();
    var list = [];

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "FunctionDeclaration":
          funcs.setItem(nd.id.name, [nd.start, nd.end]); // collect declared functions into funcs
        case "VariableDeclaration":

          /* loop through the program to validate each var-to-func pair */
          
          var sbnd = nd.declarations;
          for(n in sbnd) {    
            if(sbnd[n].init!=null && sbnd[n].init.type=="Identifier") {
              if(funcs.hasItem(sbnd[n].init.name) && !useds.hasItem(sbnd[n].id.name)){
                useds.setItem(sbnd[n].id.name, [nd.start, nd.end]);
              }
            } 
          }
          break;
        case "ExpressionStatement":

          /* loop through the program to validate each var-to-func pair */

          var exp = nd.expression;
          if(exp.type=="AssignmentExpression" && 
            exp.left.type=="Identifier" && exp.right.type=="Identifier") {
            if(funcs.hasItem(exp.right.name) && !useds.hasItem(exp.left.name)) { 
              useds.setItem(exp.left.name, [nd.start, nd.end]);
            }                    
          }
          break;
      }
    }

    // console.log("ListFuncVars: " +arr);
    return useds.keys();
  }

//------------------------------------------------------------------------
// private function:
// list global variables in a program
//      ex: var f2 = 100; // f2 is a global var
//          function bar() {
//            var a = f2;  
//          }
//------------------------------------------------------------------------ 
  function dictGloVars(ast) {
    var map = new HashMap();
    var nd, decs;

    for(m in ast.body) {
      nd = ast.body[m];

      if(nd.type=="VariableDeclaration") {
        decs = nd.declarations;

        for(n in decs) {
          var add = 0;
          if(decs[n].init!=null) { // make sure a declaration trys to bind a var with a value;

            if(decs[n].init.type=="Identifier") {  // check for variable pointer 
              var pos = map.getItem(decs[n].init.name);

              if(pos!=undefined && pos[0]<nd.start && pos[1]>nd.end &&
                map.getItem(decs[n].id.name)==undefined) {
                map.setItem(decs[n].id.name, [ast.start, ast.end]);
              }
            } 
            else if(decs[n].init.type=="Literal" &&
              map.getItem(decs[n].id.name)==undefined) {// check for variable initialization    
              map.setItem(decs[n].id.name, [ast.start, ast.end]);
            }
          }
          else if(decs[n].id.type=="Identifier" && 
            map.getItem(decs[n].id.name)==undefined){
            map.setItem(decs[n].id.name, [ast.start, ast.end]);
          }
        }
      }
    }

    return map;
  }

//------------------------------------------------------------------------
// private function:
// list global variables that are used in functions
//      ex: var f2 = 100;
//          function bar() {
//            var a = f2;  
//          }
//------------------------------------------------------------------------ 
  function listVarsInFuncsUseGloVars(ast, gloVars) {
    var mapGloVars, nd, m, n, decs;
    var list     = [];
    var floop    = " <= for { }";
    var wloop    = " <= while { }";
    var ifblock  = " <= if { }";
    var funblock = " <= Function ";

    if(arguments.length==2) { 
      mapGloVars = gloVars; 

      for(m in ast.body) {
        nd = ast.body[m];

        switch(nd.type) {
          case "VariableDeclaration":  // base case for a variable declaration
            decs = nd.declarations;

            for(n in decs) {
              if(decs[n].init!=null && decs[n].init.type=="Identifier") { // make sure a declaration trys to bind a var with a value;
                var pos = mapGloVars.getItem(decs[n].init.name);

                if(pos!=undefined && pos[0]<nd.start) {
                  list.push("var " + decs[n].id.name); 
                }
              }
            }
            break;
          case "ForStatement":

            // check vars in loop initilization
            if(nd.init!=null                      && 
              nd.init.type=="VariableDeclaration" &&
              nd.init.declarations[0].init!= null) {
              var dec = nd.init.declarations[0];

              if(dec.init.type=="Identifier") {
                var pos = map.getItem(dec.init.name);

                // exam if a declared var is in a calling scope or not
                if(pos!=undefined && pos[0]<nd.start) {
                  list.push(dec.id.name + floop);
                }
              }
            }

            // check vars in loop body
            if(nd.body.body.length > 0) { 
              var lpList = list.concat(listVarsInFuncsUseGloVars(nd.body, mapGloVars));

              for(n in lpList) { list.push(lpList[n] + floop); }
            }
            break;
          case "WhileStatement":
            if(nd.body.body.length > 0) { 
              var wlList = list.concat(listVarsInFuncsUseGloVars(nd.body, mapGloVars));

              for(n in list) { list.push(wlList[n] + wloop); }
            }
            break;
          case "IfStatement":
            if(nd.consequent.body.length > 0) {
              var ifList = list.concat(listVarsInFuncsUseGloVars(nd.body, mapGloVars));

              for(n in ifList) { list.push(ifList[n] + ifblock); }
            }
            break;
        }
      }
    } else {
      mapGloVars = dictGloVars(ast); 

      for(m in ast.body) {
        nd = ast.body[m];

        if(nd.type=="FunctionDeclaration" && nd.body.body.length>0) {
          list = list.concat(listVarsInFuncsUseGloVars(nd.body, mapGloVars));
        }
      }
    }
    return list;
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
    console.log("numDecArrs: " + listDecArrs(ast).arr.length);
    return listDecArrs(ast).arr.length;
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
    console.log("numArrsUsed: " + listArrsUsed(ast).arr.length);
    return listArrsUsed(ast).arr.length;
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
    var arr      = [];
    var floop    = " <= for { }";
    var wloop    = " <= while { }";
    var ifblock  = " <= if { }";
    var funblock = " <= Function ";

    if(arguments.length==2) { 
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
              if(decs[n].init.type=="ArrayExpression") {
                arr.push(decs[n].id.name);
                add = 1;
              }
              else if(decs[n].init.type=="NewExpression" && 
                decs[n].init.callee.name=="Array") {
                arr.push(decs[n].id.name);
                add = 1;
              }
              else if(decs[n].init.type=="Identifier") {
                var pos = map.getItem(decs[n].init.name);

                if(pos!=undefined && pos[0]<nd.start && pos[1]>nd.end) {
                  arr.push(decs[n].id.name);
                  add = 1;
                }
              }

              if(add==1 && map.getItem(decs[n].id.name)==undefined) {
                map.setItem(decs[n].id.name, [ast.start, ast.end]);
              }
            }
          }
          break;
        case "ForStatement":
          // check var in loop body
          if(nd.body.body.length > 0) {
            var obj     = listDecArrs(nd.body, map);
            var lpArrs  = obj.arr;
            map         = obj.map;

            for(n in lpArrs) { arr.push(lpArrs[n] + floop); }
          }
          break;
        case "WhileStatement":
          if(nd.body.body.length > 0) { 
            var obj    = listDecArrs(nd.body, map);
            var wpArrs = obj.arr;
            map        = obj.map;

            for(n in wpArrs) { arr.push(wpArrs[n] + wloop); }
          }
          break;
        case "IfStatement":
          if(nd.consequent.body.length > 0) {
            var obj     = listDecArrs(nd.consequent, map);
            var ifVars  = obj.arr;
            map         = obj.map;

            for(n in ifVars) { arr.push(ifVars[n] + ifblock); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName  = nd.id.name;
            var obj     = listDecArrs(nd.body, map);
            var ndArrs  = obj.arr;
            map         = obj.map;

            for(n in ndArrs) { arr.push(ndArrs[n] + funblock + ndName + "()"); }
          }
          break;
      }
    }

    return {arr: arr, map: map};
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
    var decArrs  = listDecArrs(ast).map;
    var usedArrs = listArrsUsed(ast).map;
    var keys     = usedArrs.keys();
    var list     = [];

    // check for the use of undelcared arrs
    for(m in keys) { 
      var scopeDecArr  = decArrs.getItem(keys[m]);
      var scopeUsedArr = usedArrs.getItem(keys[m]);
      
      if(scopeDecArr == undefined) {
        list.push(keys[m]);
      } 
      else if(scopeUsedArr[0]<scopeDecArr[0] || scopeUsedArr[0]>scopeDecArr[1] ||
       (scopeUsedArr[0]>scopeDecArr[0] && scopeUsedArr[1]>scopeDecArr[1])) {
        list.push(keys[m]);
      }
    }

    // console.log("listUndecArrs: " + list);
    return list;
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
  function listArrsUsed(ast, usedArrs) {
    var count = 0;
    var arr   = [];
    var nd, m, exp, func, map, add;
    var floop    = " <= for { }";
    var wloop    = " <= while { }";
    var ifblock  = " <= if { }";
    var funblock = " <= Function ";

    if(arguments.length==2) { 
      map = usedArrs; 
    }
    else {
      map = new HashMap(); 
    }

    for(m in ast.body) {
      nd = ast.body[m];

      switch(nd.type) {
        case "ExpressionStatement":
          exp = nd.expression;

          switch(exp.type) {
            case "AssignmentExpression":
              add = 0;
              if(exp.right.type=="ArrayExpression") { 
                arr.push(exp.left.name); 
                add = 1;
              }
              else if(exp.right.type=="NewExpression" && exp.right.callee.name=="Array") {
                arr.push(exp.left.name);
                add = 1;
              }              

              if(add==1 && map.getItem(exp.left.name)==undefined) {
                map.setItem(exp.left.name, [nd.start, nd.end]);
              }
              break;
            case "CallExpression":
              if(exp.callee.type=="MemberExpression") {
                method = exp.callee.property.name;

                if(method=="push" || method=="sort"  || method=="join" || method=="valueOf" ||
                   method=="pop"  || method=="shift" || method=="unshift") {
                  arr.push(exp.callee.object.name);
              
                  if(map.getItem(exp.callee.object.name)==undefined) {
                    map.setItem(exp.callee.object.name, [nd.start, nd.end]);
                  }
                } 
              }
              break;
          }
          break;
        case "ForStatement":
          var floop = "for loop";
          // check vars in loop body
          if(nd.body.body.length > 0) { 
            var obj    = listArrsUsed(nd.body, map);
            var lpArrs = obj.arr
            map        = obj.map;

            for(n in lpArrs) { arr.push(lpArrs[n] + " <= " + floop); }
          }
          break;
        case "WhileStatement":
          /* skip testing vars*/

          // check vars in loop body
          var wloop = "while loop";
          if(nd.body.body.length > 0) { 
            var obj    = listArrsUsed(nd.body, map);
            var wpArrs = obj.arr;
            map        = obj.map;

            for(n in wpArrs) { arr.push(wpArrs[n] + " <= " + wloop); }
          }
          break;
        case "IfStatement":
          if(nd.consequent.body.length > 0) {
            var obj    = listArrsUsed(nd.consequent, map);
            var ifVars = obj.arr;
            map        = obj.map;

            for(n in ifVars) { arr.push(ifVars[n] + ifblock); }
          }
          break;
        case "FunctionDeclaration":
          if(nd.body.body.length > 0) {
            var ndName = nd.id.name;
            var obj    = listArrsUsed(nd.body, map);
            var ndArrs = obj.arr;
            map        = obj.map;
            for(n in ndArrs) { arr.push(ndArrs[n] + funblock + ndName + "()"); }
          }
          break;
      }
    }
    // console.log("listArrsUsed: " + arr);
    return {arr:arr, map:map};
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
    collectStructureStyleFacts : collectStructureStyleFacts,

    /* 1. Style Grading for Declaration and Use of Variable   */
    numDecVars                 : numDecVars,
    numUndecVars               : numUndecVars,
    numVarsUsed                : numVarsUsed,
    numVarsInFuncsUseGloVars   : numVarsInFuncsUseGloVars,
    isAnyFuncVar               : isAnyFuncVar,

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