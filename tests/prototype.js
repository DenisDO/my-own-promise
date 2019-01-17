/*global Promise, require, setImmediate, setTimeout, describe, it */
"use strict";


describe("25.4.4.2 Promise.prototype", function () {
    it("is the Promise prototype object", function () {
        var p = new Promise(function () {});

        assert.ok(p instanceof Promise);
        // TODO(Sam): is there any way to ensure that there are no
        // other objects in the prototype chain?
        assert.ok(Promise.prototype instanceof Object);
    });
    it("has attribute [[Writable]]: false");
    it("has attribute [[Enumerable]]: false");
    it("has attribute [[Configurable]]: false");
});

describe("25.4.5 Properties of the Promise Prototype Object", function () {
    it("is an ordinary object", function () {
        const result = (Promise instanceof Object) ? true : false;
        assert.equal(true, result);
    });

    it("is not a Promise"); // implied
});

describe("25.4.5.1 Promise.prototype.catch( onRejected )", function () {
    it("is a function", function () {
        const result = (typeof Promise.prototype.catch === 'function') ? true : false;
        assert.equal(true, result);
    });
    it("expects 'this' to be a Promise", function () {
        const p = new Promise((res, rej) => {
            res(1);
            rej('err');
        });
        const result = (p.catch(v => v) instanceof Promise) ? true : false;
        assert.equal(true, result);      
    });
    it("takes one argument, a function");
    it("is equivalent to 'promise.then(undefined, fn)'");
});

describe("25.4.5.2 Promise.prototype.constructor", function () {
    it("is an object", function () {
        const result = (Promise.prototype.constructor instanceof Object) ? true : false;
        assert.equal(true, result);
    });
    it("is a function", function () {
        const result = (typeof Promise.prototype.constructor === 'function') ? true : false;
        assert.equal(true, result);
    });
    it("is the Promise constructor", function () {
        const result = (Promise.prototype.constructor === Promise) ? true : false;
        assert.equal(true, result);
    });
});

describe("25.4.5.3 Promise.prototype.then", function () {
    it("is a function", function () {
        const result = (typeof Promise.prototype.then === 'function') ? true : false;
        assert.equal(true, result);
    });
    it("expects 'this' to be a Promise", function() {
        const p = new Promise(()=>{});
        const p1 = p.then(()=>{});
        assert.equal(true, p1 instanceof Promise);
    });
    it("throws TypeError if 'this' is not a Promise");
    it("takes two arguments, both optional, both functions", function() {
        assert.equal(2, Promise.prototype.then.length);
    });
    it("has default on resolve: identity");
    it("has default on reject: thrower", function (done) {
        var errorObject = {};
        var p = new Promise(function (resolve, reject) {
            reject(errorObject);
        });

        p.then().catch(function (rejected) {
            assert.equal(errorObject, rejected);
        }).then(done).catch(done);
    });

    it("does not call either function immediately if promise status is 'pending'");

    it("does call onFulfilled immediately if promise status is 'fulfilled'");
    it("never calls onRejected if promise status is 'fulfilled'");

    it("never calls onFullfilled if promise status is 'rejected'");
    it("does call onRejected immediately if promise status is 'rejected'");

    it("returns its 'this' argument if it is of type 'Promise'");
    it("returns a Promise-wrapped version of 'this' if 'this' is not of type 'Promise'");
});
