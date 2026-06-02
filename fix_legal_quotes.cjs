const fs = require('fs');
let src = fs.readFileSync('./src/App.jsx', 'utf8');

// Fix all unescaped single quotes inside single-quoted JS strings within LEGAL_REFS
// The pattern is: strings like 'Widows' & Orphans'' → 'Widows\' & Orphans\''
// But since these are in template strings via our script, we need to find the exact strings and fix

const fixes = [
  ["en: 'Widows' & Orphans' Pension Fund Ordinance No. 1/1898',", "en: \"Widows' & Orphans' Pension Fund Ordinance No. 1/1898\","],
  ["en: 'Widowers' & Orphans' Pension Act No. 24/1983, S.3(1)',", "en: \"Widowers' & Orphans' Pension Act No. 24/1983, S.3(1)\","],
  ["en: 'Act No. 24/1983 S.3(1); Act No. 19/1985; Circular 03/2014 (opt-in deadline: 31 Dec 2014)',", "en: \"Act No. 24/1983 S.3(1); Act No. 19/1985; Circular 03/2014 (opt-in deadline: 31 Dec 2014)\","],
  ["en: 'Pension Circular No. 03/2014 — opt-in deadline expired 31 Dec 2014',", "en: \"Pension Circular No. 03/2014 — opt-in deadline expired 31 Dec 2014\","],
  ["en: 'Ordinance No. 1/1898 — permanent & pensionable post is mandatory for eligibility',", "en: \"Ordinance No. 1/1898 — permanent & pensionable post is mandatory for eligibility\","],
  ["en: 'Ordinance No. 1/1898 — contributions refundable; service ended without pension (<10 yrs)',", "en: \"Ordinance No. 1/1898 — contributions refundable; service ended without pension (<10 yrs)\","],
  ["en: 'Ordinance No. 1/1898 — minimum age 18 at date of appointment',", "en: \"Ordinance No. 1/1898 — minimum age 18 at date of appointment\","],
  ["en: 'Ordinance No. 1/1898 — statutory upper age limit for in-service contributors',", "en: \"Ordinance No. 1/1898 — statutory upper age limit for in-service contributors\","],
  ["en: 'W&O Pension Scheme (Armed Forces) Act No. 18/1970 — mandatory from 30 Sep 1968',", "en: \"W&O Pension Scheme (Armed Forces) Act No. 18/1970 — mandatory from 30 Sep 1968\","],
  ["en: 'W&O Pension Scheme (Armed Forces) Act No. 60/1998',", "en: \"W&O Pension Scheme (Armed Forces) Act No. 60/1998\","],
  ["en: 'Pension Circular No. 10/2009; Circular No. 02/2012 (opt-in deadline: 31 Dec 2012)',", "en: \"Pension Circular No. 10/2009; Circular No. 02/2012 (opt-in deadline: 31 Dec 2012)\","],
  ["en: 'Pension Circular No. 03/2006 — opt-in deadline: 30 Jun 2006',", "en: \"Pension Circular No. 03/2006 — opt-in deadline: 30 Jun 2006\","],
  ["en: 'Pension Circular No. 03/2006 — opt-in deadline expired 30 Jun 2006',", "en: \"Pension Circular No. 03/2006 — opt-in deadline expired 30 Jun 2006\","],
  ["en: 'Pension Circular No. 02/2012 — opt-in deadline expired 31 Dec 2012',", "en: \"Pension Circular No. 02/2012 — opt-in deadline expired 31 Dec 2012\","],
  ["en: 'Ordinance No. 1/1898, S.28 — marriage < 12 months, no children: widow ineligible',", "en: \"Ordinance No. 1/1898, S.28 — marriage < 12 months, no children: widow ineligible\","],
  ["en: 'Act No. 24/1983, S.11 — marriage < 12 months, no children: widower ineligible',", "en: \"Act No. 24/1983, S.11 — marriage < 12 months, no children: widower ineligible\","],
  ["en: 'W&O Pension Scheme (Armed Forces) Regulations 1970, Reg. 27(1)',", "en: \"W&O Pension Scheme (Armed Forces) Regulations 1970, Reg. 27(1)\","],
  ["en: 'Act No. 60/1998, S.26(1) — marriage < 12 months, no children: widower ineligible',", "en: \"Act No. 60/1998, S.26(1) — marriage < 12 months, no children: widower ineligible\","],
  ["en: 'Act No. 24/1983, S.25 — spouse/children from post-contribution marriage ineligible',", "en: \"Act No. 24/1983, S.25 — spouse/children from post-contribution marriage ineligible\","],
  ["en: 'Amendment Act No. 08/2010 (replacing Ordinance No. 1/1898, S.34) — 50% on remarriage',", "en: \"Amendment Act No. 08/2010 (replacing Ordinance No. 1/1898, S.34) — 50% on remarriage\","],
  ["en: 'Amendment Act No. 09/2010 (replacing Act No. 24/1983, S.18) — 50% on remarriage',", "en: \"Amendment Act No. 09/2010 (replacing Act No. 24/1983, S.18) — 50% on remarriage\","],
  ["en: 'Act No. 18/1970, S.37; Act No. 60/1998, S.36 — DG has discretion to award pension',", "en: \"Act No. 18/1970, S.37; Act No. 60/1998, S.36 — DG has discretion to award pension\","],
  ["en: 'Ordinance No. 1/1898, S.29 — orphan eligible until age 21 (general)',", "en: \"Ordinance No. 1/1898, S.29 — orphan eligible until age 21 (general)\","],
  ["en: 'Pension Circular No. 13/2010, S.4.2; W&OP Circular No. 01/99 — extended to age 26 if unemployed',", "en: \"Pension Circular No. 13/2010, S.4.2; W&OP Circular No. 01/99 — extended to age 26 if unemployed\","],
  ["en: 'Pension Circular No. 01/99, S.5 — orphan ineligible if employed (pensionable post, provident fund, foreign employment, or taxable income)',", "en: \"Pension Circular No. 01/99, S.5 — orphan ineligible if employed (pensionable post, provident fund, foreign employment, or taxable income)\","],
  ["en: 'Ordinance No. 1/1898, S.33 (amended by Act No. 44/1981); Act No. 24/1983, S.17 — legally adopted children treated equally',", "en: \"Ordinance No. 1/1898, S.33 (amended by Act No. 44/1981); Act No. 24/1983, S.17 — legally adopted children treated equally\","],
  ["en: 'Ordinance No. 1/1898, S.29A (inserted by Act No. 44/1981); Act No. 24/1983, S.7 — lifelong pension for permanently disabled orphans',", "en: \"Ordinance No. 1/1898, S.29A (inserted by Act No. 44/1981); Act No. 24/1983, S.7 — lifelong pension for permanently disabled orphans\","],
  ["en: 'Ordinance No. 1/1898, S.29A; Extraordinary Gazette No. 1719/3 of 15 Aug 2011, Reg. 5',", "en: \"Ordinance No. 1/1898, S.29A; Extraordinary Gazette No. 1719/3 of 15 Aug 2011, Reg. 5\","],
  ["en: 'Extraordinary Gazette No. 1719/3 of 15 Aug 2011, Reg. 5 — disabled orphan ineligible if imprisoned, residing abroad, or engaged in anti-social conduct',", "en: \"Extraordinary Gazette No. 1719/3 of 15 Aug 2011, Reg. 5 — disabled orphan ineligible if imprisoned, residing abroad, or engaged in anti-social conduct\","],
  ["en: 'W&O Pension Fund Ordinance No. 1/1898 — waiting period: 4 months (pensioner) / 12 months (in-service) from reference date',", "en: \"W&O Pension Fund Ordinance No. 1/1898 — waiting period: 4 months (pensioner) / 12 months (in-service) from reference date\","],
];

fixes.forEach(([from, to]) => {
  if (src.includes(from)) {
    src = src.replace(from, to);
    console.log('Fixed:', from.substring(0, 50));
  } else {
    console.warn('NOT FOUND:', from.substring(0, 60));
  }
});

fs.writeFileSync('./src/App.jsx', src, 'utf8');
console.log('Quote fixes done.');
