import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HOME_TITLE, homeMetaDescription } from './home-meta';
import {
  areaIsIndexable,
  buildHubCopy,
  MIN_INDEXABLE_AREA_CLINICS,
  withMinimumHubLinks,
} from './hub-copy';
import { TITLE_MAX_LENGTH } from './page-title';

const klang = {
  clinicCount: 101,
  sundayOpenCount: 58,
  whatsappCount: 3,
};

describe('area index threshold', () => {
  it('indexes an area only when it has at least 3 active approved clinics', () => {
    assert.equal(MIN_INDEXABLE_AREA_CLINICS, 3);
    assert.equal(areaIsIndexable(0), false);
    assert.equal(areaIsIndexable(2), false);
    assert.equal(areaIsIndexable(3), true);
    assert.equal(areaIsIndexable(4), true);
  });
});

describe('hub copy', () => {
  it('builds question headings and FAQ answers from the stored counts', () => {
    const copy = buildHubCopy('Klang', 'Klang, Selangor', klang);

    assert.equal(copy.questions.length, 3);
    assert.equal(copy.faq.length, 5);
    assert.match(copy.questions[0].heading, /^How many dental clinics are in Klang\?$/);
    assert.match(
      copy.questions[0].answer,
      /101 active approved dental clinics are listed in Klang, Selangor/,
    );
    assert.match(copy.questions[1].answer, /58 have a Sunday opening time stored/);
    assert.match(copy.questions[2].answer, /3 have a WhatsApp number stored/);
    assert.deepEqual(
      copy.rows.map((row) => row.label),
      ['Active clinics', 'Open on Sunday', 'With WhatsApp'],
    );

    const text = JSON.stringify(copy);
    assert.doesNotMatch(text, /public holiday/i);
    assert.doesNotMatch(text, /best|top-rated|trusted|official|government|private|price|RM\d/i);
  });

  it('keeps a Sunday count of 0 and omits WhatsApp when none is stored', () => {
    const copy = buildHubCopy('Gurun', 'Gurun, Kedah', {
      clinicCount: 2,
      sundayOpenCount: 0,
      whatsappCount: 0,
    });

    assert.match(copy.questions[1].answer, /0 have a Sunday opening time stored/);
    assert.equal(
      copy.questions.some((question) => /whatsapp/i.test(question.heading)),
      false,
    );
    assert.equal(
      copy.faq.some((item) => /whatsapp/i.test(item.heading)),
      false,
    );
    assert.deepEqual(
      copy.rows.map((row) => row.label),
      ['Active clinics', 'Open on Sunday'],
    );
    assert.equal(copy.rows[1].value, '0');
    assert.doesNotMatch(JSON.stringify(copy), /public holiday/i);
  });
});

describe('hub links', () => {
  it('fills related links up to 8 without dropping the ones provided', () => {
    const links = withMinimumHubLinks([
      { href: '/kedah', label: 'Dental clinics in Kedah' },
      { href: '/kedah/jitra', label: 'Jitra' },
    ]);

    assert.ok(links.length >= 8);
    assert.equal(links[0].href, '/kedah');
    assert.equal(links[1].href, '/kedah/jitra');
  });
});

describe('homepage meta', () => {
  it('keeps the title within 60 characters and out of booking language', () => {
    assert.ok(HOME_TITLE.length <= TITLE_MAX_LENGTH);
    assert.doesNotMatch(HOME_TITLE, /book/i);
    const description = homeMetaDescription(2641, 16);
    assert.doesNotMatch(description, /book/i);
    assert.match(description, /2,641 active clinics across 16 states/);
    assert.doesNotMatch(homeMetaDescription(0, 0), /book/i);
  });
});
