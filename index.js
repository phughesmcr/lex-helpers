'use strict'
;(function() {
  const global = this;
  const previous = global.lexHelpers;

  /**
   * Combines multidimensional array elements into strings
   * @function arr2string
   * @param {Array} arr input array
   * @return {Array} output array
   */
  const arr2string = (arr) => {
    if (!arr || typeof arr !== 'object') {
      throw new Error('arr2string needs an array!');
    }
    let i = 0;
    const len = arr.length;
    const result = [];
    for (i; i < len; i++) {
      result.push(arr[i].join(' '));
    }
    return result;
  };

  /**
   * Get the indexes of duplicate elements in an array
   * @function indexesOf
   * @param {Array} arr input array
   * @param {string} str string to test against
   * @return {Array} array of indexes
   */
  const indexesOf = (arr, str) => {
    if (!arr || !str) {
      throw new Error('indexesOf needs input!');
    }
    if (typeof str !== 'string') str = str.toString();
    const idxs = [];
    let i = arr.length;
    while (i--) {
      if (arr[i] === str) {
        idxs.unshift(i);
      }
    }
    return idxs;
  };

  /**
   * Sort and return an array by column
   * @function sortArrBy
   * @param {Array} arr input array
   * @param {string} by  what to sort by
   * @return {Array}
   */
  const sortArrBy = (arr, by) => {
    let x = 3; // default to sort by lexical value
    if (by === 'weight') {
      x = 2;
    } else if (by === 'freq' || by === 'frequency') {
      x = 1;
    }
    const sorter = (a, b) => {
      return a[x] - b[x];
    };
    return arr.sort(sorter);
  };

  /**
   * Prepare an object to be sorted by sortArrBy
   * @function prepareMatches
   * @param {Object} obj input object
   * @param {string} by string
   * @param {number} wc word count
   * @param {number} places decimal places
   * @param {string} enc encoding type
   * @return {Array} sorted array
   */
  const prepareMatches = (obj, by, wc, places, enc) => {
    // error handling
    if (!obj || typeof obj !== 'object') {
      throw new Error('prepareMatches needs an input object!');
    };
    if (!wc && (enc === 'freq' || enc === 'frequency')) {
      throw new Error('prepareMatches needs wordcount for frequency encoding!');
    };
    if (wc && typeof wc !== 'number') wc = Number(wc);
    by = by || 'lex';
    plcs = plcs || 9;
    if (typeof plcs !== 'number') plcs = Number(plcs);
    if (plcs > 20) {
      plcs = 9;
    } else if (plcs < 0) {
      plcs = 0;
    }
    // prepare matches
    let matches = [];
    let word;
    for (word in obj) {
      if (!obj.hasOwnProperty(word)) continue;
      const freq = Number(obj[word][1]);
      const weight = Number((obj[word][2]).toFixed(places));
      let lex = weight; // for binary encoding, lex is the same as weight
      if (enc === 'freq' || enc === 'frequency') {
        lex = (Number(freq / wc) * weight);
        lex = Number(lex.toFixed(places));
      }
      matches.push([obj[word][0], freq, weight, lex]);
    }
    return sortArrBy(matches, by);
  };

  /**
   * Match an array against a lexicon object
   * @function getMatches
   * @param {Array} arr token array
   * @param {Object} lex lexicon object
   * @param {number} min minimum weight threshold
   * @param {number} max maximum weight threshold
   * @return {Object} object of matches
   */
  const getMatches = (arr, lex, min, max) => {
    // error handling
    if (!arr || !lex || typeof arr !== 'object' || typeof lex !== 'object') {
      throw new Error('getMatches: invalid or absent input!');
    }
    if (!max) max = Number.POSITIVE_INFINITY;
    if (!min) min = Number.NEGATIVE_INFINITY;
    if (typeof max !== 'number') max = Number(max);
    if (typeof min !== 'number') min = Number(min);
    // loop through the lexicon categories
    const matches = {};
    let category;
    for (category in lex) {
      if (!lex.hasOwnProperty(category)) continue;
      let match = [];
      // loop through words in category
      let data = lex[category];
      let word;
      for (word in data) {
        if (!data.hasOwnProperty(word)) continue;
        // if word from input matches word from lexicon ...
        if (arr.indexOf(word) > -1) {
          let weight = Number((data[word]));
          if (weight < max && weight > min) {
            // reps: number of times word appears in text
            let reps = indexesOf(arr, word).length;
            let item = [word, reps, weight];
            match.push(item);
          }
        }
      }
      matches[category] = match;
    }
    // return matches object
    return matches;
  };

  /**
  * Calculate the total lexical value of matches
  * @function calcLex
  * @param {Object} obj matches object
  * @param {number} int intercept value
  * @param {number} plcs decimal places
  * @param {string} enc type of encoding to use
  * @param {number} wc wordcount
  * @return {number} lexical value
  */
  const calcLex = (obj, int, plcs, enc, wc) => {
    // error handling
    if (!obj) {
      throw new Error('calcLex needs input object!');
    }
    if (!wc && (enc === 'freq' || enc === 'frequency')) {
      throw new Error('frequency encoding needs word count!');
    }
    if (wc && typeof wc !== 'number') wc = Number(wc);
    int = int || 0;
    if (typeof int !== 'number') int = Number(int);
    plcs = plcs || 9;
    if (typeof plcs !== 'number') plcs = Number(plcs);
    if (plcs > 20) {
      plcs = 9;
    } else if (plcs < 0) {
      plcs = 0;
    }
    // Calculate lexical value
    let lex = 0;
    let word;
    for (word in obj) {
      if (!obj.hasOwnProperty(word)) continue;
      if (enc === 'freq' || enc === 'frequency') {
        // (word frequency / total wordcount) * weight
        lex += (Number(obj[word][1]) / wc) * Number(obj[word][2]);
      } else if (enc === 'cent' || enc === 'percent') {
        // percent of word count
        lex += Number(obj[word][1]) / wc;
      } else {
        // weight
        lex += Number(obj[word][2]);
      }
    }
    // add the intercept
    lex += int;
    // return final lexical value
    return Number(lex.toFixed(plcs));
  };

  const lexHelpers = {
    calcLex: calcLex,
    getMatches: getMatches,
    prepareMatches: prepareMatches,
    sortArrBy: sortArrBy,
    indexesOf: indexesOf,
    arr2string: arr2string,
  };

  lexHelpers.noConflict = function() {
    global.lexHelpers = previous;
    return lexHelpers;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = lexHelpers;
    }
    exports.lexHelpers = lexHelpers;
  } else {
    global.lexHelpers = lexHelpers;
  }
}).call(this);
