import { _ } from 'meteor/underscore';

const KEYWORDS = {
    IS: {
        key: 'is',
        values: ['open', 'closed', 'info', 'action', 'new']
    }
};

export class TopicFilter {

    constructor(queryParser, getLabelIdByName) {
        if (null === queryParser || undefined === queryParser) {
            throw new Meteor.Error('illegal-state', 'Please inject a query parser.');
        }
        this.getLabelIdByName = getLabelIdByName;
        this.currentTopics = null;
        this.parser = queryParser;
    }

    filter(topics, query) {
        this.currentTopics = topics;
        this.parser.parse(query);

        this.currentTopics = this._filterTopics();
        let result = this.currentTopics;
        this.currentTopics = null;
        this.parser.reset();
        return result;
    }


    _filterTopics() {
        this._checkFilterState();

        let infoItemFilter = item => {
            return this.constructor._itemMatchesSearchTokens(item, this.parser.getSearchTokens())
                && this._itemMatchesLabelTokens(item, this.parser.getLabelTokens())
                && this.constructor._itemMatchesFilterTokens(item, this.parser.getFilterTokens());
        };

        return this.currentTopics
            .filter(topic => topic.infoItems.some(infoItemFilter))
            .map(topic => {
                let newTopic = Object.assign({}, topic);
                newTopic.infoItems = topic.infoItems.filter(infoItemFilter);
                return newTopic;
            });
    }

    _checkFilterState() {
        if (null === this.currentTopics) {
            throw new Meteor.Error('illegal-state', 'Current state invalid. Query or topics-array null.');
        }
    }

    static _itemMatchesSearchTokens(item, searchTokens) {
        for (let i=0; i < searchTokens.length; i++) {
            let token = searchTokens[i];
            if (item.subject.indexOf(token) === -1) {
                return false;
            }
        }
        return true;
    }

    static _itemMatchesFilterTokens(item, filterTokens) {
        for (let i=0; i < filterTokens.length; i++) {
            let filter = filterTokens[i];

            switch (filter.key) {
                case KEYWORDS.IS.key:
                {
                    if (!TopicFilter._itemMatchesKeyword_IS(item, filter.value)) {
                        return false;
                    }
                    break;
                }
                default: throw new Meteor.Error('illegal-state', `Unknown filter keyword: ${filter.key}`);
            }
        }

        return true;
    }

    static _itemMatchesKeyword_IS(item, value) {
        switch (value) {
            case 'open':
                return item.isOpen;
            case 'closed':
                // explicit comparison required to skip info items (which has no isOpen property)
                return item.isOpen === false;
            case 'info':
                return item.itemType === 'infoItem';
            case 'action':
                return item.itemType === 'actionItem';
            case 'new':
                return item.isNew;
            default: throw new Meteor.Error('illegal-state', `Unknown filter value: ${filter.value}`);
        }
    }

    _itemMatchesLabelTokens(item, labelTokens) {
        for (let i=0; i < labelTokens.length; i++) {
            let labelToken = labelTokens[i];
            let labelId = (this.getLabelIdByName) ? this.getLabelIdByName(labelToken) : labelToken;
            if (!_.contains(item.labels, labelId)) {
                return false;
            }
        }

        return true;
    }
}