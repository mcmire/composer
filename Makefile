noop:

setup: install-deps

start: mongo-start server-start

stop: mongo-stop

#---

install-deps:
	@./scripts/install-deps

mongo-start:
	@./scripts/mongo-start

mongo-stop:
	@./scripts/mongo-stop

server-start:
	@./scripts/server-start

#---

.PHONY: noop init start stop install-deps mongo-start mongo-stop server-start
