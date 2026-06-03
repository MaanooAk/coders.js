
.PHONY: test
test:
	cat *.js test/*test.js test/*test-large.js | node
