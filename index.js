'use strict';

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const moment = require('moment');
require('moment-recur');

// TODO: Augment this with:
// * Localized names of flag days
// * "multi-day" OR some way that I can use to say "flags fly today for Pride week and continue flying until Jan X"
class FlagDay {
    constructor(date, name, recurring = true, emoji = '🇩🇰') {
        // TODO: Check if it is necessary to include this guard against recur not being available
        // if (recurring && moment().recur) {
        if (recurring && moment()) {
            this.date = moment(date).recur().every(1).year();
        } else {
            this.date = moment(date);
        }
        this.name = name;
        this.emoji = emoji;
        this.recurring = recurring;
    }

    with(options = {}) {
        const thisOptions = {
            date: this.date,
            name: this.name,
            recurring: this.recurring,
            emoji: this.emoji,
        };

        return new FlagDay(
            options.date || this.date,
            options.name || this.name,
            options.recurring !== undefined ? options.recurring : this.recurring,
            options.emoji || this.emoji
        );
    }

    matches(date) {
        if (typeof this.date.matches === 'function') {
            return this.date.matches(date);
        }
        return this.date.isSame(date, 'day');
    }

    /**
     * Compares two flag days by date. Returns -1 if the first
     * date is before the second date, 1 if it is after, and
     * 0 if it is the same.
     * NOTE: Recurring dates are compared based on start date,
     * which means a recurring date that was started in a later year
     * will be considered later, even if it occurs earlier in a given
     * year than another recurring date.
     * @param {FlagDay} a The first flag day to compare
     * @param {FlagDay} b The second flag day to compare
     */
    static compare(a, b) {
        const aDate = a.date.start || a.date;
        const bDate = b.date.start || b.date;

        if (aDate.isBefore(bDate)) {
            return -1;
        } else if (aDate.isAfter(bDate)) {
            return 1;
        } else {
            return 0;
        }
    }
}

const flagDays = [
    new FlagDay('2018-01-01', 'Nytårsdag'),
    new FlagDay('2018-02-05', 'Kronprinsesse Marys fødselsdag'),
    new FlagDay('2018-02-06', 'Prinsesse Maries fødselsdag'),
    new FlagDay('2018-03-23', 'Nordens dag'),
    new FlagDay('2018-04-09', 'Danmarks besættelse 1940'),
    new FlagDay('2018-04-16', 'Dronning Margrethes fødselsdag'),
    new FlagDay('2018-04-29', 'Prinsesse Benediktes fødselsdag'),
    new FlagDay('2018-05-01', 'Arbejdernes kampdag'),
    new FlagDay('2018-05-04', 'Danmarks Befrielsesdag'),
    new FlagDay('2018-05-05', 'Danmarks befrielse 1945'),
    new FlagDay('2018-05-06', 'Børnehjælpsdagen'),
    new FlagDay('2018-05-09', 'Europadag', true, '🇪🇺'),
    new FlagDay('2018-05-26', 'Kronprins Frederiks fødselsdag'),
    new FlagDay('2018-06-05', 'Grundlovsdag'),
    new FlagDay('2018-06-07', 'Prins Joachims fødselsdag'),
    new FlagDay('2018-06-15', 'Valdemarsdag og Genforeningsdag'),
    new FlagDay('2018-09-05', 'Danmarks Udsendte'),
    new FlagDay('2018-10-24', 'FN-dag', true, '🇺🇳'),
    new FlagDay('2018-12-25', 'Juledag'),
    // 2018
    new FlagDay('2018-03-30', 'Langfredag', false),
    new FlagDay('2018-04-01', 'Påskedag', false),
    new FlagDay('2018-08-13', 'Copenhagen Pride', false, '🏳️‍🌈'),
    new FlagDay('2018-08-14', 'Copenhagen Pride', false, '🏳️‍🌈'),
    new FlagDay('2018-08-15', 'Copenhagen Pride', false, '🏳️‍🌈'),
    new FlagDay('2018-08-16', 'Copenhagen Pride', false, '🏳️‍🌈'),
    new FlagDay('2018-08-17', 'Copenhagen Pride', false, '🏳️‍🌈'),
    new FlagDay('2018-08-18', 'Copenhagen Pride', false, '🏳️‍🌈'),
    new FlagDay('2018-08-19', 'Copenhagen Pride', false, '🏳️‍🌈')
]
.sort(FlagDay.compare);

/**
 * Gets the flag day associated with a date, or today if no date is provided.
 *
 * @param {any} date (optional) Anything that can be parsed by moment.js into a date object.
 * @returns {FlagDay} Returns the flag day for the provided date, or today if none is provided.
 * Returns undefined if there is no flagday for the date.
 */
function getFlagDay(date, days = flagDays) {
    const momentDate = moment(date);

    for (let i = 0; i < days.length; i++) {
        if (days[i].matches(momentDate)) {
            return days[i];
        }
    }
}

function getNextFlagDay(date, days = flagDays) {
    const momentDate = moment(date);

    const sortedDays = days.slice().sort(FlagDay.compare);

    // First try to find the first date after the given date (default: today)
    let flagDay, flagDayDate;
    for (let i = 0; i < sortedDays.length; i++) {
        flagDay = sortedDays[i];
        flagDayDate = flagDay.date.start || flagDay.date;
        if (flagDayDate.isAfter(momentDate)) {
            return flagDay;
        }
    }

    // If nothing in the list was after that date,
    // then find the first recurring date next year
    for (let i = 0; i < sortedDays.length; i++) {
        flagDay = sortedDays[i];
        if (flagDay.recurring && flagDay.date.start) {
            return flagDay.with({ date: flagDay.date.start.add(1, 'years') });
        }
    }
}

function getPreviousFlagDay(date, days = flagDays) {
    const momentDate = moment(date);

    // First try to find the first date before the given date (default: today)
    let flagDay, flagDayDate;
    for (let i = days.length - 1; i >= 0; i--) {
        flagDay = days[i];
        flagDayDate = flagDay.date.start || flagDay.date;
        if (flagDayDate.isBefore(momentDate)) {
            return flagDay;
        }
    }

    // If nothing in the list was before that date,
    // then find the last recurring date of the previous year
    for (let i = days.length - 1; i >= 0; i--) {
        flagDay = days[i];
        if (flagDay.recurring && flagDay.date.start) {
            return flagDay.with({ date: flagDay.date.start.subtract(1, 'years') });
        }
    }
}

module.exports = {
    FlagDay,
    flagDays,
    getFlagDay,
    getPreviousFlagDay,
    getNextFlagDay,
};
