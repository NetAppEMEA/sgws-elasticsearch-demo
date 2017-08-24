# Installation of ElasticSearch with Kibana using Docker

1. Install Docker (e.g. `yum install docker`)
2. [Install Docker Compose](https://docs.docker.com/compose/install/#install-compose) (e.g. `pip install docker-compose`)
2. Install Elasticsearch

## Install Elasticsearch

Follow the steps outlined in [Install Elasticsearch with Docker](https://www.elastic.co/guide/en/elasticsearch/reference/5.5/docker.html#_security_note):

1. Pull docker using `docker pull docker.elastic.co/elasticsearch/elasticsearch:5.5.2`
2. Check if `vm.max_map_count` is set to 262144 with `grep vm.max_map_count /etc/sysctl.conf`. If it is not set, use `echo vm.max_map_count=262144 >> /etc/sysctl.conf` and ensure it is set in the live environment with `sysctl -w vm.max_map_count=262144`
3. Create a `docker-compose.yml` file as described in the documentation or use and modify the one from this GitHub repository under elastic/docker-compose.yml
4. Start ElasticSearch with `docker-compose up`
5. Verify that ElasticSearch is running and healthy with `curl -u elastic:changeme http://127.0.0.1:9200/_cat/health`. The status should be similar to `1472225929 15:38:49 docker-cluster green 2 2 4 2 0 0 0 0 - 100.0%`. Important is, that it shows `green`and not `yellow` or `red`.
