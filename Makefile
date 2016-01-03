
TESTS = test
REPORTER = spec
XML_FILE = reports/TEST-all.xml
HTML_FILE = reports/coverage.html
MOCHA_OPTS= --check-leaks


test: test-integration

test-mocha:
	@NODE_ENV=test mocha \
	    --timeout 25000 \
		--reporter $(REPORTER) \
		test/integration/runner.js

test-integration:
	@NODE_ENV=test node \
		test/integration/runner.js

test-load:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS) \
		test/load/**

test-cov: istanbul

istanbul:
	istanbul cover _mocha test/runner.js

coveralls:
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

cov-html: test-cov html-cov-report

html-cov-report:
	istanbul report html

npm:
	npm publish ./

check:
	travis-lint .travis.yml

after_script:
	istanbul cover _mocha test/runner.js

clean:
	rm -rf ./coverage

kickstart:
	cd node_modules/solr-hyperquest-client/bin/ && ./install-solr.sh

