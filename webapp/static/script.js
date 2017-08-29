$(document).ready(function () {
    $('#loader').hide();
    $('#nomore').show();
    var finished_loading = true;
    var last_search_query = "init";

    load_results();
    get_buckets();

    function get_buckets() {
        $.get('/buckets', function (data) {
            if (data) {
                console.info(data);
                for (var b in data) {
                    $('#bucket').append($('<option>', {
                        value: data[b],
                        text: data[b]
                    }));
                }
            }
        });
    }

    function isEmpty(val){
        return (val === undefined || val == null || val.length <= 0) ? true : false;
    }

    function get_search_query() {
        var search_query = "";
        var bucket = $('#bucket')[0].value;

        if (!isEmpty(bucket)) {
            search_query += encodeURI("bucket=" + bucket);
        }

        var key = $('#metadata-key')[0].value;
        var value = $('#metadata-value')[0].value;

        if (!isEmpty(key) && !isEmpty(value)) {
            search_query += encodeURI("&metadata." + key + "=" + value);
        }

        return search_query;
    }

    function load_results() {
        if (!finished_loading) {
            return;
        }

        // get latest search query
        var current_search_query = get_search_query();
        if (current_search_query.localeCompare(last_search_query) != 0) {
            last_search_query = current_search_query;
            console.info("Updated Search Query to: ", current_search_query);
        } else {
            return;
        }

        finished_loading = false;
        $('#search_results').empty();
        $('#nomore').hide();
        $('#loader').fadeIn();

        $.get('/search?' + current_search_query, function (data) {
            if (data) {
                $('#search_results').append(data);
                $('#loader').hide();
                search_query_changed = false;
            } else {
                $('#loader').hide();
                $('#nomore').show();
            }
        finished_loading = true;
        });
    }

    $("input").keyup( $.debounce(500, load_results));

});
