import proxyquire from 'proxyquire';
import { expect } from 'chai';
import sinon from 'sinon';
import _ from 'underscore';

const {
    QueryParser
    } = proxyquire('../../../../imports/search/QueryParser', {
    'meteor/underscore': { _, '@noCallThru': true}
});

describe("QueryParser", function() {

    let parser;

    beforeEach(function() {
        parser = new QueryParser();
    });

    it("parses a simple query string containing only search tokens correctly", function() {
        const QUERY = "hello world";
        parser.parse(QUERY);
        let filterTokens = parser.getFilterTokens();
        let labelTokens = parser.getLabelTokens();
        let searchTokens = parser.getSearchTokens();

        expect(filterTokens, "should contain no filter tokens").to.have.length(0);
        expect(labelTokens, "should contain no label tokens").to.have.length(0);
        expect(searchTokens, "should contain 2 search tokens").to.have.length(2);

        expect(searchTokens).to.contain('hello');
        expect(searchTokens).to.contain('world');
    });

    it("parses a simple query string containing only label tokens correctly", function() {
        const QUERY = "#label 1 #label zwo";
        parser.parse(QUERY);

        let filterTokens = parser.getFilterTokens();
        let labelTokens = parser.getLabelTokens();
        let searchTokens = parser.getSearchTokens();

        expect(filterTokens, "should contain no filter tokens").to.have.length(0);
        expect(labelTokens, "should contain 2 label tokens").to.have.length(2);
        expect(searchTokens, "should contain no search tokens").to.have.length(0);

        expect(labelTokens).to.contain('label 1');
        expect(labelTokens).to.contain('label zwo');
    });

    it("parses a simple query string containing search tokens, keywords and labels correctly", function() {
        const QUERY = "hello is:open world #my label";
        parser.parse(QUERY);
        let filterTokens = parser.getFilterTokens();
        let labelTokens = parser.getLabelTokens();
        let searchTokens = parser.getSearchTokens();

        expect(filterTokens, "should contain 1 filter tokens").to.have.length(1);
        expect(labelTokens, "should contain 1 label token").to.have.length(1);
        expect(searchTokens, "should contain 2 search tokens").to.have.length(2);

        expect(searchTokens).to.contain('hello');
        expect(searchTokens).to.contain('world');
        expect(filterTokens).to.contain({key: 'is', value: 'open'});
        expect(labelTokens).to.contain('my label');
    });

});