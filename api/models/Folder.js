/**
 * Folder
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
  	
  	name: {
        type: 'string',
        notEmpty: true,
        required: true
    },
    num: {
        type: 'integer',
        notNull: true,
        required: true
    }
  }

};
