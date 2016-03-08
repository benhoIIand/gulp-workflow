/* eslint no-console:0 */
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import gulpHelp from 'gulp-help';
import yargs from 'yargs';
import runSequence from 'run-sequence';
import loadPlugins from 'gulp-load-plugins';

const CWD = process.cwd();
const GULP_DIR = path.resolve(`${CWD}/gulp`);
const GULP_CONFIG = path.resolve(`${GULP_DIR}/config/gulp.conf.js`);

const $ = loadPlugins({
    config: path.resolve(`${CWD}/package.json`)
});
const config = Object.assign({}, require(GULP_CONFIG) || {}, { args: yargs.argv });

let gulp;

export function load(_gulp) {
    if (!_gulp) {
        throw new Error('An instance of gulp must be provided!');
    }

    gulp = gulpHelp(_gulp);

    fs.readdirSync(GULP_DIR).forEach((file) => {
        if ((/.js$/).test(file)) {
            const filepath = `${GULP_DIR}/${file.split('.')[0]}`;

            log(chalk.magenta.bold('Loading file:', filepath));
            require(filepath)(this, gulp, $, config);
            log(chalk.green.bold('Loaded file:', filepath));
        }
    });

    return this;
}

export function task(name, description, subtasks) {
    log(chalk.magenta.bold('Loading task:', name));
    gulp.task(name, description, (done) => runSequence.use(gulp).apply(runSequence, subtasks.concat([done])));
    log(chalk.green.bold('Loaded task:', name));

    return this;
}

export function subtask(name, ...args) {
    log(chalk.magenta.bold('Loading subtask:', name));
    gulp.task.apply(gulp, [name, false].concat(args));
    log(chalk.green.bold('Loaded task:', name));

    return this;
}

function log(msg) {
    if (config.args.debug) {
        console.log(msg);
    }
}

export default {
    load,
    task,
    subtask
};
