import { test, expect } from '@playwright/test';

const _currency = 'FXCADAUD';
const _query = 'recent_weeks=10';
const _invalidQuery = 'weeks=10';
const _invalidCurrency = 'FXCADCAD';
let _totalDays: number;

test('Verify ' + _currency + ' endpoint returns 200 status', async ({ request }) => {
    const _response = await request.get(`/valet/observations/${_currency}/json?${_query}`, {
    });
    expect(_response.status(), "Status should not be other than 200").toBe(200);
});

test('Verify ' + _currency + ' endpoint return less than or equal to 50 days of observation data for 10 weeks', async ({ request }) => {
    const _response = await request.get(`/valet/observations/${_currency}/json?${_query}`, {
    });
    const _res = await _response.json();
    const _observations = _res.observations;
    _totalDays = Object.keys(_observations).length;
    expect(_totalDays, "Total days of 10 weeks should not be greater than 50").toBeLessThanOrEqual(50);
});

test('Verify average of 10 weeks Foreign conversion rate for  ' + _currency + ' is greater than or equal to minimum conversion rate', async ({ request }) => {
    const _response = await request.get(`/valet/observations/${_currency}/json?${_query}`, {
    });
    const _res = await _response.json();
    const _observations = _res.observations;
    _totalDays = Object.keys(_observations).length;
    const _average = countAverage(_observations, _totalDays);
    expect(_average, "The average should not be less than min value of Forex Conversion rate").toBeGreaterThanOrEqual(findMin(_observations, _totalDays));
});

test('Verify average of 10 weeks Foreign conversion rate for  ' + _currency + ' is less than or equal to maximum conversion rate', async ({ request }) => {
    const _response = await request.get(`/valet/observations/${_currency}/json?${_query}`, {
    });
    const _res = await _response.json();
    const _observations = _res.observations;
    _totalDays = Object.keys(_observations).length;
    const _average = countAverage(_observations, _totalDays);
    expect(_average, "The average should not be greater than max value of Forex Conversion rate").toBeLessThanOrEqual(findMax(_observations, _totalDays));
    expect(_average, "The average should not be less than 0").toBeGreaterThan(0);
});

test('Verify average of 10 weeks Foreign conversion rate  ' + _currency + ' is greater than 0', async ({ request }) => {
    const _response = await request.get(`/valet/observations/${_currency}/json?${_query}`, {
    });
    const _res = await _response.json();
    const _observations = _res.observations;
    _totalDays = Object.keys(_observations).length;
    const _average = countAverage(_observations, _totalDays);
    expect(_average, "The average should not be less than 0").toBeGreaterThan(0);
});

test('Verify observations/' + _currency + ' endpoint throws error for invalid query', async ({ request }) => {
    const _response = await request.get(`/valet/observations/${_currency}/json?${_invalidQuery}`, {
    });
    const _res = await _response.json();
    expect(_response.status(), "Status should be 400").toBe(400);
    expect(_res.message, "There should be an error message").toBe("The following query parameters are invalid: weeks");
    expect(_res.docs, "There should be a link to docs").toBe("https://www.bankofcanada.ca/valet/docs");
});

test('Verify observations/' + _invalidCurrency + ' endpoint throws error for invalid currency', async ({ request }) => {
    const _response = await request.get(`/valet/observations/${_invalidCurrency}/json?${_query}`, {
    });
    const _res = await _response.json();
    expect(_response.status(), "Status should be 404").toBe(404);
    expect(_res.message, "There should be an error message").toBe("Series FXCADCAD not found.");
    expect(_res.docs, "There should be a link to docs").toBe("https://www.bankofcanada.ca/valet/docs");
});

function countAverage(obs: Object, num: number) {
    let _total = 0.0;
    for (let i = 0; i < num; i++) {
        const val = obs[i].FXCADAUD.v;
        _total = _total + parseFloat(val);
    }
    return _total / num;
}

function findMin(obs: Object, num: number) {
    let _min = obs[0].FXCADAUD.v;
    for (let i = 1; i < num; i++) {
        const val = obs[i].FXCADAUD.v;
        _min = (_min < val) ? _min : val;
    }
    return parseFloat(_min);
}

function findMax(obs: Object, num: number) {
    let _max = obs[0].FXCADAUD.v;
    for (let i = 1; i < num; i++) {
        const val = obs[i].FXCADAUD.v;
        _max = (_max > val) ? _max : val;
    }
    return parseFloat(_max);
} 
