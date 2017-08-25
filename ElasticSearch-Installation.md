# Installation of ElasticSearch with Kibana using Docker

## Preparation

### Docker

1. Install Docker (e.g. `yum install docker`)
2. [Install Docker Compose](https://docs.docker.com/compose/install/#install-compose) (e.g. `pip install docker-compose`)
3. Pull ElasticSearch Docker Image using `docker pull docker.elastic.co/elasticsearch/elasticsearch:5.5.2`
4. Pull Kibana Image using `docker pull docker.elastic.co/kibana/kibana:5.5.2`

### System

1. Check if `vm.max_map_count` is set to 262144 with `grep vm.max_map_count /etc/sysctl.conf`. If it is not set, use `echo vm.max_map_count=262144 >> /etc/sysctl.conf` and ensure it is set in the live environment with `sysctl -w vm.max_map_count=262144`

### SSL Certificate Generation

The next steps are based on [Setting Up SSL/TLS on a Cluster](https://www.elastic.co/guide/en/x-pack/current/ssl-tls.html) and [Encrypt the traffic between nodes in your elasticsearch cluster](https://kupczynski.info/2017/04/02/elasticsearch-fun-with-tls.html).

1. Create a temporary folder to store the certificates in e.g. `mkdir /tmp/certificates` and allow everyone to write to it `chmod 777 /tmp/certificates` so that elasticsearch inside the docker container can use it
2. Create and modify a `certgen.yml` file under `/tmp/certgen.yml` describing the nodes and intended DNS names for all ElasticSearch and Kibana nodes. Make sure to include internal and external DNS (e.g. node name and external DNS names both with hostname and FQDN). You can start with the example in this GitHub repository under `elastic/certgen.yml`
3. Start ElasticSearch in a temporary docker container to run the certgen utility with 
    
       docker run -it --rm \
           -v '/tmp/certgen.yml:/usr/share/elasticsearch/config/x-pack/certgen.yml:Z' \
           -v '/tmp/certificates:/usr/share/elasticsearch/config/x-pack/certificates' \
           -w /usr/share/elasticsearch \
           'docker.elastic.co/elasticsearch/elasticsearch:5.5.2' \
           bin/x-pack/certgen -csr -in certgen.yml \
           -out /usr/share/elasticsearch/config/x-pack/certificates/bundle.zip


## Configure ElasticSearch and Kibana

Follow the steps outlined in [Install Elasticsearch with Docker](https://www.elastic.co/guide/en/elasticsearch/reference/5.5/docker.html#_security_note) and [Running Kibana on Docker](https://www.elastic.co/guide/en/kibana/5.5/docker.html).

1. Create and modify a `docker-compose.yml` file using the one from this GitHub repository under `elastic/docker-compose.yml`. The one in the documentation is missing `container_name: elasticsearch2` for the `elasticsearch 2` services causing node discovery issues.
2. Start the ElasticSearch Cluster with `docker-compose up`. If you want to daemonize it (e.g. put it to the background), use `docker-compose up -d`
3. Verify that ElasticSearch is running and healthy with `curl -u elastic:changeme http://127.0.0.1:9200/_cluster/health?pretty=true`. The status should `green` and not `yellow` or `red`. `number_of_nodes` should be 2.
4. Follow the steps described in [Notes for production use and defaults](https://www.elastic.co/guide/en/elasticsearch/reference/5.5/docker.html#_notes_for_production_use_and_defaults)
5. Change passwords of builtin users as desribed in [Getting Started with Security](https://www.elastic.co/guide/en/x-pack/5.5/security-getting-started.html)
    - Change password of Kibana user with the following command (replace kibanapassword with a secure password!) `curl -XPUT -u elastic:changeme 'localhost:9200/_xpack/security/user/kibana/_password' -H "Content-Type: application/json" -d '{"password" : "kibanapassword"}'`
    - Change password of Logstash system user with the following command (replace logstashpassword with a secure password!) `curl -XPUT -u elastic:changeme 'localhost:9200/_xpack/security/user/logstash_system/_password' -H "Content-Type: application/json" -d '{"password" : "logstashpassword"}'`
    - Change password of ElasticSearch user with the following command (replace elasticpassword with a secure password!) `curl -XPUT -u elastic:changeme 'localhost:9200/_xpack/security/user/elastic/_password' -H "Content-Type: application/json" -d '{"password" : "elasticpassword"}'`
