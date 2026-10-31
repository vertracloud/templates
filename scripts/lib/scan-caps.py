#!/usr/bin/env python3
"""Lists the files of a Docker image that carry file capabilities (extended attribute security.capability).

Usage: scan-caps.py <image>      prints one path per line; prints nothing when the image is clean.

Why: the platform runs customer images with `--cap-drop ALL` and `no-new-privileges`. A binary with a file capability (for example
the official Caddy, which has cap_net_bind_service) then fails to exec with "Operation not permitted" and no useful message. The fix
is to copy the binary through `cat > file` so the attribute is dropped. The image is exported with `docker export`, which keeps
extended attributes as PAX records, so no tool is needed inside the image.
"""
import subprocess
import sys
import tarfile

if len(sys.argv) != 2:
    sys.exit("usage: scan-caps.py <image>")
image = sys.argv[1]
container = subprocess.run(["docker", "create", image, "/nonexistent"], capture_output=True, text=True, check=True).stdout.strip()
try:
    export = subprocess.Popen(["docker", "export", container], stdout=subprocess.PIPE)
    found = []
    with tarfile.open(fileobj=export.stdout, mode="r|") as tar:
        for member in tar:
            if any(key.endswith("security.capability") for key in member.pax_headers):
                found.append("/" + member.name.lstrip("/"))
    export.wait()
    for path in sorted(found):
        print(path)
finally:
    subprocess.run(["docker", "rm", "-f", container], capture_output=True)
