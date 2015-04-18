//nerp
//var AST = acorn.parse(code);    // return an abstract syntax tree structure
//var ssOb = pnut.collectStructureStyleFacts(AST);    // return a analysis of style grading by checking AST

QUnit.module( "group 1" );
QUnit.test( "Test 1.a numDecVars", function( assert ) {
  var code = "assert.ok(1)";

//------------------------------------------------------------------------
// 1-a. calculate total number of declared variables in a program
//------------------------------------------------------------------------  
// Case 1:
  var code = 
         "var v;"+
          "function bar() { "+
            "var d = 0; "+
            "for(var i=0; i<10; i++) { "+
              "while(d==0) { "+
                "var n = 1; "+
              "} "+
            "} "+
          "} ";

  AST  = acorn.parse(code);
  assert.deepEqual( 4, pnut.numDecVars(AST), "1.a case 1");

  // Case 1:
  var code = "var v;"+
              "var p=\"me\";";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numDecVars(AST), "1.a case 2");

  // Case 1:
  var code = 
         "var v;"+
          "function bar() { var d = 0; } "+
          "function foo() { var d = 0; } ";

  AST  = acorn.parse(code);
  assert.deepEqual( 3, pnut.numDecVars(AST), "1.a case 3");

    // Case 1:
  var code = 
         " v=1;"+
          "function bar() { var d = 0; } "+
          "function foo() {  d = 0; } ";

  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numDecVars(AST), "1.a case 4");
});

//------------------------------------------------------------------------
// 1-b. list all declared variables in a program
//------------------------------------------------------------------------  

QUnit.test( "Test 1.c numUndecVars", function( assert ) {
//------------------------------------------------------------------------
// 1-c. calculate total number of undeclared variables 
//      that get used in a program
//------------------------------------------------------------------------  
// Case 1:
  var code =  "d = 0; ";

  AST  = acorn.parse(code);
  assert.deepEqual(1, pnut.numUndecVars(AST), "1.c Case 1");

// Case 2:
  var code = 
         "function bar() { "+
            "d = 0; "+
          "} ";

  AST  = acorn.parse(code);
  assert.deepEqual(1, pnut.numUndecVars(AST), "1.c Case 2");

// Case 3:
  var code = "function bar() { "+
            "d = 0; "+
            "for(var i=0; i<10; i++) { "+
                "a =1; "+
            "} "+
          "} ";

  AST  = acorn.parse(code);
  assert.deepEqual(2, pnut.numUndecVars(AST), "1.c Case 3");


// Case 4:
  var code = 
            "d = 0; "+
            "for(var i=0; i<10; i++) { "+
              "while(d==0) { "+
                "a =1; "+
              "} "+
            "} ";

  AST  = acorn.parse(code);
  assert.deepEqual(2, pnut.numUndecVars(AST), "1.c Case 4");

// Case 5:
  var code = 
            "d = 0; "+
            "for(var i=0; i<10; i++) { "+
                "a =1; "+
            "} ";

  AST  = acorn.parse(code);
  assert.deepEqual(2, pnut.numUndecVars(AST), "1.c Case 5");


// Case 6:
  var code = 
            "d = 0; "+
            "for(var i=0; i<10; i++) { "+
              "while(d==0) { "+
                "a =1; "+
              "} "+
            "} ";

  AST  = acorn.parse(code); 
  assert.deepEqual(2, pnut.numUndecVars(AST), "1.c Case 6");

});
//------------------------------------------------------------------------
// 1-d. list all undeclacred variables that get used in a program
//------------------------------------------------------------------------


//------------------------------------------------------------------------
// 1-e. list all variables that are used in a program
//      ex. (array) arr.push(val)
//          alert(val)
//          var num = val + 1
//          num = val + 1
//------------------------------------------------------------------------ 

QUnit.test( "Test 1.f isAnyFuncVar", function( assert ) {
//------------------------------------------------------------------------
// 1-f. exam if any function gets assigned to a variable in global level
//------------------------------------------------------------------------
//Case 1  
  var code = "function bar() { }"+
             "var f2 = bar;";
  AST  = acorn.parse(code);
  assert.ok( (true == pnut.isAnyFuncVar(AST)),  "1.f case 1");

  //Case 2
  var code = "function bar() { }"+
             "while(true) { "+
                "var f2 = bar;"+
              "} ";
  AST  = acorn.parse(code);
  assert.ok( (true == pnut.isAnyFuncVar(AST)),  "1.f case 2");
//Case 3
  var code = "function bar() { }"+
             "function foo() { var f2 = bar; }";
  AST  = acorn.parse(code);
  assert.ok( (false == pnut.isAnyFuncVar(AST)),  "1.f case 3");
  
});
//------------------------------------------------------------------------
// 1-g. list global variables in which directly points to a function
//      ex: function bar() { }
//          var f2 = bar;
//------------------------------------------------------------------------

QUnit.module( "group 2" );
QUnit.test( "Test 2.a numDecArrs", function( assert ) {
//------------------------------------------------------------------------
// 2-a. calculate total number of declared arrays in a program
//------------------------------------------------------------------------  
// Case 1
  var code = "var a, e=[], f=\"empty\"; "+
         "var b = [one, two, three]; "+
         "var c = new Array(); ";

  AST  = acorn.parse(code);
  assert.deepEqual( 3, pnut.numDecArrs(AST), "2.a case 1");

  // Case 2
  var code = 
         "while(true) { "+
            "var b = [one, two, three];"+
          "} "+
         "nerp = [one, two, three]; "+
         "var c = new Array(); ";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numDecArrs(AST), "2.a case 2");

  // Case 3
  var code = 
         "function bar() { "+
            "while(true) { "+
               "var b = [one, two, three];"+
               "nerp = [one, two, three]; "+
            "} "+
          "} "+
         "var c = new Array(); "; 

  AST  = acorn.parse(code);
  assert.deepEqual(2, pnut.numDecArrs(AST), "2.a case 3");
});
//------------------------------------------------------------------------
// 2-b. list declared arrays in a program
//      ex: 
//          var a, e=[], f="empty";
//          var b = [one, two, three];
//          var c = new Array();
//------------------------------------------------------------------------  

QUnit.test( "Test 2.c numUndecArrs", function( assert ) {
//------------------------------------------------------------------------
// 2-c. calculate total number of undeclared arrays 
//      that get used in a program
//------------------------------------------------------------------------  
// Case 1
  var code = "var a, e=[], f=\"empty\"; "+
         " z = new Array(); "+
         " b = [one, two, three]; "+
         "var c = new Array(); ";

  AST  = acorn.parse(code);
  assert.deepEqual(2, pnut.numUndecArrs(AST), "2.c case 1");

  // Case 2
  var code = 
         "while(true) { "+
            "b = [one, two, three];"+
          "} "+
         "nerp = [one, two, three]; "+
         "var c = new Array(); ";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numUndecArrs(AST), "2.c case 2");

  // Case 3
  var code = 
         "function bar() { "+
            "b = [one, two, three];"+
            "while(true) { "+
               "nerp = [one, two, three]; "+
            "} "+
          "} "+
          "bar();"
         "var c = new Array(); ";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numUndecArrs(AST), "2.c case 3");

//------------------------------------------------------------------------
// 2-d. list all undeclared arrays that get used in a program
//------------------------------------------------------------------------  
});

QUnit.test( "Test 2.e numArrsUsed", function( assert ) {
//------------------------------------------------------------------------
// 2-e. calculate total number of arrays that are used in a program
//------------------------------------------------------------------------  
// Case 1
  var code = "p.push(\"p\"); "+
       "a = [one, two, three]; "+
       "b = new Array({});"+
       "c = [];";

  AST  = acorn.parse(code);
  assert.deepEqual( 4, pnut.numArrsUsed(AST), "2.e case 1");


  // Case 2
  var code =
          "function foo() {"+
             "a = [one, two, three];"+
             "while(true){ p.push(\"p\");} "+
          "}"+
          "var c = new Array({}); "+
          "c.push(3);";

  AST  = acorn.parse(code);
  assert.deepEqual( 3, pnut.numArrsUsed(AST), "2.e case 2");
});
//------------------------------------------------------------------------
// 2-f. list all arrays that are used in a program 
//      ex:
//        p.push("p"), p.sort(), p.shift()...
//        a = [one, two, three];
//        b = new Array({});
//        c = [];
//------------------------------------------------------------------------  

QUnit.module( "group 3" );
QUnit.test( "Test 3.a numUndecArrs", function( assert ) {
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
// Case 1
var code = "var car = {name:\"Tom\", age:20};"+
       "var obj = new Object();"+
       "obj2 = new Object();"+
       "var x = new String();";

       

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numDecObjs(AST), "3.a Case 1");

// Case 2
var code = 
       //real objects
       "var inuni    = 1;"+
       "var car   = {name:\"Tom\", age:20};"+
       "var obj   = new Object();"+
       "    obj2  = new Object();"+

       //Below is pointers to existing objects
       //this should be counted
       "var steal = obj;"+
       //Shouldn't be allowed
       //dec var is pointing to 
       //illigal object
       "var steal1 = obj2;"+
       //should not be counted
       "obj3      = obj;"; //not sure if this last one should count or not...
       

  AST  = acorn.parse(code);
  assert.deepEqual(3, pnut.numDecObjs(AST), "3.a Case 2");

});
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


QUnit.test( "Test 3.c numUndecObjs", function( assert ) {
//------------------------------------------------------------------------
// 3-c. calculate total number of undeclared objects 
//      that get used in a program
//      ex:
//        (undeclared obj) objName.methodName() ==> car.name() 
//        (undeclared a)   a = { name: "A", age:20 }
//------------------------------------------------------------------------  
// Case 1
var code = 
       "var car   = {name:\"Tom\", age:20};"+
       "var obj   = new Object();"+
       "obj2      = new Object();"+
       "var steal = obj;"; //not sure if this last one should count or not...
       

  AST  = acorn.parse(code);
  assert.deepEqual(1, pnut.numUndecObjs(AST), "3.c Case 1");


var code = 
       "function bar() { "+
            "obj2      = new Object();"+
            "while(true) { "+
              "obj3      = new Object();"+
            "} "+
        "} "+

        "bar();"+
        "obj1      = new Object();"+

        "while(true) { "+
              "obj4      = new Object();"+
        "} ";

  AST  = acorn.parse(code);
  assert.deepEqual( 4, pnut.numUndecObjs(AST), "3.c Case 2");
});
//------------------------------------------------------------------------
// 3-d. list all undeclared objects that get used in a program
//      that get used in a program
//      ex:
//        (undeclared obj) objName.methodName() ==> car.name() 
//        (undeclared a)   a = { name: "A", age:20 }
//------------------------------------------------------------------------  


QUnit.test( "Test 3.e numObjsUsed", function( assert ) {
//------------------------------------------------------------------------
// 3-e. calculate total number of objects that are used in a program
//      ex:
//        objName.methodName() ==> car.name() 
//        a = { name: "A", age:20 }
//------------------------------------------------------------------------  
// Case 1
// Should return 1, bc that is the # being 'used', assigned or state altered
var code = 
       "var obj2 = new Object();"+
       "var steal = obj2;"; //not sure if this last one should count or not...
      
  AST  = acorn.parse(code);
  assert.ok( ( 1 == pnut.numObjsUsed(AST)), "3.e Case 1");
  assert.ok( true, " 3.e Case 1 expecting 1 got: "+pnut.numObjsUsed(AST));

  // Case 2
var code = 
       "var car   = {name:\"Tom\", age:20};"+ //we need to dec as var for counted as obj
       "car.name  = \"me!\";";
  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numObjsUsed(AST), "3.e Case 2");

});

//------------------------------------------------------------------------
// 3-f. list all objecs that are used in a program
//      ex:
//        a = { name: "A", age:20 }
//------------------------------------------------------------------------  


QUnit.test( "Test 3.g isAnyFuncBoundToAFuncRtnObj", function( assert ) {
//------------------------------------------------------------------------
// 3-g. identify if any function return object is bound to a function
//------------------------------------------------------------------------  

var code = 
       "function foo() {"+
         "var ob = {"+
           "someField: 5,"+
           "someFn : function () {}"+
         "};"+
         "return ob;"+
       "}";

  AST  = acorn.parse(code);
  assert.ok( ( pnut.isAnyFuncBoundToAFuncRtnObj(AST)), "3.g Case 1");

  var code = 
       "function bar() {"+
         "function inner() {}"+
         "var ob = {"+
           "someFn : inner,"+
           "someField: 5"+
         "};"+
         "return ob;"+
       "}";

  AST  = acorn.parse(code);
  assert.ok( ( pnut.isAnyFuncBoundToAFuncRtnObj(AST)), "3.g Case 2");

});


QUnit.module( "group 4" );
QUnit.test( "Test 4.a numWhileLoopsInGloLev", function( assert ) {
//------------------------------------------------------------------------
// 4-a. calculate total number of while loops in global level
//------------------------------------------------------------------------  
  // Case 1
  var code = 
        "var a = 0;"+
        "while(a<2) {"+
          "alert(a);"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numWhileLoopsInGloLev(AST), "4.a Case 1");

    // Case 2
  var code = 
        "var a = 0;"+
        "while(a<2) {"+
          "while(a<a) {"+
            "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numWhileLoopsInGloLev(AST), "4.a Case 2");

    // Case 3
  var code = 
        "var a = 0;"+
        "while(a<2) {"+
          "alert(a);"+
          "a++;"+
        "}"+

        "while(a<2) {"+
          "alert(a);"+
          "a++;"+
       "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numWhileLoopsInGloLev(AST), "4.a Case 3");

  // Case 4
  var code = 
        "var a = 0;"+
        "if(true){"+
        "  while(a<2) {"+
        "    alert(a);"+
        "  }"+
        "}";


  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numWhileLoopsInGloLev(AST), "4.a Case 4");


  // Case 5
  var code = 
        "var a = 0;"+
        "if(true){"+
        "  while(a<2) {"+
        "    while(a<a) {"+
        "      alert(a);"+
        "    }"+
        "    alert(a);"+
        "    a++;"+
        "  }"+
        "}";


  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numWhileLoopsInGloLev(AST), "4.a Case 5");

  // Case 6
  var code = 
        "var a = 0;"+
        "for(;a<2;a++) {"+
          "while(a<a){"+
            "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numForLoopsInGloLev(AST), "5.a Case 6");

});



QUnit.test( "Test 4.b numNestedWhileLoopsInGloLev", function( assert ) {
//------------------------------------------------------------------------
// 4-b. calculate total number of nested while loops in global level
//------------------------------------------------------------------------  
  // Case 1
  var code = 
        "var a = 0;"+
        "while(a<2) {"+
          "while(a<a) {"+
            "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+

        "while(a<2) {"+
          "alert(a);"+
          "a++;"+
       "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numNestedWhileLoopsInGloLev(AST), "4.b Case 1");

   // Case 2  Ask prof if want it fixed???  While loop inside for loop
  var code = 
        "var a = 0;"+
        "for(m = 0; m < a; m++) {"+
          "while(a<a) {"+
            "while(true){"+ //should be while loop nesting level of 1
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numNestedWhileLoopsInGloLev(AST), "4.b Case 2");

    // Case 3 ask prof about this too
  var code = 
        "var a = 0;"+
        "while(a<2) {"+
          "while(a<a) {"+
            "while(true){"+//nesting level of 2, 3 while loops total
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numNestedWhileLoopsInGloLev(AST), "4.b Case 3");

    // Case 5
  var code = 
        "var a = 0;"+
        "while(a<2) {"+
          "while(a<a) {"+
              "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
        "while(a<2) {"+
          "while(a<a) {"+
              "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual(2, pnut.numNestedWhileLoopsInGloLev(AST), "4.b Case 4");

});

QUnit.test( "Test 4.c numWhileLoopsInFuncs", function( assert ) {
//------------------------------------------------------------------------
// 4-c. calculate total number of for loops in functions (local level)
//------------------------------------------------------------------------  
// Case 1
  var code = 
    "function bar(){"+
        "var a = 0;"+
        "while(a<2) {"+
          "while(a<2)  {"+
            "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+

        "while(a<2)  {"+
          "alert(a);"+
          "a++;"+
        "}"+
    "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 3, pnut.numWhileLoopsInFuncs(AST), "4.c Case 1");

  // Case 2
  var code = 
    "function bar(){"+
        "var a = 0;"+
        "for(;true;){"+
          "while(a<2) {"+
            "while(a<2) {"+
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
    "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numWhileLoopsInFuncs(AST), "4.c Case 2");

  // Case 3
  var code = 
    "function bar(){"+
        "var a = 0;"+
        "while(a<2)  {"+
          "while(a<2) {"+
            "while(true) {"+
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
    "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 3, pnut.numWhileLoopsInFuncs(AST), "4.c Case 3");

    // Case 4
  var code = 
    "function bar(){"+
        "var a = 0;"+
        "while(a<2)  {"+
          "while(a<2) {"+
              "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
        "while(a<2) {"+
          "while(a<2)  {"+
              "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
    "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 4, pnut.numWhileLoopsInFuncs(AST), "4.c Case 4");

});





QUnit.test( "Test 4.d numNestedWhileLoopsInFuncs", function( assert ) {
//------------------------------------------------------------------------
// 4-d. calculate total number of nested while loops in functions (local)
//------------------------------------------------------------------------  
//Case 1
 code = 
      "foo(); "+
      "function foo() { return 5; }";
  AST  = acorn.parse(code);
  assert.deepEqual( 0, pnut.numNestedWhileLoopsInFuncs(AST), "4.d case 1");

//Case 2
  code = 
      "while(true);";
  AST  = acorn.parse(code);
  assert.deepEqual( 0, pnut.numNestedWhileLoopsInFuncs(AST), "4.d case 2");

//Case 3
  code = 
          "a =1;"+
          "b=2;"+
          "while(a<2){"+
          "    while(b<2);"+
          "}";
  AST  = acorn.parse(code);
  assert.deepEqual( 0, pnut.numNestedWhileLoopsInFuncs(AST), "4.d case 3");


//Case 4
  code = 
      "function foo() { "+
          "a =1;"+
          "b=2;"+
          "while(a<2)"+
          "    while(b<2);"+
          //"}"+
      "}";
  AST  = acorn.parse(code);
   assert.deepEqual(1, pnut.numNestedWhileLoopsInFuncs(AST), "4.d case 4");

  // Case 5
  var code = 
      "function bar(){"+
        "var a = 0;"+
        "while(a<2) {"+
          "while(a<a) {"+
            "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+

        "while(a<2) {"+
          "alert(a);"+
          "a++;"+
        "}"+
      "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numNestedWhileLoopsInFuncs(AST), "4.d Case 5");

   // Case 6  Debate
  var code = 
      "function bar(){"+
        "var a = 0;"+
        "for(m = 0; m < a; m++) {"+
          "while(a<a) {"+
            "while(true){"+
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
      "}";

  AST  = acorn.parse(code);
  assert.deepEqual(1, pnut.numNestedWhileLoopsInFuncs(AST), "4.d Case 6");


    // Case 7 Debate
  var code = 
      "function bar(){"+
        "var a = 0;"+
        "while(a<2) {"+
          "while(a<a) {"+
            "while(true){"+
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
      "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numNestedWhileLoopsInFuncs(AST), "4.d Case 7");
});


QUnit.test( "Test 4.e numNestedWhileLoopsInGloLev", function( assert ) {
//------------------------------------------------------------------------
// 4-e. calculate total number of while loops in a program
//------------------------------------------------------------------------  
  // Case 1 from 4b case 3 Ask Prof reasonable
  var code = 
        "var a = 0;"+
        "while(a<2) {"+
          "while(a<a) {"+
            "while(true){"+
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numNestedWhileLoopsInGloLev(AST), "4.e Case 1");
  assert.ok( true, " 4.e Case 1 expecting 2 got: "+pnut.numNestedWhileLoopsInGloLev(AST));

  // Case 2 ask prof
  var code = 
      "function bar(){"+
        "var a = 0;"+
        "for(m = 0; m < a; m++) {"+
          "while(a<a) {"+
            "while(true){"+
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
      "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numWhileLoopsInAProgram(AST), "4.e Case 2");

  // Case 3
  var code = 
      "function bar(){"+
        "var a = 0;"+
        "while(a<2) {"+
          "while(a<a) {"+
            "while(true){"+
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
      "}";

  AST  = acorn.parse(code);
  assert.deepEqual(3, pnut.numWhileLoopsInAProgram(AST), "4.e Case 3");

});
/******************************************************************/
/* 5. Style Grading for Use of For Loop                           */
/*    a. numForLoopsInGloLev(ast)         ==> integer >= 0        */
/*    b. numNestedForLoopsInGloLev(ast)   ==> integer >= 0        */
/*    c. numForLoopsInFuncs(ast)          ==> integer >= 0        */
/*    d. numNestedForLoopsInFuncs(ast)    ==> integer >= 0        */
/*    e. numForLoopsInAProgram(ast)       ==> integer >= 0        */
/******************************************************************/ 

QUnit.module( "group 5" );
QUnit.test( "Test 5.a numForLoopsInGloLev", function( assert ) {
//------------------------------------------------------------------------
// 5-a. calculate total number of for loops in global level
//------------------------------------------------------------------------  
  // Case 1
  var code = 
        "var a = 0;"+
        "for(;a<2;a++) {"+
          "alert(a);" +
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numForLoopsInGloLev(AST), "5.a Case 1");

    // Case 2
  var code = 
        "var a = 0;"+
        "for(;a<2;a++) {"+
          "for(;a<1;a++){"+
            "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numForLoopsInGloLev(AST), "5.a Case 2");

    // Case 3
  var code = 
        "var a = 0;"+
        "for(;a<2;a++) {"+
          "alert(a);"+
        "}"+

        "for(;a<2;a++){"+
          "alert(a);"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numForLoopsInGloLev(AST), "5.a Case 3");


  // Case 4
  var code = 
        "var a = 0;"+
        "if(true){"+
        "  for(;a<2;a++) {"+
        "    alert(a);"+
        "  }"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numForLoopsInGloLev(AST), "5.a Case 4");


  // Case 5
  var code = 
        "var a = 0;"+
        "if(true){"+
        "  for(;a<2;a++) {"+
        "    for(;a<2;a++){"+
        "      alert(a);"+
        "    }"+
        "    alert(a);"+
        "    a++;"+
        "  }"+
        "}";


  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numWhileLoopsInGloLev(AST), "4.a Case 5");

  // Case 6
  var code = 
        "var a = 0;"+
        "while(a<a){"+
          "for(;a<1;a++){"+
            "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numForLoopsInGloLev(AST), "5.a Case 6");


});

QUnit.test( "Test 5.b numNestedForLoopsInGloLev", function( assert ) {
//------------------------------------------------------------------------
// 5-b. calculate total number of nested for loops in global level
//------------------------------------------------------------------------  
// Case 1
  var code = 
        "var a = 0;"+
        "for(;a<2;a++) {"+
          "for(;a<1;a++) {"+
            "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+

        "for(;a<2;a++) {"+
          "alert(a);"+
          "a++;"+
       "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numNestedForLoopsInGloLev(AST), "5.b Case 1");

  // Case 2 Debate
  var code = 
        "var a = 0;"+
        "while(true) {"+
          "for(;a<2;a++) {"+
            "for(;a<2;a++){"+
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual(1, pnut.numNestedForLoopsInGloLev(AST), "5.b Case 2");

  // Case 3 Debate
  var code = 
        "var a = 0;"+
        "for(;a<2;a++) {"+
          "for(;a<a;a++) {"+
            "for(;true;){"+
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual(2, pnut.numNestedForLoopsInGloLev(AST), "5.b Case 3");
 

    // Case 4
  var code = 
        "var a = 0;"+
        "for(;a<a;a++) {"+
          "for(;a<a;a++){"+
              "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
        "for(;a<a;a++){"+
          "for(;a<a;a++) {"+
              "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}";

  AST  = acorn.parse(code);
  assert.deepEqual(2, pnut.numNestedForLoopsInGloLev(AST), "5.b Case 4");

});



QUnit.test( "Test 5.c numForLoopsInFuncs", function( assert ) {
//------------------------------------------------------------------------
// 5-c. calculate total number of for loops in functions (local level)
//------------------------------------------------------------------------  
// Case 1
  var code = 
    "function bar(){"+
        "var a = 0;"+
        "for(;a<2;a++) {"+
          "for(;a<1;a++) {"+
            "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+

        "for(;a<1; a++) {"+
          "alert(a);"+
          "a++;"+
        "}"+
    "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 3, pnut.numForLoopsInFuncs(AST), "5.c Case 1");

  // Case 2
  var code = 
    "function bar(){"+
        "var a = 0;"+
        "while(true) {"+
          "for(;a<2;a++) {"+
            "for(;a<2;a++){"+
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
    "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numForLoopsInFuncs(AST), "5.c Case 2");

  // Case 3
  var code = 
    "function bar(){"+
        "var a = 0;"+
        "for(;a<2;a++) {"+
          "for(;a<a;a++) {"+
            "for(;true;){"+
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
    "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 3, pnut.numForLoopsInFuncs(AST), "5.c Case 3");

    // Case 4
  var code = 
    "function bar(){"+
        "var a = 0;"+
        "for(;a<a;a++) {"+
          "for(;a<a;a++){"+
              "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
        "for(;a<a;a++){"+
          "for(;a<a;a++) {"+
              "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
    "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 4, pnut.numForLoopsInFuncs(AST), "5.c Case 4");

});



QUnit.test( "Test 5.d numNestedForLoopsInFuncs", function( assert ) {
//------------------------------------------------------------------------
// 5-d. calculate total number of nested for loops in functions (local)
//------------------------------------------------------------------------  
//Case 1
 code = 
      "foo(); "+
      "function foo() { return 5; }";
  AST  = acorn.parse(code);
  assert.deepEqual( 0, pnut.numNestedForLoopsInFuncs(AST), "5.d case 1");

//Case 2
  code = 
      "for(i = 0; i < 2; i++);";
  AST  = acorn.parse(code);
  assert.deepEqual( 0, pnut.numNestedForLoopsInFuncs(AST), "5.d case 2");

//Case 3
  code = 
      "for(i = 0; i < 2; i++){"+
          "for(j = 0; j < 2; j++);"+
      "}";
  AST  = acorn.parse(code);
  assert.deepEqual( 0, pnut.numNestedForLoopsInFuncs(AST), "5.d case 3");


//Case 4
  code = 
      "function foo() { "+
          "for(i = 0; i < 2; i++)"+
          " for(j = 0; j < 2; j++);"+
      "}";
  AST  = acorn.parse(code);
   assert.deepEqual(1, pnut.numNestedForLoopsInFuncs(AST), "5.d case 4");

   // Case 5
  var code = 
      "function bar(){"+
        "var a = 0;"+
        "for(i = 0; i < 2; i++) {"+
          "for(j = 0; j < 2; j++){"+
            "alert(a);"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+

        "for(i = 0; i < 2; i++) {"+
          "alert(a);"+
          "a++;"+
        "}"+
      "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numNestedForLoopsInFuncs(AST), "5.d Case 5");

   // Case 6  Debate
  var code = 
      "function bar(){"+
        "var a = 0;"+
        "while(a<a) {"+
          "for(m = 0; m < a; m++) {"+
            "for(; true; ) {"+
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
      "}";

  AST  = acorn.parse(code);
  assert.deepEqual(1, pnut.numNestedForLoopsInFuncs(AST), "5.d Case 6");


    // Case 7 Debate
  var code = 
      "function bar(){"+
        "var a = 0;"+
        "for(m = 0; m < a; m++)  {"+
          "for(n = 0; n < a; n++)  {"+
            "for(; true;) {"+
              "alert(a);"+
            "}"+
          "}"+
          "alert(a);"+
          "a++;"+
        "}"+
      "}";

  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numNestedForLoopsInFuncs(AST), "5.d Case 7");

});


QUnit.test( "Test 5.e numForLoopsInAProgram", function( assert ) {
//------------------------------------------------------------------------
// 5-e. calculate total number of for loops in a program
//------------------------------------------------------------------------  
//Case 1
 code = 
      "foo(); "+
      "function foo() { return 5; }";
  AST  = acorn.parse(code);
  assert.deepEqual( 0, pnut.numForLoopsInAProgram(AST), "5.e case 1");

//Case 2
  code = 
      "for(i = 0; i < 2; i++);";
  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numForLoopsInAProgram(AST), "5.e case 2");

//Case 3
  code = 
      "for(i = 0; i < 2; i++){"+
          "for(j = 0; j < 2; j++);"+
        "}";
  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numForLoopsInAProgram(AST), "5.e case 3");

//Case 4
  code = 
      "function foo() { "+
          "for(i = 0; i < 2; i++){"+
          " for(j = 0; j < 2; j++);"+
          "}"+
      "}";
  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numForLoopsInAProgram(AST), "5.e case 4");

//Case 5
  code = 
      "function foo() { "+
          "for(i = 0; i < 2; i++){}"+
          "for(j = 0; j < 2; j++){}"+
      "}";
  AST  = acorn.parse(code);
  assert.deepEqual( 2, pnut.numForLoopsInAProgram(AST), "5.e case 5");
});

QUnit.module( "group 6" );
QUnit.test( "Test 6.a numDecFuncs", function( assert ) {
//------------------------------------------------------------------------
// 6-a. calculate the number of declared functions in global level:
//------------------------------------------------------------------------
  //Case 1
  var code = 
          "function a() {}"+
          "var a = function() {}";

  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numDecFuncs(AST), "6.a case 1");


  //Case 2
  code = 
      "function foo(a) {"+
            "function bar() {}"+
      "}";
  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numDecFuncs(AST), "6.a case 2");


  //Case 3
  var code = 
          "if(true) function a() {}";

  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numDecFuncs(AST), "6.a case 3");


  //Case 4
  code = 
      "for( i = 0; i < 10; i++){"+
          "function foo() {};"+
      "}";
  AST  = acorn.parse(code);
  assert.deepEqual( 1, pnut.numDecFuncs(AST), "6.a case 4");

});

//------------------------------------------------------------------------
// 6-b. list all declared functions in global level with occuring number:
//      ex:
//        function a() {}
//        function b(x) {}
//        function b(x, y) {}
//        var a = function() {}
//------------------------------------------------------------------------


QUnit.test( "Test 6.c areCallExpsAllValid", function( assert ) {

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

//case 1
  var code = 
      "function myMain() { return 5; }"+
      "myMain();";
  AST  = acorn.parse(code);
  assert.ok( ( true == pnut.areCallExpsAllValid(AST)), "6.c case 1");

//case 2 Fixed over weekend
  code = 
      "function myMain() { return 5; }"+
      "foo();";
  AST  = acorn.parse(code);
  assert.ok( ( false == pnut.areCallExpsAllValid(AST)), "6.c case 2");

//case 3
  code = 
      "foo(); "+
      "function foo() { return 5; }";
  AST  = acorn.parse(code);
  assert.ok( ( false == pnut.areCallExpsAllValid(AST)), "6.c case 3");

//case 4
  var code = 
      "function myMain(x) { return x; }"+
      "myMain();";
  AST  = acorn.parse(code);
  assert.ok( ( false == pnut.areCallExpsAllValid(AST)), "6.c case 4");


});


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



QUnit.test( "Test 6.e areDecFuncsCalled", function( assert ) {
//------------------------------------------------------------------------
// 6-e. exam all declared functions get called in a program
//      * the number that a function gets called is regardless
//      ex: function bar() { return 5; }
//          function foo() { return 5; }
//          bar(); bar();
//          foo(); foo();
//------------------------------------------------------------------------

 //Case 1.
  var code = 
                  "function bar() { return 5; }"+
                  "function foo() { return 5; }"+
                  "bar();"+
                  "foo();";

  AST  = acorn.parse(code);
  assert.ok( ( true == pnut.areDecFuncsCalled(AST)), "6.e case 1");
  //Case 2.
   code = 
                  "function bar() { return 5; }"+
                  "function foo() { return 5; }"+
                  "bar();"+
                  "bar();"+
                  "foo();";

  AST  = acorn.parse(code);
  assert.ok( ( true == pnut.areDecFuncsCalled(AST)), "6.e case 2");

  //Case 3.
   code = 
                  "function bar() { return 5; }"+
                  "function foo() { foo(); }"+
                  "bar();";

  AST  = acorn.parse(code);
  assert.ok( ( true == pnut.areDecFuncsCalled(AST)), "6.e case 3");


  //Case 4.
   code = 
                  "function bar() { foo(); }"+
                  "function foo() { return 5; }"+
                  "bar();";

  AST  = acorn.parse(code);
  assert.ok( ( true == pnut.areDecFuncsCalled(AST)), "6.e case 4");


   //Case 5. 
   code = 
                  "function bar() { return 5; }"+
                  "function foo() { bar(); }"+
                  "bar();";

  AST  = acorn.parse(code);
  assert.ok( ( false == pnut.areDecFuncsCalled(AST)), "6.e case 5");

 //Case 6.
  code = 
                  "function bar() { return 5; }"+
                  "function foo() { return 5; }"+
                  "foo();";

  AST  = acorn.parse(code);
  assert.ok( ( false == pnut.areDecFuncsCalled(AST)), "6.e case 6");

   //Case 7.
  code = 
                  "function bar() { return 5; }"+
                  "function foo() { return 5; }";

  AST  = acorn.parse(code);
  assert.ok( ( false == pnut.areDecFuncsCalled(AST)), "6.e case 7");

});



QUnit.test( "Test 6.f areDecFuncsCalledOnce", function( assert ) {
//------------------------------------------------------------------------
// 6-f. exam all declared functions get called exactly once in a program
//      ex: function bar() { return 5; }
//          function foo() { return 5; }
//          bar();
//          foo();
//------------------------------------------------------------------------
 //Case 1.
  var code = 
                  "function bar() { return 5; }"+
                  "function foo() { return 5; }"+
                  "bar();"+
                  "foo();";

  AST  = acorn.parse(code);
  assert.ok( ( true == pnut.areDecFuncsCalledOnce(AST)), "6.f case 1");
  //Case 2.
   code = 
                  "function bar() { return 5; }"+
                  "function foo() { return 5; }"+
                  "bar();"+
                  "bar();"+
                  "foo();";

  AST  = acorn.parse(code);
  assert.ok( ( false == pnut.areDecFuncsCalledOnce(AST)), "6.f case 2");

  //Case 3.
   code = 
                  "function bar() { return 5; }"+
                  "function foo() { foo(); }"+
                  "bar();"+
                  "foo();";

  AST  = acorn.parse(code);
  assert.ok( ( false == pnut.areDecFuncsCalledOnce(AST)), "6.f case 3");


  //Case 4.
   code = 
                  "function foo() { return 5; }"+
                  "function bar() { foo(); }"+
                  "bar();"+
                  "foo();";

  AST  = acorn.parse(code);
  assert.ok( ( false == pnut.areDecFuncsCalledOnce(AST)), "6.f case 4");


   //Case5.
   code = 
                  "function bar() { return 5; }"+
                  "function foo() { bar(); }"+
                  "foo();";

  AST  = acorn.parse(code);
  assert.ok( ( true == pnut.areDecFuncsCalledOnce(AST)), "6.f case 5");

});


QUnit.test( "Test 6.g isAnyFuncReturnObj", function( assert ) {
//------------------------------------------------------------------------
// 6-g. exam if any function is a pass-by-reference function or not
//      I don't understand what this means...
//      ex: CORRECT: function bar(x) { return x; }
//          WRONG:   funciton bar()  { return 5; }
//------------------------------------------------------------------------
 //Case 1.
  var code = 
                  "function foo() {"+
                     "var ob = { a:3, b:5 };"+
                     "return ob;"+
                  "}";

  AST  = acorn.parse(code);
  assert.ok( ( true == pnut.isAnyFuncReturnObj(AST)), "6.g case 1");

 //Case 2.
  code = 
                  "function foo(x) {"+
                     "if (x==1) return 1;"+
                     "return x*foo(x-1);"+
                  "}";

  AST  = acorn.parse(code);
  assert.ok( ( false == pnut.isAnyFuncReturnObj(AST)), "6.g case 2");

   //Case 3.
  var code = "function bar(x) { return x; }";

  AST  = acorn.parse(code);
  assert.ok( ( true == pnut.isAnyFuncReturnObj(AST)), "6.g case 3");

 //Case 4.
  code =  "function bar() { return 5; }";

  AST  = acorn.parse(code);
  assert.ok( ( false == pnut.isAnyFuncReturnObj(AST)), "6.g case 4");

});

QUnit.module( "group 7" );
QUnit.test( "Test 7.a isRecuriveFunction", function( assert ) {
//------------------------------------------------------------------------------
// 7-a. exam if a function is recursive or not by checking its return statement
//------------------------------------------------------------------------------
  //Case 1.
  var code = 
                  "function myMain() {"+
                     "var x = foo(3);"+
                     "alert(x);"+
                  "}"+

                  "function foo(x) {"+
                     "if (x==1) return 1;"+
                     "return x*foo(x-1);"+
                  "}"+
                  "myMain();";

  AST  = acorn.parse(code);
  assert.ok( ( true == pnut.isRecuriveFunction(AST)), "7.a case 1");

  // Case 2
  code = 
                  "function myMain() {"+
                     "var x = foo(3);"+
                     "alert(x);"+
                  "}"+

                  "function foo(x) {"+
                     "var prod=1;"+
                     "for (var i=x; i>1; i--) { prod *= i; }"+
                     "return prod;"+
                  "}"+
                  "myMain();";

  AST  = acorn.parse(code);
  assert.ok( ( false == pnut.isRecuriveFunction(AST)), "7.a case 2");
  
  //case 3
  code = 
                  "function rec(x) {"+
                     "return rec(x)"+
                  "}";

  AST  = acorn.parse(code);
  assert.ok( ( true == pnut.isRecuriveFunction(AST)), "7.a case 3");
  
  //case 4
  code = 
                  "function rec(x) {"+
                    "if(true){"+
                        "return rec(x);"+
                    "}else{"+
                        "return 1;"+
                    "}"+
                  "}";

  AST  = acorn.parse(code);
  assert.ok( ( true == pnut.isRecuriveFunction(AST)), "7.a case 4");

  //case 5
  code = 
                  "function rec(x) {"+
                    "if(true){"+
                        "return 1;"+
                    "}else{"+
                        "return rec(x);"+
                    "}"+
                  "}";

  AST  = acorn.parse(code);
  assert.ok( ( true == pnut.isRecuriveFunction(AST)), "7.a case 5");

  //case 6
  code = 
                  "function rec(x) {}"+
                  "function rec()  { return rec(x); }";

  AST  = acorn.parse(code);
  assert.ok( ( false == pnut.isRecuriveFunction(AST)), "7.a case 6");


});
