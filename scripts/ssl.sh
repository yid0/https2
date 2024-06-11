#!/bin/bash

set e

openssl req -x509 -newkey rsa:512 -nodes -sha256 -subj '/CN=localhost'   -keyout localhost-privkey.pem -out localhost-cert.pem

mkdir -p certs

rm -Rf localhost*.pem