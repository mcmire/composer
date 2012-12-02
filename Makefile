noop:

init: install-deps

start: mongo-start server-start

stop: mongo-stop

#---

install-deps:
	# I tried to do this using npm 'scripts' property but it doesn't work
	npm install
	(pushd client; npm install)
	(pushd server; npm install)

mongo-start:
	mongod >/dev/null 2>&1 &
	echo "Mongo started."

mongo-stop:
	pkill mongod

server-start:
	foreman start
