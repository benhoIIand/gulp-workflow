/* global jest:true */
jest.mock('fs');
jest.mock('gulp-help', () => jest.fn(() => 'gulpHelp'));
jest.mock('gulp-load-plugins', () => jest.fn(() => 'gulpLoadPlugins'));
jest.mock('task', () => jest.fn());
jest.mock('yargs');
jest.unmock('../index');

const path = require('path');

describe('when loading a workflow', () => {

    let workflow, gulpHelp, args;

    beforeEach(() => {
        args = require('yargs').argv;
        gulpHelp = require('gulp-help');
        workflow = require('../index');
    });

    describe('and no instance of gulp is passed', () => {

        it('should throw an error', () => {
            expect(() => {
                workflow.load();
            }).toThrow(new Error('An instance of gulp must be provided!'));
        });
    });

    it('should run the instance of gulp through gulp help', () => {
        workflow.load({ gulp: true });

        expect(gulpHelp).toBeCalledWith({ gulp: true });
    });

    it('should load each task in the gulp directory', () => {
        require('fs').__setMockFiles({
            [path.resolve(process.cwd(), './__mocks__/gulp/task.js')]: 'console.log()'
        });

        const mockTask = require('../__mocks__/gulp/task');

        workflow.load({});

        // expect(1).toEqual(2);
        expect(mockTask).toBeCalledWith(workflow, 'gulpHelp', 'gulpLoadPlugins', { args });
    });

    it('should return the workflow module', () => {
        expect(workflow.load({})).toEqual(workflow);
    });
});
