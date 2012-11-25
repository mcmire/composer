noop:
mongo:
	mongod >/dev/null 2>&1 &
	echo "Mongo started."
server:
	node app.js
