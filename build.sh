#!/bin/sh
mkdir -p deploy

sprocketize \
	-I . \
	-I xforms/src/lib/backplane \
	copyright.txt \
	platform/yuiloader-dom-event.js \
	backplane.js \
	-a deploy/assets \
	> deploy/backplane-0.6.0.js

sprocketize xforms/src/lib/backplane/_unit-tests/*.js > _unit-tests/backplane/unit-tests.js

sprocketize \
	-I . \
	-I xforms/src/lib/backplane \
	copyright.txt \
	platform/yuiloader-dom-event.js \
	rdfa/rdfa.js \
	-a deploy/assets \
	> deploy/rdfa-0.8.0.js

sprocketize rdfa/_unit-tests/*.js > _unit-tests/rdfa/unit-tests.js
