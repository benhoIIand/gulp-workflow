/* global jest:true */
jest.mock('gulp-help');
jest.mock('gulp-load-plugins', () => jest.fn(() => 'gulpLoadPlugins'));
jest.mock('run-sequence');
jest.mock('yargs');
jest.unmock('../index');

describe('when registering a workflow task', () => {

    let gulpInstance, runSequence, workflow, applySpy, taskSpy;

    beforeEach(() => {
        applySpy = jest.fn();
        taskSpy = jest.fn();

        jest.setMock('gulp-help', () => ({
            task: taskSpy
        }));

        gulpInstance = require('gulp-help')();
        runSequence = require('run-sequence');
        runSequence.use.mockReturnValue({
            apply: applySpy
        });

        workflow = require('../index');
        workflow.load({});
    });

    describe('when passed an object', () => {

        it('should register a new task with its instance of gulp, passing in the sequence of subtasks', () => {
            workflow.task({
                name: 'name',
                description: 'description',
                subtasks: [1, 2, 3],
                args: {
                    test: 'arg'
                }
            });

            expect(taskSpy).toBeCalledWith('name', 'description', jasmine.any(Function), {
                options: {
                    test: 'arg'
                }
            });
        });
    });

    describe('when passed single arguments', () => {

        it('should register a new task with its instance of gulp, passing in the sequence of subtasks', () => {
            workflow.task('name', 'description', [1, 2, 3], {
                test: 'arg'
            });

            expect(taskSpy).toBeCalledWith('name', 'description', jasmine.any(Function), {
                options: {
                    test: 'arg'
                }
            });
        });
    });

    it('should pass the subtasks to run sequence', () => {
        workflow.task('name', 'description', [1, 2, 3], {
            test: 'arg'
        });

        taskSpy.mock.calls[0][2]('done');

        expect(runSequence.use).toBeCalledWith(gulpInstance);
        expect(applySpy).toBeCalledWith(jasmine.any(Function), [1, 2, 3, 'done']);
    });

    it('should return the workflow module', () => {
        expect(workflow.task()).toEqual(workflow);
    });
});
