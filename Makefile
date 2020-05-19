.DEFAULT_GOAL := compose

clean:
	docker system prune -a -f

build:
	docker build . -t node

rebuild: clean build

run:
	cd $(path) && docker run --rm -p 81:80 symfony

rerun: 	rebuild run

compose:
	docker-compose up --build -d
