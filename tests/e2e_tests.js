/**
 * Created by jlidder on 4/04/17.
 * Integration test to be run manually for now.
 */

var jswiremocklib, jswiremock, stubFor, get, post, urlEqualTo, a_response;
jswiremocklib = require('../jswiremock'), jswiremock = jswiremocklib.jswiremock, stubFor = jswiremocklib.stubFor, get = jswiremocklib.get, post = jswiremocklib.post, urlEqualTo = jswiremocklib.urlEqualTo, a_response = jswiremocklib.a_response, stopJSWireMock = jswiremocklib.stopJSWireMock;

var jswiremock = new jswiremock(5001); //port

stubFor(jswiremock, get(urlEqualTo("/account/:varying_var/delete/"))
    .willReturn(a_response()
        .withStatus(200)
        .withHeader({
            "Content-Type": "application/json"
        })
        .withBody("[{\"status\":\"success\"}]")));

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


stubFor(jswiremock, post(urlEqualTo("/login"), {
        username: "captainkirk",
        password: "enterprise"
    })
    .willReturn(a_response()
        .withStatus(200)
        .withHeader({})
        .withBody("")));



/*
 * Actual call to the stub below.
 */
var request = require("request");
var assert = require('assert');


describe('e2e test', function () {


    // it('can fire GET request', function (done) {
    //     request({
    //         uri: "http://localhost:5001/account/4444321/delete/",
    //         method: "GET"
    //     }, function (error, response, body) {
    //         assert.strictEqual(body, "[{\"status\":\"success\"}]", error);
    //         done();
    //     });
    // })


    // it('can fire GET request', function (done) {
    //     request({
    //         uri: "http://localhost:5001/account/4444321/delete?token=invalid_token",
    //         method: "GET"
    //     }, function (error, response, body) {
    //         assert.strictEqual(body, "[{\"status\":\"failed\"}]", error);
    //         done();
    //     });
    // })

    it('can fire GET request with headers', function (done) {
        request({
            uri: "http://localhost:5001/account/4444321/delete",
            headers: {
                authorization: 'Bearer token',
            },
            method: "GET"
        }, function (error, response, body) {
            console.log(body);
            assert.strictEqual(body, "[{\"status\":\"ok\"}]", error);
            done();
        });
    })

    after(function () {
        jswiremock.stopJSWireMock();
    })
});