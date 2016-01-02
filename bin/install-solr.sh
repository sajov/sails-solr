#!/bin/sh

FILE="solr-5.3.1.tgz"
URL="http://artfiles.org/apache.org/lucene/solr/5.3.1/"

wget $URL$FILE
tar xfz solr-5.3.1.tgz
cd solr-5.3.1
bin/solr start
