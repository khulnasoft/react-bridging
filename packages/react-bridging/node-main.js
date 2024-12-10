/* eslint-env node */

if (process.env.NODE_ENV === "production") {
  module.exports = require("./umd/react-bridging.production.min.js");
} else {
  module.exports = require("./umd/react-bridging.development.js");
}
