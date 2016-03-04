#!/usr/bin/env node
const user = process.env.GEMFURY_USER || process.argv[2];
const key = process.env.GEMFURY_API_KEY || process.argv[3];

if (!key || !user) {
  throw new Error('gem fury api key or user missing');
}

const exec = require('child_process').exec;
const unlink = require('fs').unlink;
const path = require('path');
const cwd = process.cwd();
const package = require(path.join(cwd, 'package.json'));

// copied from https://github.com/npm/npm/blob/33ad728dfd7b81fcfd5b8ecc0609a582a4a57567/lib/pack.js#L51-L54
// scoped packages get special treatment
var name = package.name;
if (name[0] === '@') name = name.substr(1).replace(/\//g, '-');
const file = name + '-' + package.version + '.tgz';

const options = { cwd };
const pack = done => exec('npm pack', options, done);
const publish =
  done => exec(`curl -F package=@${file} https://${key}@push.fury.io/${user}/`, options, done);
const clean = done => unlink(path.join(cwd, file), done);
const finishMsg = () => console.log(`
  ${package.name} published on gemfury
  enjoy the rest of your day :)
`);

pack(publish(clean(finishMsg)));
