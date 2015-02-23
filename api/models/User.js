/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    username: {
        type: 'string',
        required: true,
        notEmpty: true,
        unique: true
    },
    displayName: {
        type: 'string',
        required: true
    },
    admin: {
        type: 'boolean',
    },
    latestCode: {
        type: 'string',
        required: true
    }
  }
};
