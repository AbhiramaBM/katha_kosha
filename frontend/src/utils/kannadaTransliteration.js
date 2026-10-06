/**
 * Kannada Phonetic Transliteration Engine
 * Converts English phonetic input into Kannada Unicode script.
 * e.g., 'ka' -> 'ಕ', 'kaa' -> 'ಕಾ', 'katha' -> 'ಕಥಾ', 'kannada' -> 'ಕನ್ನಡ'
 */

const VIRAMA = '\u0CCD';
const ANUSVARA = '\u0C82';
const VISARGA = '\u0C83';

// Consonant representations (including virama)
const CONSONANTS = [
  ['ksh', '\u0C95' + VIRAMA + '\u0CB7' + VIRAMA],
  ['chh', '\u0C9B' + VIRAMA],
  ['Chh', '\u0C9B' + VIRAMA],
  ['kh', '\u0C96' + VIRAMA],
  ['Kh', '\u0C96' + VIRAMA],
  ['gh', '\u0C98' + VIRAMA],
  ['Gh', '\u0C98' + VIRAMA],
  ['ng', '\u0C99' + VIRAMA],
  ['ch', '\u0C9A' + VIRAMA],
  ['Ch', '\u0C9B' + VIRAMA],
  ['jh', '\u0C9D' + VIRAMA],
  ['Jh', '\u0C9D' + VIRAMA],
  ['nj', '\u0C9E' + VIRAMA],
  ['jn', '\u0C9C' + VIRAMA + '\u0C9E' + VIRAMA],
  ['Th', '\u0CA0' + VIRAMA],
  ['Dh', '\u0CA2' + VIRAMA],
  ['th', '\u0CA5' + VIRAMA],
  ['dh', '\u0CA7' + VIRAMA],
  ['ph', '\u0CAB' + VIRAMA],
  ['Ph', '\u0CAB' + VIRAMA],
  ['bh', '\u0CAD' + VIRAMA],
  ['Bh', '\u0CAD' + VIRAMA],
  ['sh', '\u0CB6' + VIRAMA],
  ['Sh', '\u0CB7' + VIRAMA],
  ['k', '\u0C95' + VIRAMA],
  ['K', '\u0C96' + VIRAMA],
  ['g', '\u0C97' + VIRAMA],
  ['G', '\u0C98' + VIRAMA],
  ['c', '\u0C9A' + VIRAMA],
  ['j', '\u0C9C' + VIRAMA],
  ['J', '\u0C9D' + VIRAMA],
  ['T', '\u0C9F' + VIRAMA],
  ['D', '\u0CA1' + VIRAMA],
  ['N', '\u0CA3' + VIRAMA],
  ['t', '\u0CA4' + VIRAMA],
  ['d', '\u0CA6' + VIRAMA],
  ['n', '\u0CA8' + VIRAMA],
  ['p', '\u0CAA' + VIRAMA],
  ['P', '\u0CAB' + VIRAMA],
  ['f', '\u0CAB' + VIRAMA],
  ['F', '\u0CAB' + VIRAMA],
  ['b', '\u0CAC' + VIRAMA],
  ['B', '\u0CAD' + VIRAMA],
  ['m', '\u0CAE' + VIRAMA],
  ['y', '\u0CAF' + VIRAMA],
  ['r', '\u0CB0' + VIRAMA],
  ['l', '\u0CB2' + VIRAMA],
  ['v', '\u0CB5' + VIRAMA],
  ['w', '\u0CB5' + VIRAMA],
  ['s', '\u0CB8' + VIRAMA],
  ['S', '\u0CB7' + VIRAMA],
  ['h', '\u0CB9' + VIRAMA],
  ['L', '\u0CB3' + VIRAMA],
  ['x', '\u0C95' + VIRAMA + '\u0CB7' + VIRAMA]
];

// Vowel matras attached to consonants
const VOWEL_MATRAS = [
  ['aai', '\u0CBE\u0CAF\u0CBF'],
  ['aau', '\u0CBE\u0CB5\u0CC1'],
  ['aa', '\u0CBE'],
  ['A', '\u0CBE'],
  ['ai', '\u0CC8'],
  ['au', '\u0CCC'],
  ['ou', '\u0CCC'],
  ['ee', '\u0CC0'],
  ['ii', '\u0CC0'],
  ['oo', '\u0CC2'],
  ['uu', '\u0CC2'],
  ['ru', '\u0CC3'],
  ['Ru', '\u0CC3'],
  ['ea', '\u0CC7'],
  ['oa', '\u0CCB'],
  ['a', ''],
  ['i', '\u0CBF'],
  ['I', '\u0CC0'],
  ['u', '\u0CC1'],
  ['U', '\u0CC2'],
  ['e', '\u0CC6'],
  ['E', '\u0CC7'],
  ['o', '\u0CCA'],
  ['O', '\u0CCB']
];

// Independent standalone vowels
const INDEPENDENT_VOWELS = [
  ['aa', '\u0C86'],
  ['A', '\u0C86'],
  ['ai', '\u0C90'],
  ['au', '\u0C94'],
  ['ou', '\u0C94'],
  ['ee', '\u0C88'],
  ['ii', '\u0C88'],
  ['oo', '\u0C8A'],
  ['uu', '\u0C8A'],
  ['ru', '\u0C8B'],
  ['Ru', '\u0C8B'],
  ['ea', '\u0C8F'],
  ['oa', '\u0C93'],
  ['a', '\u0C85'],
  ['i', '\u0C87'],
  ['I', '\u0C88'],
  ['u', '\u0C89'],
  ['U', '\u0C8A'],
  ['e', '\u0C8E'],
  ['E', '\u0C8F'],
  ['o', '\u0C92'],
  ['O', '\u0C93']
];

/**
 * Transliterates a single English word token into Kannada
 */
export function transliterateWord(word) {
  if (!word) return '';

  let s = word;

  // Convert phonetic nasal m/n before plosives to anusvara M
  s = s.replace(/([aeiouAEIOU])m([pbPB])/g, '$1M$2');
  s = s.replace(/([aeiouAEIOU])n([dtDT])/g, '$1M$2');
  s = s.replace(/([aeiouAEIOU])ng([kKgG])/g, '$1M$2');

  let result = '';
  let i = 0;

  while (i < s.length) {
    // Anusvara
    if (s[i] === 'M') {
      result += ANUSVARA;
      i++;
      continue;
    }

    // Visarga
    if (s[i] === 'H' && (i === s.length - 1 || !/^[a-zA-Z]$/.test(s[i + 1]))) {
      result += VISARGA;
      i++;
      continue;
    }

    // Match consonant
    let cMatch = null;
    let cLen = 0;
    for (const [seq, glyph] of CONSONANTS) {
      if (s.startsWith(seq, i)) {
        cMatch = glyph;
        cLen = seq.length;
        break;
      }
    }

    if (cMatch) {
      i += cLen;

      // Lookahead for vowel matra
      let vMatch = null;
      let vLen = 0;
      for (const [seq, matra] of VOWEL_MATRAS) {
        if (s.startsWith(seq, i)) {
          vMatch = matra;
          vLen = seq.length;
          break;
        }
      }

      const baseConsonant = cMatch.slice(0, -1); // remove virama
      if (vMatch !== null) {
        result += baseConsonant + vMatch;
        i += vLen;
      } else {
        result += cMatch; // retains virama
      }
      continue;
    }

    // Match independent vowel
    let ivMatch = null;
    let ivLen = 0;
    for (const [seq, glyph] of INDEPENDENT_VOWELS) {
      if (s.startsWith(seq, i)) {
        ivMatch = glyph;
        ivLen = seq.length;
        break;
      }
    }

    if (ivMatch) {
      result += ivMatch;
      i += ivLen;
      continue;
    }

    // Pass through any other character
    result += s[i];
    i++;
  }

  return result;
}

/**
 * Transliterates full text preserving whitespace, punctuation, and existing Kannada characters
 */
export function transliterateKannada(text) {
  if (!text) return '';

  // Split by words, preserving separators
  return text
    .split(/(\s+|[^\w\u0C80-\u0CFF])/)
    .map((part) => {
      // If it contains English alphabets, transliterate
      if (/^[a-zA-Z]+$/.test(part)) {
        return transliterateWord(part);
      }
      return part;
    })
    .join('');
}
