/** !
 *
 * 🧮
 * Help make lex-helpers even better:
 * https://github.com/phughesmcr/lex-helpers
 *
 * @module
 * @name         lex-helpers
 * @file         index.js
 * @description  Utility functions for calculating Open Vocabulary approach lexicon values.
 * @author       P. Hughes <github@phugh.es> (https://www.phugh.es)
 * @copyright    2024. All rights reserved.
 * @license      MIT
 */

/**
 * Correct IEEE 754 floating point errors.
 * @public
 * @param {number} value
 * @param {number} [fractionDigits=10] `sum.toFixed(fractionDigits)`. Defaults to 10.
 * @returns {number} The corrected value.
 */
export const correctFloat = (value, fractionDigits = 10) => {
  return parseFloat(value.toFixed(fractionDigits));
};

/**
 * Returns the sum of the values in a map.
 * @internal
 * @param {Map<any, number>} target The map whose values should be summed.
 * @returns {number} The sum of the map's values.
 */
export const getMapSum = (target) => {
  let sum = 0;
  for (const [_, value] of target) {
    sum += value;
  }
  return sum;
};

/**
 * Returns the sum of the values in an array of objects.
 * @internal
 * @param {ArrayLike<{ value: number }>} target
 * @returns {number} The sum of the values in an array of objects.
 */
export const getObjSum = (target) => {
  let sum = 0;
  for (const { value } of target) {
    sum += value;
  }
  return sum;
};

/**
 * Sum and correct the values in an ArrayLike of objects.
 * @public
 * @param {ArrayLike<{ value: number }>} values
 * @param {number} [fractionDigits=10] `sum.toFixed(fractionDigits)`. Defaults to 10.
 * @returns {number} The corrected sum of the values.
 */
export const sumValues = (values, fractionDigits = 10) => {
  const sum = getObjSum(values);
  return correctFloat(sum, fractionDigits);
};

/**
 * Calculates the weighted relative frequency of each token.
 * i.e., `(count / wordCount) * lex`
 * @public
 * @param {Record<string, number>} lexicon An object containing lexicon values for tokens.
 * @param {Map<string, number>} freqs A map of token frequencies.
 * @param {number} [wordCount] The total number of tokens. Defaults to the sum of `freqs` values.
 * @returns {IterableIterator<{ token: string, value: number }>}
 */
export const getWeightedRelativeFrequencies = function* (
  lexicon,
  freqs,
  wordCount,
) {
  wordCount = wordCount || getMapSum(freqs);
  for (const [token, freq] of freqs) {
    if (Object.prototype.hasOwnProperty.call(lexicon, token)) {
      yield {
        token,
        value: (freq * lexicon[token]) / wordCount,
      };
    }
  }
};

/**
 * Counts the number of occurrences of each token in an array of tokens.
 * @public
 * @param {string[]} tokens
 * @returns {Map<string, number>}
 */
export const getFrequencies = (tokens) => {
  const freqs = new Map();
  for (const token of tokens) {
    freqs.set(token, (freqs.get(token) || 0) + 1);
  }
  return freqs;
};

/**
 * Calculates the value of a given usage object with optional intercept.
 * @public
 * @param {Array<{ token: string, value: number }>} weightedFreqs An array of weighted relative frequency objects.
 * @param {number} [intercept=0] An optional intercept value to add to the total usage value. Defaults to 0.
 * @returns {number} The total usage value.
 */
export const getLexiconValue = (weightedFreqs, intercept = 0) => {
  return getObjSum(weightedFreqs) + intercept;
};

/**
 * A simple synchronous pipeline for calculating lexicon values.
 * Unlikely to be suitable for large datasets.
 * @param {Record<string, number>} lexicon An object containing lexicon values for tokens.
 * @param {number} [intercept=0] An optional intercept value to add to the total usage value. Defaults to 0.
 * @param {number} [fractionDigits=10] `sum.toFixed(fractionDigits)`. Defaults to 10.
 * @returns {(tokens: string[], fractionDigitsOverride?: number): number}
 */
export const lexPipeline = (lexicon, intercept = 0, fractionDigits = 10) => {
  return (
    tokens,
    interceptOverride = intercept,
    fractionDigitsOverride = fractionDigits,
  ) => {
    const freqs = getFrequencies(tokens);
    const weightedFreqs = getWeightedRelativeFrequencies(lexicon, freqs);
    const value = getLexiconValue(weightedFreqs, interceptOverride);
    return correctFloat(value, fractionDigitsOverride);
  };
};

export default {
  correctFloat,
  getFrequencies,
  getWeightedRelativeFrequencies,
  getLexiconValue,
  lexPipeline,
  sumValues,
};
