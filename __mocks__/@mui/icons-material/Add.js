const React = require("react");
function Add(props) {
  return React.createElement("span", { "data-testid": "icon-add", ...props }, "Add");
}
module.exports = { __esModule: true, default: Add };
