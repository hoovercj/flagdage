const { FlagDay, getFlagDay, getNextFlagDay, getPreviousFlagDay } = require('./index');


describe('FlagDay', () => {
    describe('matches', () => {
        test('matches same date', () => {
            const flagDay1 = new FlagDay('2018-01-01', 'Day 1');
            expect(flagDay1.matches('2018-01-01')).toBeTruthy();
        });

        test('Does not match different date', () => {
            const flagDay1 = new FlagDay('2018-01-01', 'Day 1');
            expect(flagDay1.matches('2018-01-02')).toBeFalsy();
        });

        test('Matches same day in different year by default', () => {
            const flagDay1 = new FlagDay('2018-01-01', 'Day 1');
            expect(flagDay1.matches('2019-01-01')).toBeTruthy();
        });

        test('Does not match same day in different year with recurring false', () => {
            const flagDay1 = new FlagDay('2018-01-01', 'Day 1', false);
            expect(flagDay1.matches('2019-01-01')).toBeFalsy();
        });
    });

    describe('with', () => {
        test('Returns a new object', () => {
            const flagDay1 = new FlagDay('2018-01-01', 'Day 1');
            const flagDay2 = flagDay1.with();
            expect(flagDay1 == flagDay2).toBeFalsy();
        });

        test('Returns an object with overridden properties', () => {
            const flagDay1 = new FlagDay('2018-01-01', 'Day 1', true);
            const flagDay2 = flagDay1.with({ recurring: false, name: 'Day 2'});
            expect(flagDay2.recurring).toBeFalsy();
            expect(flagDay2.name).toBe('Day 2');
        });
    });

    describe('compare', () => {
        test('Returns 0 for dates constructed with same date', () => {
            const day1 = new FlagDay('2018-01-01', 'Day 1');
            const day2 = new FlagDay('2018-01-01', 'Day 2');

            expect(FlagDay.compare(day1, day2)).toBe(0);
            expect(FlagDay.compare(day2, day1)).toBe(0);
        });

        test('Returns 1 if the first date is constructed with a date after the second date', () => {
            const day1 = new FlagDay('2018-01-02', 'Day 1');
            const day2 = new FlagDay('2018-01-01', 'Day 2');

            expect(FlagDay.compare(day1, day2)).toBe(1);
        });

        test('Returns -1 if the first date is constructed with a date before the second date', () => {
            const day1 = new FlagDay('2018-01-01', 'Day 1');
            const day2 = new FlagDay('2018-01-02', 'Day 2');

            expect(FlagDay.compare(day1, day2)).toBe(-1);
        });

        test('Returns 1 if the first date is constructed with an earlier day but in a later year', () => {
            const day1 = new FlagDay('2019-01-01', 'Day 1');
            const day2 = new FlagDay('2018-01-02', 'Day 2');

            expect(FlagDay.compare(day1, day2)).toBe(1);
        });

        test('Returns -1 if the first date is constructed with a later day but in an earlier year', () => {
            const day1 = new FlagDay('2017-01-02', 'Day 1');
            const day2 = new FlagDay('2018-01-01', 'Day 2');

            expect(FlagDay.compare(day1, day2)).toBe(-1);
        });
    });
});

describe('getNextFlagDay', () => {
    test('Returns falsy value if there are no flag days', () => {
        expect(getNextFlagDay('2018-01-01', [])).toBeFalsy();
    });

    test('Returns falsy value if non-recurring flag day occurs before the given date', () => {
        const date = '2018-02-02';
        const flagDays = [new FlagDay('2018-01-01', 'Day 1', false)];
        expect(getNextFlagDay(date, flagDays)).toBeFalsy();
    });

    test('Returns flag day if it occurs after the given date', () => {
        const date = '2018-02-02';
        const flagDay = new FlagDay('2018-03-03', 'Day 1', false);
        const flagDays = [flagDay];
        expect(getNextFlagDay(date, flagDays)).toBe(flagDay);
    });

    test('Returns first recurring Flag Day if none occurs after the given date', () => {
        const date = '2018-02-02';
        const flagDays = [
            new FlagDay('2018-01-01', 'Day 1', false),
            new FlagDay('2018-01-02', 'Day 2', true),
            new FlagDay('2018-01-03', 'Day 3', false),
            new FlagDay('2018-01-04', 'Day 4', true),
            new FlagDay('2018-01-05', 'Day 5', false),
        ];

        const nextFlagDay = getNextFlagDay(date, flagDays);

        const expectedValues = {
            ...flagDays[1],
            date: '2019-01-02'
        };
        const actualValues = {
            ...nextFlagDay,
            date: nextFlagDay.date.start.format('YYYY-MM-DD')
        };
        expect(actualValues).toEqual(expectedValues);
    });
});

describe('getPreviousFlagDay', () => {
    test('Returns falsy value if there are no flag days', () => {
        expect(getNextFlagDay('2018-01-01', [])).toBeFalsy();
    });

    test('Returns falsy value if non-recurring flag day occurs after the given date', () => {
        const date = '2018-01-01';
        const flagDays = [new FlagDay('2018-02-02', 'Day 1', false)];
        expect(getPreviousFlagDay(date, flagDays)).toBeFalsy();
    });

    test('Returns flag day if it occurs before the given date', () => {
        const date = '2018-02-02';
        const flagDay = new FlagDay('2018-01-01', 'Day 1', false);
        const flagDays = [flagDay];
        expect(getPreviousFlagDay(date, flagDays)).toBe(flagDay);
    });

    test('Returns last recurring Flag Day if none occurs before the given date', () => {
        const date = '2018-01-01';
        const flagDays = [
            new FlagDay('2018-02-01', 'Day 1', false),
            new FlagDay('2018-02-02', 'Day 2', true),
            new FlagDay('2018-02-03', 'Day 3', false),
            new FlagDay('2018-02-04', 'Day 4', true),
            new FlagDay('2018-02-05', 'Day 5', false),
        ];

        const previousFlagDay = getPreviousFlagDay(date, flagDays);

        const expectedValues = {
            ...flagDays[3],
            date: '2017-02-04'
        }
        const actualValues = {
            ...previousFlagDay,
            date: previousFlagDay.date.start.format('YYYY-MM-DD')
        };
        expect(actualValues).toEqual(expectedValues);
    });
});

describe('getFlagDay', () => {
    test('Returns falsy value if there are no flag days', () => {
        expect(getFlagDay('2018-01-01', [])).toBeFalsy();
    });

    test('Returns falsy value if no flag day with same date', () => {
        const date = '2018-02-02';
        const flagDays = [new FlagDay('2018-01-01', 'Day 1', false)];
        expect(getFlagDay(date, flagDays)).toBeFalsy();
    });

    test('Returns flag day with same date', () => {
        const date = '2018-01-01';
        const flagDays = [new FlagDay('2018-01-01', 'Day 1', false)];
        expect(getFlagDay(date, flagDays)).toBe(flagDays[0]);
    });

    test('Returns flag day with same day in different year if flag day is recurring', () => {
        const date = '2019-01-01';
        const flagDays = [new FlagDay('2018-01-01', 'Day 1', true)];
        expect(getFlagDay(date, flagDays)).toBe(flagDays[0]);
    });

    test('Returns falsy value if flag day is a different year and not recurring', () => {
        const date = '2019-01-01';
        const flagDays = [new FlagDay('2018-01-01', 'Day 1', false)];
        expect(getFlagDay(date, flagDays)).toBeFalsy();
    });
});