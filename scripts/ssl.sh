#!/bin/bash

set -e

mkdir -p certs

openssl req -x509 -newkey rsa:512 -nodes -sha256 -subj '/CN=localhost' -keyout ./certs/localhost-privkey.pem -out ./certs/localhost-cert.pem

exit 0;