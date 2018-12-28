/**
 * Created by jlidder on 7/15/15.
 */

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var url = require('url');

var urlParser = require('./UrlParser');

exports.jswiremock = function (port) {

    var app = express();
    app.use(bodyParser.json()); // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
        extended: true,
    }));

    var that = this;

    this.server = app.listen(port, function () {
        var host = that.server.address().address;
        var port = that.server.address().port;
    });

    this.getRequestStubs = [];
    this.postRequestStubs = [];
    this.putRequestStubs = [];
    this.deleteRequestStubs = [];

    this.addStub = function (mockRequest) {
        if (mockRequest.getRequestType() === "GET") {
            this.getRequestStubs.push(mockRequest);
        } else if (mockRequest.getRequestType() === "POST") {
            this.postRequestStubs.push(mockRequest);
        }
    };

    this.stopJSWireMock = function () {
        that.server.close();
    };

    this.buildResponse = function (res) {
        //TODO
    };

    app.use('/*', function (req, res, next) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        next();
    });

    app.get('/*', function (req, res) {
        var returnedStubs = urlParser.hasMatchingStub(urlParser.buildUrlStorageLinkedList(req.originalUrl), that.getRequestStubs)

        var filteredStubs = filterStubsByQueryParams(filterStubsByHeaders(returnedStubs, req), req);

        if (filteredStubs.length < 1) {
            res.status(404);
            res.send("Does not exist");
        } else if (filteredStubs.length > 1) {
            res.status(400);
            res.send("Multi stubs match");
        } else {
            var returnedStub = filteredStubs[0];
            for (var key in returnedStub.getMockResponse().getHeader()) {
                res.setHeader(key, returnedStub.getMockResponse().getHeader()[key]);
            }
            res.status(returnedStub.getMockResponse().getStatus());
            res.send(returnedStub.getMockResponse().getBody());
        }
    });

    app.post('/*', function (req, res) {
        var returnedStubs = urlParser.hasMatchingStub(urlParser.buildUrlStorageLinkedList(req.originalUrl), that.postRequestStubs)

        var filteredStubs = filterStubsByPostParams(filterStubsByHeaders(returnedStubs, req), req);

        if (filteredStubs.length < 1) {
            res.status(404);
            res.send("Does not exist");
        } else if (filteredStubs.length > 1) {
            res.status(400);
            res.send("Multi stubs match");
        } else {
            var returnedStub = filteredStubs[0];
            for (var key in returnedStub.getMockResponse().getHeader()) {
                res.setHeader(key, returnedStub.getMockResponse().getHeader()[key]);
            }
            res.status(returnedStub.getMockResponse().getStatus());
            res.send(returnedStub.getMockResponse().getBody());
        }

        return this;
    });
}

exports.urlEqualTo = function (url) {
    var mockRequest = new MockRequest(url);
    return mockRequest;
};

exports.get = function (mockRequest, queryParams, headers) {
    mockRequest.setRequestType("GET");
    mockRequest.setQueryParams(queryParams);
    mockRequest.setHeaders(headers);
    return mockRequest;
};

exports.post = function (mockRequest, postParams, headers) {
    mockRequest.setRequestType("POST");
    mockRequest.setPostParams(postParams);
    mockRequest.setHeaders(headers);
    return mockRequest;
};

exports.withPostParams = function (postParams) {
    return postParams;
};

exports.stubFor = function (jsWireMock, mockRequest) {
    jsWireMock.addStub(mockRequest);
};

function filterStubsByPostParams(stubs, req) {
    // don't do filter for non-POST request
    if (req.method !== 'POST') {
        return stubs;
    }
    var body = req.body || {};

    return stubs.filter(function (stub) {
        var postParams = stub.getPostParams() || {};
        if (_.isEmpty(postParams) && !_.isEmpty(body)) {
            return false;
        }
        for (key in postParams) {
            if (req.body[key] !== postParams[key]) {
                return false;
            }
        }
        return true;
    });
}

function filterStubsByHeaders(stubs, req) {
    var headers = req.headers || {};
    var returnStubs = [];
    var matchPropertyCount = 0;
    stubs.forEach(function (stub) {
        var stubHeaders = stub.getHeaders();
        var currentCount = 0;
        for (key in stubHeaders) {
            if (headers[key.toLowerCase()] === stubHeaders[key]) {
                currentCount++;
            } else {
                return;
            }
        }
        if (currentCount > matchPropertyCount) {
            while (returnStubs.length > 0) {
                returnStubs.pop();
            }
            returnStubs.push(stub);
            matchPropertyCount = currentCount;
        } else if (currentCount == matchPropertyCount) {
            returnStubs.push(stub);
        }
    });
    return returnStubs;
}

function filterStubsByQueryParams(stubs, req) {
    // don't do filter for non-GET request
    if (req.method !== 'GET') {
        return stubs;
    }
    var query = url.parse(req.url, true).query || {};
    return stubs.filter(function (stub) {
        var stubQueryParams = stub.getQueryParams() || {};
        if (_.isEmpty(stubQueryParams) && !_.isEmpty(query)) {
            return false;
        }
        for (key in stubQueryParams) {
            if (stubQueryParams[key] !== query[key]) {
                return false;
            }
        }
        return true;
    });
}

function filterStubs(stubs, req) {
    var stubsFilterByHeaders = filterStubsByHeaders(status, req);
    return filterStubsByQueryParams(stubsFilterByHeaders, req);
}

exports.a_response = function () {
    return new MockResponse();
};

function MockRequest(url) {
    this.url = urlParser.buildUrlStorageLinkedList(url);
    this.mockResponse = null;
    this.requestType = null;
    this.postParams = null;
    this.queryParams = null;
    this.headers = null;

    this.getUrl = function () {
        return this.url;
    };
    this.getMockResponse = function () {
        return this.mockResponse;
    };
    this.willReturn = function (mockResponse) {
        this.mockResponse = mockResponse;
        return this;
    };
    this.setRequestType = function (requestType) {
        this.requestType = requestType;
    };
    this.getRequestType = function () {
        return this.requestType;
    };
    this.setPostParams = function (postParams) {
        this.postParams = postParams;
    };
    this.getPostParams = function () {
        return this.postParams;
    };
    this.setQueryParams = function (queryParams) {
        this.queryParams = queryParams;
    }
    this.getQueryParams = function () {
        return this.queryParams;
    }
    this.setHeaders = function (headers) {
        this.headers = headers;
    }
    this.getHeaders = function () {
        return this.headers;
    }
}

function MockResponse() {
    this.status = null;
    this.withStatus = function (status) {
        this.status = status;
        return this;
    };
    this.getStatus = function () {
        return this.status;
    };

    this.body = null;
    this.withBody = function (body) {
        this.body = body;
        return this;
    };
    this.getBody = function () {
        return this.body;
    };

    this.header = null;
    this.withHeader = function (header) {
        this.header = header;
        return this;
    };
    this.getHeader = function () {
        return this.header;
    };
}

/*
 stubFor(jswiremock, post(urlEqualTo("/account/:varying_var/delete/"), withPostParams({testdata_1 : 1, testdata_2 : 2}))
 .willReturn(a_response()
 .withStatus(200)
 .withHeader({"Content-Type": "application/json"})
 .withBody("[{\"status\":\"success\"}]")));
 */