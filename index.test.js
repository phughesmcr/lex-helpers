/**
 * Recreation of the example from {@link https://wwbp.org/lexica.html#refinement}
 * Use `node index.test.js` or `deno run index.test.js` to run this test.
 */

import lexHelpers from "./index.js";

const lex = {
  a: 3,
  b: 87,
  c: -15,
};

const doc1 = "a a b b b b b b b b b b c c c e e e e e e f f f f";

const doc2 = "a a a a a b b b c c c c c c c c d d d d f f f f f f f f f f";

const tokens = {
  doc1: doc1.split(" "),
  doc2: doc2.split(" "),
};

if (tokens.doc1.length !== 25) {
  throw new Error(
    `Expected doc1 to have 25 tokens, but found ${tokens.doc1.length}`,
  );
}

if (tokens.doc2.length !== 30) {
  throw new Error(
    `Expected doc2 to have 35 tokens, but found ${tokens.doc2.length}`,
  );
}

const freqs = {
  doc1: lexHelpers.getFrequencies(tokens.doc1),
  doc2: lexHelpers.getFrequencies(tokens.doc2),
};

if (freqs.doc1.size !== 5) {
  throw new Error(
    `Expected doc1 to have 5 unique tokens, but found ${freqs.doc1.size}`,
  );
}

if (freqs.doc2.size !== 5) {
  throw new Error(
    `Expected doc2 to have 5 unique tokens, but found ${freqs.doc2.size}`,
  );
}

const weightedRelativeFrequencies = {
  doc1: [...lexHelpers.getWeightedRelativeFrequencies(lex, freqs.doc1)],
  doc2: [...lexHelpers.getWeightedRelativeFrequencies(lex, freqs.doc2)],
};

const expected = {
  doc1: {
    a: Number(((2 / 25) * 3).toPrecision(15)),
    b: Number(((10 / 25) * 87).toPrecision(15)),
    c: Number(((3 / 25) * -15).toPrecision(15)),
  },
  doc2: {
    a: Number(((5 / 30) * 3).toPrecision(15)),
    b: Number(((3 / 30) * 87).toPrecision(15)),
    c: Number(((8 / 30) * -15).toPrecision(15)),
  },
};

let doc1Sum = 0;

for (const { token, value } of weightedRelativeFrequencies.doc1) {
  if (value !== expected.doc1[token]) {
    throw new Error(
      `Expected doc1 token ${token} to have value ${
        expected.doc1[token]
      }, but found ${value}`,
    );
  }
  doc1Sum += value;
}
if (doc1Sum !== 33.24) {
  throw new Error(`Expected doc1 sum to be 33.24, but found ${doc1Sum}`);
}

let doc2Sum = 0;

for (const { token, value } of weightedRelativeFrequencies.doc2) {
  if (value !== expected.doc2[token]) {
    throw new Error(
      `Expected doc2 token ${token} to have value ${
        expected.doc2[token]
      }, but found ${value}`,
    );
  }
  doc2Sum += value;
}

// AT THIS POINT, doc2Sum is 5.199999999999999 because of https://en.wikipedia.org/wiki/IEEE_754
// to correct it we can use `doc2Sum = parseFloat(doc2Sum.toFixed(10));`
// but `lexHelpers.sumValues()` and `lexHelpers.correctFloat()` are provided for convenience

// doc2Sum = lexHelpers.sumValues(weightedRelativeFrequencies.doc2, 10); // 10 is the default and can be omitted
// or
doc2Sum = lexHelpers.correctFloat(doc2Sum);

if (doc2Sum !== 5.2) {
  throw new Error(`Expected doc2 sum to be 5.2, but found ${doc2Sum}`);
}

const intercept = 23.2189;

const values = {
  doc1: lexHelpers.getLexiconValue(weightedRelativeFrequencies.doc1, intercept),
  doc2: lexHelpers.getLexiconValue(weightedRelativeFrequencies.doc2, intercept),
};

const expectedValues = {
  doc1: 56.4589,
  doc2: 28.4189,
};

// another example using correctFloat,
// though it isn't necessary in this case, I recommend using it where precision is important
if (lexHelpers.correctFloat(values.doc1) !== expectedValues.doc1) {
  throw new Error(
    `Expected doc1 value to be ${expectedValues.doc1}, but found ${values.doc1}`,
  );
}

if (values.doc2 !== expectedValues.doc2) {
  throw new Error(
    `Expected doc2 value to be ${expectedValues.doc2}, but found ${values.doc2}`,
  );
}

console.log("manual = success");

// now let's try using the pipeline

const pipeline = lexHelpers.lexPipeline(lex, intercept);

const pipeDoc1 = pipeline(tokens.doc1);
const pipeDoc2 = pipeline(tokens.doc2);

if (pipeDoc1 !== expectedValues.doc1) {
  throw new Error(
    `Expected doc1 value to be ${expectedValues.doc1}, but found ${pipeDoc1}`,
  );
}

if (pipeDoc2 !== expectedValues.doc2) {
  throw new Error(
    `Expected doc2 value to be ${expectedValues.doc2}, but found ${pipeDoc2}`,
  );
}

console.log("pipeline = success");
