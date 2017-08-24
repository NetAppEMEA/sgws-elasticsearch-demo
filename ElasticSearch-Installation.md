# Installation of ElasticSearch with Kibana using Docker

1. Install Docker (e.g. `yum install docker`)
2. [Install Docker Compose](https://docs.docker.com/compose/install/#install-compose) (e.g. `pip install docker-compose`)
2. Install Elasticsearch

## Install Elasticsearch

Follow the steps outlined in [Install Elasticsearch with Docker](https://www.elastic.co/guide/en/elasticsearch/reference/5.5/docker.html#_security_note):

1. Pull docker using `docker pull docker.elastic.co/elasticsearch/elasticsearch:5.5.2`
2. Check if `vm.max_map_count` is set to 262144 with `grep vm.max_map_count /etc/sysctl.conf`. If it is not set, use `echo vm.max_map_count=262144 >> /etc/sysctl.conf` and ensure it is set in the live environment with `sysctl -w vm.max_map_count=262144`
3. Create and modify a `docker-compose.yml` file using the one from this GitHub repository under `elastic/docker-compose.yml`. The one in the documentation is missing `container_name: elasticsearch2` for the `elasticsearch 2` services causing node discovery issues.
4. Start ElasticSearch with `docker-compose up`
5. Verify that ElasticSearch is running and healthy with `curl -u elastic:changeme http://127.0.0.1:9200/_cluster/health?pretty=true`. The status should `green` and not `yellow` or `red`. `number_of_nodes` should be 2.
6. Follow the steps described in [Notes for production use and defaults](https://www.elastic.co/guide/en/elasticsearch/reference/5.5/docker.html#_notes_for_production_use_and_defaults)
7. Change passwords of builtin users as desribed in [Getting Started with Security](https://www.elastic.co/guide/en/x-pack/5.5/security-getting-started.html)
    - Change password of Kibana user with the following command (replace kibanapassword with a secure password!) `curl -XPUT -u elastic:changeme 'localhost:9200/_xpack/security/user/kibana/_password' -H "Content-Type: application/json" -d '{"password" : "kibanapassword"}'`
    - Change password of Logstash system user with the following command (replace logstashpassword with a secure password!) `curl -XPUT -u elastic:changeme 'localhost:9200/_xpack/security/user/logstash_system/_password' -H "Content-Type: application/json" -d '{"password" : "logstashpassword"}'`
    - Change password of ElasticSearch user with the following command (replace elasticpassword with a secure password!) `curl -XPUT -u elastic:changeme 'localhost:9200/_xpack/security/user/elastic/_password' -H "Content-Type: application/json" -d '{"password" : "elasticpassword"}'`
