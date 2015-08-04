describe("myApp.login", function () {
    var test;

    beforeEach(module('myApp.login'));
    beforeEach(inject(function(_test_) {
        test = _test_;
    }));

    it("should equal 2", function () {
        expect(test).toBe(4);
    });
});