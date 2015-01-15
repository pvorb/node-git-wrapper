// imports
var spawn = require('child_process').spawn;

// Class Git
var Git = module.exports = function (options) {
  this.binary = 'git';
  if (typeof options == 'undefined')
    options = {};

  this.cwd = options.cwd || process.cwd();
  delete options.cwd;

  this.args = Git.optionsToArray(options);
};

// git.exec(command [[, options], args ], callback)
Git.prototype.exec = function (command, options, args, callback) {
  callback = arguments[arguments.length - 1];

  if (arguments.length == 2) {
    options = {};
    args = [];
  } else if (arguments.length == 3) {
    args = arguments[1];
    options = {};
  }

  // Put all the args and options together and send as one array to spawn.
  var cmdArgs = this.args
      .concat(command)
      .concat(Git.optionsToArray(options))
      .concat(args);

  this.spawnCommand(this.binary, cmdArgs, callback);
};

/**
 * Spawns command
 *
 * @param {string} binary
 * @param {Array} cmdArgs
 * @param {function} callback
 */
Git.prototype.spawnCommand = function(binary, cmdArgs, callback) {
  var gitproc = spawn(binary, cmdArgs, { cwd: this.cwd }),
      output = '',
      errorOutput = '';

  // collect stdout
  gitproc.stdout.on('data', function(data) {
    output += data;
  });

  // collect stderr
  gitproc.stderr.on('data', function(data) {
    errorOutput += data;
  });

  gitproc.on('close', function(code) {
    if (code === 0) {
      callback(null, output);
    }
    else {
      callback(new Error(errorOutput), output);
    }
  });

  gitproc.on('error', function(err) {
    callback(err);
  });
};

// converts an object that contains key value pairs to a args array suitable for child_process.spawn
Git.optionsToArray = function (options) {
  var args = [];

  for (var k in options) {
    var val = options[k];

    if (k.length == 1) {
      // val is true, add '-k'
      if (val === true)
        args.push('-'+k);
      // if val is not false, add '-k val'
      else if (val !== false)
        args.push('-'+k+' '+val);
    } else {
      if (val === true)
        args.push('--'+k);
      else if (val !== false)
        args.push('--'+k+'='+val);
    }
  }
  return args;
};
