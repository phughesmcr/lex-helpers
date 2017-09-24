'use strict'
;(function() {
  const global = this;
  const previous = global.lexHelpers;

  /**
   * Combines multidimensional array elements into strings
   * @function arr2string
   * @param {Array} arr   input array
   * @return {Array}      output array
   */
  const arr2string = (arr) => {
    if (!arr || typeof arr !== 'object') {
      throw new Error('arr2string needs an array!');
    }
    const len = arr.length;
    const result = [];
    for (let i = 0; i < len; i++) {
      result.push(arr[i].join(' '));
    }
    return result;
  };

  /**
   * Get the indexes of duplicate elements in an array
   * @function indexesOf
   * @param {Array} arr   input array
   * @param {string} str  string to test against
   * @return {Array}      array of indexes
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
   * @param {Array} arr   input array
   * @param {string} by   what to sort by
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
   * @param {Object} obj    input object
   * @param {string} by     string
   * @param {number} wc     word count
   * @param {number} dec   decimal places
   * @param {string} enc    encoding type
   * @return {Array}        sorted array
   */
  const prepareMatches = (obj, by, wc, dec, enc) => {
    // error handling
    if (!obj || typeof obj !== 'object') {
      throw new Error('prepareMatches needs an input object!');
    };
    if (!enc) {
      throw new Error('prepareMatches needs encoding type!');
    } else if (typeof enc !== 'string') {
      enc = enc.toString();
    }
    if (!wc) {
      if (enc === 'freq' || enc === 'frequency') {
        throw new Error('frequency encoding needs word count!');
      } else {
        wc = 0;
      }
    } else if (typeof wc !== 'number') {
      wc = ~~wc;
    }
    by = by || 'lex';
    if (!dec) {
      dec = 9;
    } else if (typeof dec !== 'number') {
      dec = ~~dec;
    }
    if (dec > 20) {
      dec = 14;
    } else if (dec < 0) {
      dec = 0;
    }
    // prepare matches
    let matches = [];
    let m = 0;
    dec = Math.pow(10, dec);
    for (let word in obj) {
      if (!obj.hasOwnProperty(word)) continue;
      const freq = obj[word][1];
      const weight = Math.round(obj[word][2] * dec) / dec;
      let lex = weight;
      if (enc === 'freq' || enc === 'frequency') {
        lex = Math.round(((freq / wc) * obj[word][2]) * dec) / dec;
      }
      matches.push([obj[word][0], freq, weight, lex]);
      m += freq;
    }
    return {
      matches: sortArrBy(matches, by),
      info: {
        total_matches: m,
        total_tokens: wc,
        percent_matches: parseFloat(((m / wc) * 100).toFixed(2)),
      },
    };
  };

  /**
   * Match an array against a lexicon object
   * @function getMatches
   * @param {Array} arr   token array
   * @param {Object} lex  lexicon object
   * @param {number} min  minimum weight threshold
   * @param {number} max  maximum weight threshold
   * @return {Object}     object of matches
   */
  const getMatches = (arr, lex, min, max) => {
    // error handling
    if (!arr || !lex || typeof arr !== 'object' || typeof lex !== 'object') {
      throw new Error('getMatches: invalid or absent input!');
    }
    if (!max) {
      max = Number.POSITIVE_INFINITY;
    } else if (typeof max !== 'number') {
      max = parseFloat(max);
    }
    if (!min) {
      min = Number.NEGATIVE_INFINITY;
    } else if (typeof min !== 'number') {
      min = parseFloat(min);
    }
    // loop through the lexicon categories
    const matches = {};
    for (let category in lex) {
      if (!lex.hasOwnProperty(category)) continue;
      const match = [];
      const data = lex[category];
      const keys = Object.keys(data);
      let len = keys.length;
      while (len--) {
        let word = keys[len];
        if (arr.indexOf(word) > -1) {
          let weight = data[keys[len]];
          if (weight < max && weight > min) {
            // freq: number of times word appears in text
            let freq = indexesOf(arr, word).length;
            let item = [word, freq, weight];
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
  * @param {Object} obj     matches object
  * @param {number} int     intercept value
  * @param {number} dec  decimal places
  * @param {string} enc     type of encoding to use
  * @param {number} wc      wordcount
  * @return {number}        lexical value
  */
  const calcLex = (obj, int, dec, enc, wc) => {
    // error handling
    if (!obj) {
      throw new Error('calcLex needs input object!');
    }
    if (!enc) {
      throw new Error('calcLex needs encoding type!');
    } else if (typeof enc !== 'string') {
      enc = enc.toString();
    }
    if (!wc) {
      if (enc === 'freq' || enc === 'frequency') {
        throw new Error('frequency encoding needs word count!');
      } else {
        wc = 0;
      }
    } else if (typeof wc !== 'number') {
      wc = ~~wc;
    }
    if (!int) {
      int = 0;
    } else if (typeof int !== 'number') {
      int = parseFloat(int);
    }
    if (!dec) {
      dec = 9;
    } else if (typeof dec !== 'number') {
      dec = ~~dec;
    }
    if (dec > 20) {
      dec = 14;
    } else if (dec < 0) {
      dec = 0;
    }
    // Calculate lexical value
    let lex = 0;
    dec = Math.pow(10, dec);
    for (let word in obj) {
      if (!obj.hasOwnProperty(word)) continue;
      if (enc === 'freq' || enc === 'frequency') {
        // (word frequency / total wordcount) * weight
        lex += (obj[word][1] / wc) * obj[word][2];
      } else if (enc === 'cent' || enc === 'percent') {
        // percent of word count
        lex += obj[word][1] / wc;
      } else {
        // weight
        lex += obj[word][2];
      }
    }
    // add the intercept
    if (enc !== 'cent' || enc !== 'percent') {
      lex += int;
    } else {
      lex = lex * 100;
    }
    // return final lexical value
    return Math.round(lex * dec) / dec;
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
