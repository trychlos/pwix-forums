// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by forums.js.
import { name as packageName } from "meteor/pwi:forums";

// Write your tests here!
// Here is an example.
Tinytest.add('forums - example', function (test) {
  test.equal(packageName, "forums");
});
