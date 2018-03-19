(function() {
  'use strict';
  const async = require('async');

  /**
   * Combines multidimensional array elements into strings
   * @function arr2string
   * @param  {array} arr  input array
   * @return {array}      output array
   */
  function arr2string(arr) {
    if (!arr || typeof arr !== 'object') {
      throw new Error('arr2string needs an array!');
    }
    const len = arr.length;
    const result = [];
    for (let i = 0; i < len; i++) {
      result.push(arr[i].join(' '));
    }
    return result;
  }

  /**
   * @function doLex
   * @param  {object} matches   lexical matches object
   * @param  {object} ints      intercept values
   * @param  {number} dec       decimal places limit
   * @param  {string} enc       type of lexical encoding
   * @param  {number} wc        total word count
   * @return {object}           lexical values object
   */
  function doLex(matches, ints, dec, enc, wc) {
    // error handling
    if (!matches || !ints) {
      throw new Error('doLex needs both matches and ints objects!');
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
    if (!enc) {
      throw new Error('doLex needs encoding type!');
    } else if (typeof enc !== 'string') {
      enc = enc.toString();
    }
    if (!wc) {
      if (enc.match(/freq/gi)) {
        throw new Error('doLex: frequency encoding needs word count!');
      } else {
        wc = 0;
      }
    } else if (typeof wc !== 'number') {
      wc = ~~wc;
    }
    // meat
    const values = {};
    async.each(Object.keys(matches), function(cat, callback) {
      values[cat] = calcLex(matches[cat], ints[cat], dec, enc, wc);
      callback();
    }, function(err) {
      if (err) throw new Error(err);
    });
    return values;
  }

  /**
   * @function doMatches
   * @param  {object} matches   lexical matches object
   * @param  {string} by        how to sort arrays
   * @param  {number} wc        total word count
   * @param  {number} dec       decimal places limit
   * @param  {string} enc       type of lexical encoding
   * @return {object}           sorted matches object
   */
  function doMatches(matches, by, wc, dec, enc) {
    // error handling
    if (!matches || typeof matches !== 'object') {
      throw new Error('doMatches needs an input object!');
    }
    if (!enc) {
      throw new Error('doMatches needs encoding type!');
    } else if (typeof enc !== 'string') {
      enc = enc.toString();
    }
    if (!wc) {
      if (enc.match(/freq/gi)) {
        throw new Error('doMatches: frequency encoding needs word count!');
      } else {
        wc = 0;
      }
    } else if (typeof wc !== 'number') {
      wc = ~~wc;
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
    by = by || 'lex';
    // meat
    const match = {};
    async.each(Object.keys(matches), function(cat, callback) {
      match[cat] = prepareMatches(matches[cat], by, wc, dec,
          enc);
      callback();
    }, function(err) {
      if (err) throw new Error(err);
    });
    return match;
  }

  /**
   * Get the indexes of duplicate elements in an array
   * @function indexesOf
   * @param  {array}  arr   input array
   * @param  {string} str   string to test against
   * @return {array}        array of indexes
   */
  function indexesOf(arr, str) {
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
  }

  /**
   * Count items in array and return object as {item: count, item: count...}
   * @function itemCount
   * @param  {array}  arr  array of tokens
   * @return {object}
   */
  function itemCount(arr) {
    if (!arr) {
      throw new Error('itemCounts needs input!');
    }
    const output = {};
    const unique = [];
    let i = arr.length;
    while (i--) {
      let word = arr[i];
      if (unique.indexOf(word) === -1) {
        output[word] = indexesOf(arr, word).length;
        unique.push(word);
      }
    }
    return output;
  }

  /**
   * Sort and return an array by column
   * @function sortArrBy
   * @param   {array}   arr   input array
   * @param   {string}  by    what to sort by
   * @return  {array}
   */
  function sortArrBy(arr, by) {
    let x = 3; // default to sort by lexical value
    if (by.match(/weight/gi)) {
      x = 2;
    } else if (by.match(/freq/gi)) {
      x = 1;
    }
    return arr.sort((a, b) => 
      a[x] - b[x]
    );
  }

  /**
   * Prepare an object to be sorted by sortArrBy
   * @function prepareMatches
   * @param   {object} obj    input object
   * @param   {string} by     string
   * @param   {number} wc     word count
   * @param   {number} dec    decimal places
   * @param   {string} enc    encoding type
   * @return  {array}        sorted array
   */
  function prepareMatches(obj, by, wc, dec, enc) {
    // error handling
    if (!obj || typeof obj !== 'object') {
      throw new Error('prepareMatches needs an input object!');
    }
    if (!enc) {
      throw new Error('prepareMatches needs encoding type!');
    } else if (typeof enc !== 'string') {
      enc = enc.toString();
    }
    if (!wc) {
      if (enc.match(/freq/gi)) {
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
    async.each(Object.keys(obj), function(word, callback) {
      const freq = obj[word][1];
      const weight = Math.round(obj[word][2] * dec) / dec;
      let lex = weight;
      if (enc.match(/freq/gi)) {
        lex = Math.round(((freq / wc) * obj[word][2]) * dec) / dec;
      }
      matches.push([obj[word][0], freq, weight, lex]);
      m += freq;
    }, function(err) {
      if (err) throw new Error(err);
    });
    let x = sortArrBy(matches, by);
    return {
      matches: x,
      info: {
        total_matches: m,
        total_unique_matches: x.length,
        total_tokens: wc,
        percent_matches: parseFloat(((m / wc) * 100).toFixed(2)),
      },
    };
  }

  /**
   * Match token object against a lexicon object
   * @function getMatches
   * @param   {object} tkns token object
   * @param   {object} lex  lexicon object
   * @param   {number} min  minimum weight threshold
   * @param   {number} max  maximum weight threshold
   * @return  {object}     object of matches
   */
  function getMatches(tkns, lex, min, max) {
    // error handling
    if (!tkns || !lex || typeof tkns !== 'object' || typeof lex !== 'object') {
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
    const matches = {};
    const tokens = Object.keys(tkns);
    // async through each category in lexicon
    async.each(Object.keys(lex), function(category, callback) {
      const match = [];
      const data = lex[category];
      const keys = Object.keys(data);
      let i = tokens.length;
      while (i--) {
        let word = tokens[i];
        if (keys.indexOf(word) > -1) {
          const weight = data[word];
          if (weight < max && weight > min) {
            // tkns[word]: number of times word appears in text
            match.push([word, tkns[word], weight]);
          }
        }
      }
      matches[category] = match;
      callback();
    }, function(err) {
      if (err) throw new Error(err);
    });
    return matches;
  }

  /**
  * Calculate the total lexical value of matches
  * @function calcLex
  * @param {object} obj   matches object
  * @param {number} int   intercept value
  * @param {number} dec   decimal places
  * @param {string} enc   type of encoding to use
  * @param {number} wc    wordcount
  * @return {number}      lexical value
  */
  function calcLex(obj, int, dec, enc, wc) {
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
      if (enc.match(/freq/gi)) {
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
      if (enc.match(/freq/gi)) {
        // (word frequency / total wordcount) * weight
        lex += (obj[word][1] / wc) * obj[word][2];
      } else if (enc.match(/cent/gi)) {
        // percent of word count
        lex += obj[word][1] / wc;
      } else {
        // weight
        lex += obj[word][2];
      }
    }
    if (!enc.match(/cent/gi)) {
      // add the intercept value
      lex += int;
    }
    // return lex rounded to chosen decimal places
    return Math.round(lex * dec) / dec;
  }

  const lexHelpers = {
    arr2string: arr2string,
    calcLex: calcLex,
    doLex: doLex,
    doMatches: doMatches,
    getMatches: getMatches,
    indexesOf: indexesOf,
    itemCount: itemCount,
    prepareMatches: prepareMatches,
    sortArrBy: sortArrBy,
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = lexHelpers;
    }
    exports.lexHelpers = lexHelpers;
  } else {
    global.lexHelpers = lexHelpers;
  }
})();
