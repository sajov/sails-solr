
TESTS = test
REPORTER = spec
XML_FILE = reports/TEST-all.xml
HTML_FILE = reports/coverage.html

test: test/integration/runner -R spec -b

test-mocha:
	@NODE_ENV=test mocha \
	    --timeout 25000 \
		--reporter $(REPORTER) \
		integration/runner -R spec -b

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