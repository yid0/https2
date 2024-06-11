#!/bin/bash
echo $date

echo 'HTTPS benchmark : /\n'
for ((i =1; i<=10; i++))
do
    echo "Shot number $i :"
    autocannon -c 100 -d 40 -p 10 http://localhost:3000
done;
echo '--------------------'




kill -9 $(ps -ef | grep https2 | awk '{print $2}')

PORT=8080 MODE='event' npm run start 1&2 > error.log

for i in 1..10
do
    echo "Shot number $i :"
    autocannon -c 100 -d 40 -p 10 http://localhost:8080/home >> ./benchmarks/$date/event.log
done

exit 0;

exit 0;