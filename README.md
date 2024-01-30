# Lex-Helpers

Functions for calculating Open Vocabulary lexical statistics.

## Quick Start

See [lexPipeline API documentation below](#lexpipeline). Also see
`index.test.js` for a recreation of the
[WWBP example]([https://www](https://wwbp.org/lexica.html#refinement)).

```javascript
// import your lexicon data as a JSON object (i.e., Record<string, number>)
import lexicon from "./lexicon.json" with { type: "json" }; // example

// import the lexPipeline function from this module
import { lexPipeline } from "lex-helpers";

// define your intercept
const intercept = 10.523; // example

// create your custom pipeline
const pipeline = lexPipeline(lexicon, intercept);

// get some tokens
const doc1Tokens = ["the", "cat", "sat", "on", "the", "mat"]; // example
const doc2Tokens = ["the", "dog", "sat", "on", "the", "hat"]; // example

// run the pipeline
const doc1result = pipeline(doc1tokens); // {number}
const doc2result = pipeline(doc2tokens); // {number}
```

## API

### correctFloat

Corrects IEEE 754 floating point errors using `toFixed`.

Example:

```javascript
import { correctFloat } from "lex-helpers";
const initial = 0.1 + 0.2; // 0.30000000000000004
const corrected = correctFloat(initial); // 0.3
```

### getFrequencies

Get the frequencies of tokens in a corpus.

Example:

```javascript
import { getFrequencies } from "lex-helpers";
const tokens = ["the", "cat", "sat", "on", "the", "mat"];
const frequencies = getFrequencies(tokens); // Map<{ the: 2, cat: 1, sat: 1, on: 1, mat: 1 }>
```

### getWeightedRelativeFrequencies

Get the weighted relative frequencies of tokens in a corpus.

Example:

```javascript
import { getWeightedRelativeFrequencies } from "lex-helpers";
const lexicon = { the: -93, cat: 100, sat: 50, on: -10, mat: 5 };
const frequencies = { the: 2, cat: 1, sat: 1, on: 1, mat: 1 };
const weightedRelativeFrequencies = getWeightedRelativeFrequencies(
  lexicon,
  frequencies,
); // IterableIterator<[string, number]>
```

### getLexiconValue

Get the final value of a token in a corpus.

Example:

```javascript
import { getLexiconValue } from "lex-helpers";
const weightedRelativeFrequencies = {
  the: 0.4,
  cat: 0.1,
  sat: 0.1,
  on: 0.1,
  mat: 0.1,
};
const intercept = 10.523;
const lexiconValue = getLexiconValue(weightedRelativeFrequencies, intercept); // {number}
```

### lexPipeline

Create a custom pipeline for calculating lexical statistics.

**N.B.** This is provided for simple use cases. For larger datasets it is
recommended that you create your own pipeline using the functions provided in
this module.

The pipeline is
`getFrequencies -> getWeightedRelativeFrequencies -> getLexiconValue -> correctFloat`

Example:

```javascript
import { lexPipeline } from "lex-helpers";
const lexicon = { the: 0.2, cat: 0.1, sat: 0.1, on: 0.1, mat: 0.1 };
const intercept = 10.523;
const pipeline = lexPipeline(lexicon, intercept);
const tokens = ["the", "cat", "sat", "on", "the", "mat"];
const result = pipeline(tokens); // 12.523
```

### sumValues

Sum and correct the values of an object.

Example:

```javascript
import { sumValues } from "lex-helpers";
const values = [{ value: 0.1 }, { value: 0.2 }, { value: 0.3 }];
const sum = sumValues(values); // 0.6
```

## License

(C) 2017-24 [P. Hughes](https://www.phugh.es). All rights reserved.

Released under the [MIT licence](http://spdx.org/licenses/MIT.html).
