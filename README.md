Bricks
======

This is an environment for students in introductory programming classes to write small programs and have them graded automatically.

## Instructions
### Dependencies
1. NodeJS
2. MongoDB
3. SailsJS

### Installation instructions
1. clone this repo
2. `npm install`
3. `sails lift`

## Documentation
### Database
The database is called `Bricks`. There are four collections: `folders`, `problems`, and `submissions`.
####Folders
This collection contains all the folders listed in the following format:
name: "Folder Name"
fnum: 20
id: randomly generated
#### Problems
This collection contains all the assignments listed in the following format:
```javascript
{
  type: "twit",     // in-class brick, Type What I Type
  // type: "diy",   // brick you do after class, Do It Yourself
  // type: "wall",  // more traditional sized program assignment
  // type: "exam",  // no help allowed on this one
  pnum: 30, // a number to denote the order the question appears in the assignments list
  name: "Assignment Name", // print name for use in visible interface
  folder: 20, // if you don't designate an existing folder, question will be hidden.
  text: "Long problem description and correctness/stype detail",
  value: { correct:1, style:1 }, // points possible to earn
  solution: {
    code: [ // each string in the array is a JavaScript program that solves the problem
      "function myMain() { ... }\n myMain();",
      "function foo() { ... }\n foo();"
    ],
    data: [ // Each object in the array is an I/O test case for functional correctness
      {
        input: ["input", 22], // array of items given to the prompt() function, in sequence.
        output: ["output"]    // array of items to be displayed by alert(). Order does not matter.
      },
      {
        input: [],
        output: ["Hello, world!"]
      }
    ]
  }
  style: "function checker() { ... }" // style checker function using node asserts 
                                      // and parser API calls 
}
```
#### submissions
This collection contains all the student submissions to the problems.
```javascript
{
  user: "j.q.onyen",
  pnum: 20,  // unique problem num field
  type: 10,  // type of problem
  timestamp: <date>,
  code: "//Code submitted to be run\nalert("Hello!");",
  style: { nTFD: 0, ... }, // All the data returned from style checker
  value: { correct:1, style:1 } 

  // error: { ... list of style items not passed } // not completely designed yet

  // <obj>, maybe save the style object sent over from the parser?
  // or maybe not since we can recreate it... 
  // might want to put the parser module into the server just to have it able 
  // to do what the client side can do?

}
```
