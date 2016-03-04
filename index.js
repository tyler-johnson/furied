#!/usr/bin/env node
const user = process.env.GEMFURY_USER || process.argv[2];
const key = process.env.GEMFURY_API_KEY || process.argv[3];

if (!key || !user) {
  throw new Error('gem fury api key or user missing');
}

const _exec = require('child_process').exec;
const promisify = require("es6-promisify");
const path = require('path');

const exec = promisify(_exec, function(err, res) {
	if (err) this.reject(err);
	else this.resolve(Array.isArray(res) ? res[0] : res);
});

// const unlink = require('fs').unlink;
const cwd = process.cwd();
const pkg = require(path.join(cwd, 'package.json'));

if (!pkg.version) {
  throw new Error("Missing package version.");
}

// copied from https://github.com/npm/npm/blob/33ad728dfd7b81fcfd5b8ecc0609a582a4a57567/lib/pack.js#L51-L54
// scoped pkgs get special treatment
var name = pkg.name;
if (name[0] === '@') name = name.substr(1).replace(/\//g, '-');
const file = name + '-' + pkg.version + '.tgz';

const options = { cwd };
const pack = () => exec('npm pack', options);
const publish = () => exec(`curl -F package=@${file} https://${key}@push.fury.io/${user}/`, options);

pack()
.then(() => publish())
.then(() => console.log(`
  ${pkg.name} published on gemfury
  enjoy the rest of your day :)
`))
.catch((e) => {
  console.error(e.stack || e);
  process.exit(1);
});
