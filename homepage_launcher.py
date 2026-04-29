import os
import subprocess
import sys
import ctypes
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse


def file_url_to_path(value):
    parsed = urlparse(value)
    if parsed.scheme.lower() != "file":
        raise ValueError("Only file URLs can be opened by this launcher.")

    path = unquote(parsed.path)

    if parsed.netloc:
        unc_path = path.replace("/", "\\")
        return f"\\\\{parsed.netloc}{unc_path}"

    if path.startswith("/") and len(path) >= 4 and path[2] == ":":
        path = path[1:]

    return path.replace("/", "\\")


def open_target(raw_url):
    parsed = urlparse(raw_url)
    if parsed.scheme.lower() != "homepage-launch":
        raise ValueError("Unsupported protocol.")

    params = parse_qs(parsed.query)
    target = params.get("target", [""])[0]
    if not target:
        raise ValueError("Missing target.")

    path = Path(file_url_to_path(target))

    if path.is_dir():
        subprocess.Popen(["explorer.exe", str(path)])
        return

    if path.is_file():
        os.startfile(path)
        return

    raise FileNotFoundError(f"Target does not exist: {path}")


def main():
    if len(sys.argv) < 2:
        return 1

    try:
        open_target(sys.argv[1])
        return 0
    except Exception as error:
        ctypes.windll.user32.MessageBoxW(None, str(error), "HomePage launcher", 0x10)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
