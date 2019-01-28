/**
 * Created by jlidder on 4/04/17.
 * Integration test to be run manually for now.
 */

var jswiremocklib, jswiremock, stubFor, get, post, put, _delete, patch, options, urlEqualTo, a_response;
jswiremocklib = require('../jswiremock'), jswiremock = jswiremocklib.jswiremock, stubFor = jswiremocklib.stubFor, get = jswiremocklib.get, post = jswiremocklib.post, put = jswiremocklib.put, patch = jswiremocklib.patch, _delete = jswiremocklib.delete, options = jswiremocklib.options, urlEqualTo = jswiremocklib.urlEqualTo, a_response = jswiremocklib.a_response, stopJSWireMock = jswiremocklib.stopJSWireMock;

var jswiremock = new jswiremock(5001); //port

stubFor(jswiremock, get(urlEqualTo("/account/:varying_var/create/"))
    .willReturn(a_response()
        .withStatus(200)
        .withHeader({
            "Content-Type": "application/json"
        })
        .withBody("[{\"status\":\"success\"}]")));

stubFor(jswiremock, get(urlEqualTo("/account/:varying_var/create/"), {
        testParams: '123'
    })
    .willReturn(a_response()
        .withStatus(200)
        .withHeader({
            "Content-Type": "application/json"
        })
        .withBody("[{\"status\":\"success_123\"}]")));


stubFor(jswiremock, get(urlEqualTo("/account/:varying_var/delete/"), {
        token: 'invalid_token'
    })
    .willReturn(a_response()
        .withStatus(200).withHeader({
            "Content-Type": "application/json"
        }).withBody("[{\"status\":\"failed\"}]")));

stubFor(jswiremock, get(urlEqualTo("/account/:varying_var/delete/"), {}, {
        authorization: 'Bearer token'
    })
    .willReturn(a_response()
        .withStatus(200).withHeader({
            "Content-Type": "application/json"
        }).withBody("[{\"status\":\"ok\"}]")));

stubFor(jswiremock, get(urlEqualTo("/account/:varying_var/delete/"), {}, {
        authorization: 'Bearer token',
        extraKey: 'extra value'
    })
    .willReturn(a_response()
        .withStatus(200).withHeader({
            "Content-Type": "application/json"
        }).withBody("[{\"status\":\"yes\"}]")));


stubFor(jswiremock, post(urlEqualTo("/login"), {
        username: "captainkirk",
        password: "enterprise"
    })
    .willReturn(a_response()
        .withStatus(200)
        .withHeader({
            "Content-Type": "application/json"
        })
        .withBody("[{\"status\":\"done\"}]")));

stubFor(jswiremock, post(urlEqualTo("/login"), {
        username: "captainkirk",
        password: "enterprise",
        extra: '123'
    })
    .willReturn(a_response()
        .withStatus(200)
        .withHeader({
            "Content-Type": "application/json"
        })
        .withBody("[{\"status\":\"done_123\"}]")));

stubFor(jswiremock, post(urlEqualTo("/login"), {
        testObject: {
            a: 1,
            b: 2
        },
        testArray: [{
                a: 1,
                b: 2
            },
            {
                c: 1,
                d: 2
            }
        ]
    })
    .willReturn(a_response()
        .withStatus(200)
        .withHeader({
            "Content-Type": "application/json"
        })
        .withBody("[{\"status\":\"haha\"}]")));


stubFor(jswiremock, put(urlEqualTo("/login"), {
        username: "captainkirk",
        password: "enterprise"
    })
    .willReturn(a_response()
        .withStatus(200)
        .withHeader({
            "Content-Type": "application/json"
        })
        .withBody("[{\"status\":\"done\"}]")));

stubFor(jswiremock, _delete(urlEqualTo("/login"), {
        username: "captainkirk",
        password: "enterprise"
    })
    .willReturn(a_response()
        .withStatus(200)
        .withHeader({
            "Content-Type": "application/json"
        })
        .withBody("[{\"status\":\"done\"}]")));

stubFor(jswiremock, patch(urlEqualTo("/login"), {
        username: "captainkirk",
        password: "enterprise"
    })
    .willReturn(a_response()
        .withStatus(200)
        .withHeader({
            "Content-Type": "application/json"
        })
        .withBody("[{\"status\":\"done\"}]")));

stubFor(jswiremock, options(urlEqualTo("/login"), {
        username: "captainkirk",
        password: "enterprise"
    })
    .willReturn(a_response()
        .withStatus(200)
        .withHeader({
            "Content-Type": "application/json"
        })
        .withBody("[{\"status\":\"done\"}]")));

/*
 * Actual call to the stub below.
 */
var request = require("request");
var assert = require('assert');


describe('e2e test', function () {


    it('can fire GET request', function (done) {
        request({
            uri: "http://localhost:5001/account/4444321/create/",
            method: "GET",
            json: true
        }, function (error, response, body) {
            assert.strictEqual(JSON.stringify(body), "[{\"status\":\"success\"}]", error);
            done();
        });
    })

    it('can fire GET request with exact query', function (done) {
        request({
            uri: "http://localhost:5001/account/4444321/create?testParams=123",
            method: "GET",
            json: true
        }, function (error, response, body) {
            assert.strictEqual(JSON.stringify(body), "[{\"status\":\"success_123\"}]", error);
            done();
        });
    })


    it('can fire GET request with queries', function (done) {
        request({
            uri: "http://localhost:5001/account/4444321/delete?token=invalid_token",
            method: "GET",
            json: true
        }, function (error, response, body) {
            assert.strictEqual(JSON.stringify(body), "[{\"status\":\"failed\"}]", error);
            done();
        });
    })

    it('can fire GET request with headers', function (done) {
        request({
            uri: "http://localhost:5001/account/4444321/delete",
            headers: {
                authorization: 'Bearer token',
            },
            method: "GET",
            json: true,
        }, function (error, response, body) {
            assert.strictEqual(JSON.stringify(body), "[{\"status\":\"ok\"}]", error);
            done();
        });
    })

    it('GET request with headers will go to the stub which header match the most', function (done) {
        request({
            uri: "http://localhost:5001/account/4444321/delete",
            headers: {
                authorization: 'Bearer token',
                extraKey: 'extra value'
            },
            method: "GET",
            json: true,
        }, function (error, response, body) {
            assert.strictEqual(JSON.stringify(body), "[{\"status\":\"yes\"}]", error);
            done();
        });
    })

    it('can fire POST request with params', function (done) {
        request.post("http://localhost:5001/login", {
            json: {
                username: "captainkirk",
                password: "enterprise"
            },
        }, function (error, response, body) {
            assert.strictEqual(JSON.stringify(body), "[{\"status\":\"done\"}]", error);
            done();
        });
    })

    it('can fire POST request with params', function (done) {
        request.post("http://localhost:5001/login", {
            json: {
                username: "captainkirk",
                password: "enterprise",
                extra: '123'
            },
        }, function (error, response, body) {
            assert.strictEqual(JSON.stringify(body), "[{\"status\":\"done_123\"}]", error);
            done();
        });
    })

    it('can fire POST request with params nested with object and array', function (done) {
        request.post("http://localhost:5001/login", {
            json: {
                testObject: {
                    a: 1,
                    b: 2
                },
                testArray: [{
                        a: 1,
                        b: 2
                    },
                    {
                        c: 1,
                        d: 2
                    }
                ]
            },
        }, function (error, response, body) {
            assert.strictEqual(JSON.stringify(body), "[{\"status\":\"haha\"}]", error);
            done();
        });
    })

    it('can fire PUT request with params', function (done) {
        request.put("http://localhost:5001/login", {
            json: {
                username: "captainkirk",
                password: "enterprise"
            },
        }, function (error, response, body) {
            assert.strictEqual(JSON.stringify(body), "[{\"status\":\"done\"}]", error);
            done();
        });
    })

    it('can fire PATCH request with params', function (done) {
        request.patch("http://localhost:5001/login", {
            json: {
                username: "captainkirk",
                password: "enterprise"
            },
        }, function (error, response, body) {
            assert.strictEqual(JSON.stringify(body), "[{\"status\":\"done\"}]", error);
            done();
        });
    })

    it('can fire DELETE request with params', function (done) {
        request.delete("http://localhost:5001/login", {
            json: {
                username: "captainkirk",
                password: "enterprise"
            },
        }, function (error, response, body) {
            assert.strictEqual(JSON.stringify(body), "[{\"status\":\"done\"}]", error);
            done();
        });
    })

    after(function () {
        jswiremock.stopJSWireMock();
    })
});