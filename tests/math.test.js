import test from 'node:test';
import assert from 'node:assert/strict';
import {STREET,calculateValuation,calculateMortgage,calculateStampDuty,calculateOffer,calculateRentalYield} from '../src/math.js';

test('source reported street benchmark reproduces the reference',()=>{
 assert.equal(STREET.average,435500);
 assert.equal(calculateValuation().value,416100);
 assert.equal(calculateValuation(1351,'benchmark',false).rate,308);
});
test('type and newbuild assumptions remain independent and deterministic',()=>{
 assert.equal(calculateValuation(2000,'detached').value,751500);
 assert.equal(calculateValuation(2000,'detached',true).value,826700);
 assert.equal(calculateValuation(2000,'benchmark',false).value,616000);
});
test('mortgage amortisation handles normal case, zero interest and 100% deposit',()=>{
 const x=calculateMortgage(435500,20,4.5,25);
 assert.ok(x.monthly>1900&&x.monthly<2000);
 assert.equal(x.loan,348400);
 assert.equal(calculateMortgage(120000,0,0,10).monthly,1000);
 assert.equal(calculateMortgage(120000,95,0,10).monthly,50);
});
test('stamp duty main residence follows published England thresholds',()=>{
 assert.equal(calculateStampDuty(295000,'standard').total,4750);
 assert.equal(calculateStampDuty(435500,'standard').total,11775);
 assert.equal(calculateStampDuty(125000,'standard').total,0);
});
test('first time buyer relief restricted to qualifying purchase ceiling',()=>{
 assert.equal(calculateStampDuty(300000,'first').total,0);
 assert.equal(calculateStampDuty(500000,'first').total,10000);
 assert.equal(calculateStampDuty(500001,'first').total,15000.05);
});
test('second home surcharge added across bands',()=>{
 assert.equal(calculateStampDuty(300000,'additional').total,20000);
 assert.equal(calculateStampDuty(435500,'additional').total,33550);
});
test('offer comparisons consistent with street average',()=>{
 const v=calculateOffer(450000,425000);
 assert.equal(v.difference,25000);
 assert.ok(v.relative<0&&v.vsStreet<0);
});

test('rental yield responds to vacancies and running costs',()=>{const v=calculateRentalYield(435500,1800,2500,1);assert.equal(v.received,19800);assert.equal(v.netIncome,17300);assert.ok(v.net>3.9&&v.net<4);assert.equal(calculateRentalYield(435500,1800,0,12).net,0);});
