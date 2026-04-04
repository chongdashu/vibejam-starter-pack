#!/usr/bin/env python3
"""
Start one or more servers, wait for them to be ready, run a command, then clean up.

Usage:
  # Single server
  python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_test.py

  # Multiple servers (repeat --server/--port pairs)
  python scripts/with_server.py \
    --server "cd backend && python server.py" --port 3000 \
    --server "cd frontend && npm run dev" --port 5173 \
    -- python your_test.py
"""

from __future__ import annotations

import argparse
import os
import signal
import socket
import subprocess
import sys
import time
from typing import List


def wait_for_port(host: str, port: int, timeout_s: int) -> None:
    """Block until TCP port accepts connections or raise RuntimeError."""
    start = time.time()
    while time.time() - start < timeout_s:
        try:
            with socket.create_connection((host, port), timeout=1):
                return
        except OSError:
            time.sleep(0.25)
    raise RuntimeError(f"Server not ready on {host}:{port} within {timeout_s}s")


def terminate_process_tree(proc: subprocess.Popen[bytes], grace_s: int) -> None:
    """Terminate a subprocess and (best-effort) its children."""
    if proc.poll() is not None:
        return

    try:
        if os.name != "nt":
            os.killpg(proc.pid, signal.SIGTERM)
        else:
            proc.terminate()
    except Exception:
        proc.terminate()

    try:
        proc.wait(timeout=grace_s)
        return
    except subprocess.TimeoutExpired:
        pass

    try:
        if os.name != "nt":
            os.killpg(proc.pid, signal.SIGKILL)
        else:
            proc.kill()
    except Exception:
        proc.kill()
    proc.wait()


def main(argv: List[str]) -> int:
    parser = argparse.ArgumentParser(description="Run a command with one or more servers")
    parser.add_argument(
        "--server",
        action="append",
        dest="servers",
        required=True,
        help="Server command (repeatable)",
    )
    parser.add_argument(
        "--port",
        action="append",
        dest="ports",
        type=int,
        required=True,
        help="Port for each server (must match --server count)",
    )
    parser.add_argument("--host", default="127.0.0.1", help="Host to poll (default: 127.0.0.1)")
    parser.add_argument("--timeout", type=int, default=30, help="Timeout seconds per server (default: 30)")
    parser.add_argument("--grace", type=int, default=5, help="Grace seconds before kill (default: 5)")
    parser.add_argument(
        "command",
        nargs=argparse.REMAINDER,
        help="Command to run after servers are ready (prefix with -- to separate)",
    )

    args = parser.parse_args(argv)

    command = args.command
    if command and command[0] == "--":
        command = command[1:]
    if not command:
        print("Error: no command specified (use `--` before the command).", file=sys.stderr)
        return 2

    if len(args.servers) != len(args.ports):
        print("Error: number of --server and --port arguments must match.", file=sys.stderr)
        return 2

    procs: List[subprocess.Popen[bytes]] = []
    try:
        for idx, (cmd, port) in enumerate(zip(args.servers, args.ports), start=1):
            print(f"Starting server {idx}/{len(args.servers)}: {cmd}")
            proc = subprocess.Popen(
                cmd,
                shell=True,
                start_new_session=(os.name != "nt"),
            )
            procs.append(proc)

            print(f"Waiting for {args.host}:{port} ...")
            wait_for_port(args.host, port, timeout_s=args.timeout)
            print(f"Ready: {args.host}:{port}")

        print(f"\nAll {len(procs)} server(s) ready")
        print(f"Running: {' '.join(command)}\n")
        result = subprocess.run(command)
        return result.returncode
    finally:
        if procs:
            print(f"\nStopping {len(procs)} server(s)...")
        for idx, proc in enumerate(procs, start=1):
            try:
                terminate_process_tree(proc, grace_s=args.grace)
                print(f"Server {idx} stopped")
            except Exception as exc:
                print(f"Failed to stop server {idx}: {exc}", file=sys.stderr)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

