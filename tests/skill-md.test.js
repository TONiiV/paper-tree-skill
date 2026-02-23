const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SKILL_PATH = path.join(__dirname, '..', 'skills', 'paper-tree', 'SKILL.md');
const skill = fs.readFileSync(SKILL_PATH, 'utf-8');

const EVALS_PATH = path.join(__dirname, 'evals.json');
const evals = JSON.parse(fs.readFileSync(EVALS_PATH, 'utf-8'));

// ===========================================================================
// SKILL.md Content Tests
// ===========================================================================
describe('SKILL.md output instructions', () => {
  it('does NOT reference /mnt/user-data/outputs/', () => {
    assert.ok(
      !skill.includes('/mnt/user-data/outputs/'),
      'SKILL.md should not contain the old hardcoded /mnt/user-data/outputs/ path'
    );
  });

  it('references current project directory', () => {
    assert.ok(
      skill.includes('current project directory'),
      'SKILL.md should mention saving to the current project directory'
    );
  });

  it('supports user-specified paths', () => {
    assert.ok(
      skill.includes('user-specified path') || skill.includes('custom output path'),
      'SKILL.md should mention user-specified/custom output paths'
    );
  });

  it('includes default filename pattern', () => {
    assert.ok(
      skill.includes('paper_tree_[field].html'),
      'SKILL.md should include the default filename pattern'
    );
  });

  it('includes example filenames', () => {
    for (const name of ['paper_tree_diffusion.html', 'paper_tree_rl.html', 'paper_tree_nlp.html']) {
      assert.ok(skill.includes(name), `SKILL.md should include example filename ${name}`);
    }
  });
});

// ===========================================================================
// SKILL.md Completeness Tests
// ===========================================================================
describe('SKILL.md required sections', () => {
  const requiredSections = [
    'Workflow Overview',
    'Understand Scope',
    'Curate Papers',
    'Define Column Tracks',
    'Define Timeline Rows',
    'Layout Assignment',
    'Define Edges',
    'Generate HTML',
    'Verify',
    'Output',
    'Quality Standards',
  ];

  for (const section of requiredSections) {
    it(`contains "${section}" section`, () => {
      assert.ok(
        skill.includes(section),
        `SKILL.md should contain a "${section}" section`
      );
    });
  }
});

// ===========================================================================
// SKILL.md + base.html Feature Consistency
// ===========================================================================
describe('SKILL.md describes current features', () => {
  const baseHtml = fs.readFileSync(path.join(__dirname, '..', 'skills', 'paper-tree', 'base.html'), 'utf-8');

  it('mentions drag-to-pan (which exists in base.html)', () => {
    assert.ok(skill.includes('drag-to-pan') || skill.includes('pan'), 'SKILL.md should mention panning');
    assert.ok(baseHtml.includes('mousedown') && baseHtml.includes('mousemove'), 'base.html should have drag handlers');
  });

  it('paper schema in SKILL.md matches fields used in base.html', () => {
    // Key fields that the engine references
    const requiredFields = ['id', 'cat', 'col', 'era', 'star', 'sota', 'short', 'venue', 'title', 'authors', 'desc', 'tags', 'url'];
    for (const field of requiredFields) {
      assert.ok(skill.includes(field), `SKILL.md schema should document field "${field}"`);
    }
  });
});

// ===========================================================================
// evals.json Consistency Tests
// ===========================================================================
describe('evals.json', () => {
  it('is a valid JSON array', () => {
    assert.ok(Array.isArray(evals));
    assert.ok(evals.length > 0, 'Should have at least one eval');
  });

  it('each eval has required fields', () => {
    for (const e of evals) {
      assert.ok(e.id, 'Eval should have an id');
      assert.ok(e.description, 'Eval should have a description');
      assert.ok(e.prompt, 'Eval should have a prompt');
      assert.ok(Array.isArray(e.expectations), 'Eval should have expectations array');
      assert.ok(e.expectations.length > 0, 'Eval should have at least one expectation');
    }
  });
});
