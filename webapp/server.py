from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify
from elasticsearch import Elasticsearch
import requests
import json

app = Flask(__name__, instance_relative_config=False)
app.config.from_pyfile('app.config')

storagegrid_tenant_endpoint = app.config['SGWS_TENANT_ENDPOINT']
tenant_id = app.config['SGWS_TENANT_ID']
login = app.config['SGWS_LOGIN']
password = app.config['SGWS_PASSWORD']
elasticsearch_endpoint = app.config['ELASTICSEARCH_ENDPOINT']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/buckets')
def get_buckets():
    resp = []
    base_url = storagegrid_tenant_endpoint + "/api/v2"
    data = json.dumps({'accountId': tenant_id,'username': login, 'password': password})
    req = requests.post(base_url + "/authorize", data, verify=False)
    token = json.loads(req.text)['data']
    req = requests.get(base_url + "/org/containers", headers={'Authorization': 'Bearer ' + token}, verify=False)
    buckets = req.json()['data']
    for bucket in buckets:
        resp.append(bucket['name'])
    return jsonify(resp)

@app.route('/search')
def get_search():
    args = request.args
    print "args: %s", args

    es = Elasticsearch([elasticsearch_endpoint], verify_certs=False)
    matches = []
    for arg in args:
        key = arg
        value = args[key]
        match = {"match": { key:value}}
        matches.append(match)
    print matches

    search_output = [] 
    search = es.search(index="objects", body={"query": {"bool": { "must": matches}}})
    search_results = search['hits']['hits']
    for search_result in search_results:
        search_output.append(search_result['_source'])
    print search_output
    return render_template('results.html', results=search_output)

