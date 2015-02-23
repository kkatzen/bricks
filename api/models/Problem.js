/**
 * Assignment
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  
    type: {
        type: 'string', //twit(Type what I Type), diy(Do It Yourself), wall(traditional sized program assignment), exam(no help allowed)
        notEmpty: true,
        required: true
    },
    phase: {
        type: 'integer', //0=past, 1=present, 2=future 
        required: true
    },
    num: {
        type: 'integer', //denotes order the question appears in the assignments list
        required: true
    },
  	name: {
        type: 'string', //print name for use in visible interface
        notEmpty: true,
        required: true
    },
    language: {
        type: 'string',
    },
    folder: {
        type: 'string', //id of containing folder, if not designated, this problem is hidden
        notEmpty: true,
        required: true
    },
    text: {
        type: 'string', //long problem description and correctness/type detail
        notEmpty: true,
        required: true
    },
    value: {
        type: 'json', // points possible to earn ex. { correct:1, style:1 }
        required: true
    },
	onSubmit: 'string' // text of a function that decides the correctness of the submission
						// isCorrect( code /* function */, semanticData /* json */, solution /* json */ )
    
  }
};
