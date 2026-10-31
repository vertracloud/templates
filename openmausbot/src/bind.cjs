// The server hardcodes listen(PORT, "127.0.0.1"); rewrite only that call to 0.0.0.0 (engine CLIs that inherit NODE_OPTIONS are untouched).
const net = require("node:net");

const port = Number(process.env.OMB_PORT);
const listen = net.Server.prototype.listen;
const isLoopback = (host) => host === "127.0.0.1" || host === "localhost";

net.Server.prototype.listen = function (...args) {
  const [first, second] = args;
  if (first === port && isLoopback(second)) {
    args[1] = "0.0.0.0";
  } else if (first && typeof first === "object" && first.port === port && isLoopback(first.host)) {
    args[0] = { ...first, host: "0.0.0.0" };
  }
  return listen.apply(this, args);
};
