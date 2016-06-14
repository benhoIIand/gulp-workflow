/* global jest:true */
jest.mock('gulp-help');
jest.mock('gulp-load-plugins', () => jest.fn(() => 'gulpLoadPlugins'));
jest.mock('yargs');
jest.unmock('../index');

describe('when registering a workflow subtask', () => {

    let workflow, taskSpy;

    beforeEach(() => {
        taskSpy = jest.fn();

        jest.setMock('gulp-help', () => ({
            task: taskSpy
        }));

        workflow = require('../index');
        workflow.load({});
    });

    it('should call task on the internal gulp instance with the correct parameters', () => {
        workflow.subtask('name', 'arg1', 'arg2', 'arg3');

        expect(taskSpy).toBeCalledWith('name', false, 'arg1', 'arg2', 'arg3');
    });

    it('should return the workflow module', () => {
        expect(workflow.subtask()).toEqual(workflow);
    });
});
