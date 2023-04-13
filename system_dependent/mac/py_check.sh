#!/bin/sh

APP_PATH=$1
APP_DATA_PATH=$2

PYTHON_PATH="$APP_DATA_PATH/python"

if ! "$PYTHON_PATH/bin/python3" --version >/dev/null 2>&1; then
  exit 1
fi

error=$($PYTHON_PATH/bin/pip3 freeze -r "$APP_PATH/py_src/requirements.txt" 2>&1 | grep WARNING)
if [ -n "$error" ]; then
  exit 1
fi

exit 0