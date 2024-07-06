#!/bin/bash
echo $date

PORT=$(echo $HTTP_PORT)

echo $PORT
echo 'HTTPS benchmark : /\n'
for ((i =1; i<=10; i++))
do
    echo "Shot number $i :"
    autocannon -c 100 -d 40 -p 10 http://localhost:$PORT/version
done;
echo '--------------------'

exit 0;