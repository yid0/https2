.PHONY:	docker-build

docker-build: 
	    ./scripts/build.sh local

.PHONY:	docker-start

docker-start: 
	    ./scripts/run.sh local 3000