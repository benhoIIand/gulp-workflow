# workflow
> A simple, opinionated tool to manage your Gulp workflow

Workflow is here to help with standardising Gulp setups across multiple projects. It surfaces the main workflow tasks in a clean and concise manner making it simple for people to compile those applications.

## Setup
Your `gulpfile.js` should only contain the main tasks that you should be run by yourself, contributors or CI environments. These are called `tasks`. These `tasks` can then run a series of other `tasks` or `subtasks`. `Subtasks` are more granular tasks that do one simple thing. The `subtasks` you pass to a given `task` are run through [`run-sequence`](https://www.npmjs.com/package/run-sequence) allowing you to run them in series or parallel.

`workflow` has it's own ideas about where tasks should live.

```
+-- gulp
|   +-- config
|   |   +-- gulp.conf.js
|   +-- eslint.js
|   +-- build-js.js
|   +-- build-css.js
+-- package.json
+-- gulpfile.js
```
The `config` folder is where you can store configurations needed for your `tasks`, i.e. `webpack.conf.js`. If a `gulp.conf.js` file is present, then `workflow` will pick that up and pass it back to your `tasks`.

```javascript
// gulpfile.js

// Import `workflow` into your `gulpfile`
const gulp = require('gulp');
const workflow = require('gulp-workflow');

// Load `workflow`, passing it your projects instance of `gulp`
workflow
    .load(gulp)
    .task('lint', 'Run all linters.', ['eslint'])
    .task('build', 'Build the application.', ['clean', ['build:js', 'build:css']])
    .task('ci', 'Lint, test and build the application.', ['lint', 'build', 'test'])
    .task('test', 'Run unit tests.', ['test:unit', 'test:e2e']);
```

```javascript
// gulp/lint.js

// Subtasks are passed four arguments.
// The `$` is an object of available gulp plugins via gulp-load-plugins
// The config is whatever is in the `gulp.conf.js` file merged with any arguments
module.exports = (workflow, gulp, $, config) => {
    workflow.subtask('eslint', () =>
        gulp.src('**/*.js')
            .pipe($.eslint())
            .pipe($.eslint.format())
            .pipe($.if(config.env.ci, $.eslint.failAfterError()))
    );
};
```

## Usage

#### Configuration
As mentioned before, you can create an optional `gulp.conf.js` file in the `config` folder. This file needs to export a plain object.

```javascript
// gulp.conf.js

module.exports = {
    name: "Project Name",
    appDir: "./some/path"
};
```

#### Arguments
You may want to pass arguments to your tasks, i.e. `gulp build --release`. Any arguments will be merged with the configuration object and passed back to each task.

```javascript
// gulp.conf.js

module.exports = {
    name: "Project Name",
    appDir: "./some/path",
    args: {
        release: true
    }
};
```

#### Running tasks
It's no different than using `gulp`.

```bash
gulp lint    // Will run the lint task
gulp build   // Will run the build task
```

You get a `help` task for free. It will display a list of the available tasks. Only the `tasks` will be displayed, keeping the `subtasks` hidden.

```bash
Usage
  gulp [TASK] [OPTIONS...]

Available tasks
  build  Build the application.
  ci     Lint, test and build the application.
  help   Display this help text.
  lint   Run all linters.
  test   Run unit tests.
```

#### Running subtasks
Again, they're just ordinary `gulp` tasks so you can run them individually, i.e. `gulp eslint`

## API

#### load(gulp)
Requires an instance of `gulp`. Loads the subtasks present in the `gulp` folder.

#### task(name, description, [tasks], args || [options])
Takes a name, description, array of tasks to run when called and an object containing any arguments that can be passed. The array of tasks is passed to [`run-sequence`](https://www.npmjs.com/package/run-sequence) so can support their syntax.

Alternatively, you can pass it an object of `options` which use the same arguments as keys.

#### subtask(name, dependencies, func)
Takes a name, any dependencies and array of tasks to run when called. This functions in exactly the same way as a normal `gulp` task.

## Debugging

To make sure your tasks are being loaded correctly, you can run any gulp command with a `debug` flag

    gulp lint --debug

## License

MIT © [Ben Holland](https://benholland.me)
