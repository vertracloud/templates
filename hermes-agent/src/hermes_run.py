"""Runs the Hermes CLI. Hermes looks for Node.js only in its own package store, which this template does not use, so when
VERTRA_NODE_BIN is set the Node lookups point at that folder instead."""
import os
import runpy
import shutil
import sys

node_bin = os.environ.get("VERTRA_NODE_BIN")
if node_bin:
    import hermes_constants

    original = hermes_constants.find_node_executable

    def find_node_executable(command):
        if str(command) in ("node", "npm", "npx"):
            found = shutil.which(str(command), path=node_bin)
            if found:
                return found
        return original(command)

    def with_hermes_node_path(env=None):
        env = dict(os.environ if env is None else env)
        env["PATH"] = node_bin + os.pathsep + env.get("PATH", "")
        return env

    hermes_constants.find_node_executable = find_node_executable
    hermes_constants.with_hermes_node_path = with_hermes_node_path

sys.argv[0] = "hermes"
runpy.run_module("hermes_cli.main", run_name="__main__")
