/* eslint-env node */

if (process.env.NODE_ENV === "production") {
  module.exports = require("./umd/react-bridging-dom.production.min.js");
} else {
  module.exports = require("./umd/react-bridging-dom.development.js");
}
