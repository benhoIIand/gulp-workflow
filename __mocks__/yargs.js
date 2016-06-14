/* global jest:true */
const yargs = jest.genMockFromModule('yargs');

yargs.argv = {
    directory: '__mocks__/gulp'
};

module.exports = yargs;
