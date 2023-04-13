#!/bin/sh

APP_PATH=$1
APP_DATA_PATH=$2

PYTHON_URI="https://www.python.org/ftp/python/3.10.8/Python-3.10.8.tar.xz"
OPENSSL_URI="https://www.openssl.org/source/openssl-1.1.1k.tar.gz"

PYTHON_PATH="$APP_DATA_PATH/python"
TMP="$APP_DATA_PATH/tmp"

if [ ! -d "$APP_DATA_PATH" ]; then
  mkdir "$APP_DATA_PATH"
fi

if [ -d "$TMP" ]; then
  rm -rf "${TMP:?}/"*
else
  mkdir "$TMP"
fi

if [ -d "$PYTHON_PATH" ]; then
  rm -rf "${PYTHON_PATH:?}/"*
else
  mkdir "$PYTHON_PATH"
fi

cd "$TMP"
mkdir "$TMP/openssl-1.1.1k"
curl -o "$TMP/openssl-1.1.1k.tar.gz" $OPENSSL_URI
tar -xzf "$TMP/openssl-1.1.1k.tar.gz" -C "$TMP/openssl-1.1.1k"
dirs=$(ls "$TMP/openssl-1.1.1k")
mv "$TMP/openssl-1.1.1k/${dirs[0]}" "$TMP/openssl"
cd "$TMP/openssl"
opensslpath="$PYTHON_PATH/openssl"
mkdir "$opensslpath"
./config --prefix="$opensslpath" --openssldir="$opensslpath" shared zlib
make
make install

cd "$TMP"
curl -o "$TMP/Python-3.10.8.tar.xz" $PYTHON_URI
mkdir "$TMP/Python-3.10.8"
tar -xvf "Python-3.10.8.tar.xz" -C "$TMP/Python-3.10.8"
dirs=$(ls "$TMP/Python-3.10.8")
mv "$TMP/Python-3.10.8/${dirs[0]}" "$TMP/python"
cd "$TMP/python"
./configure --with-openssl="$opensslpath" --prefix="$PYTHON_PATH" 
make
make install

cd $APP_PATH
export PATH="$PYTHON_PATH/bin:$PATH"
python3 -m pip install --upgrade pip --no-warn-script-location
pip3 install -r py_src/requirements.txt --no-warn-script-location

rm -f "$TMP"

exit 0