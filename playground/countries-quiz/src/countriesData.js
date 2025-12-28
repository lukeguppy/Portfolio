export const COUNTRY_ALIASES = {
    "United States of America": ["usa", "us", "america", "united states", "the us", "u s a"],
    "United Kingdom": ["uk", "britain", "great britain", "england", "scotland", "wales", "northern ireland", "u k"],
    "Russia": ["russian federation", "ussr", "soviet union"],
    "South Korea": ["korea", "rok", "republic of korea"],
    "North Korea": ["dprk", "democratic peoples republic of korea"],
    "China": ["prc", "mainland china"],
    "Taiwan": ["roc", "republic of china", "chinese taipei"],
    "United Arab Emirates": ["uae", "the uae"],
    "Czech Republic": ["czechia"],
    "Macedonia": ["north macedonia", "fyrom"],
    "Bosnia and Herzegovina": ["bosnia", "herzegovina"],
    "Trinidad and Tobago": ["trinidad", "tobago"],
    "Antigua and Barbuda": ["antigua", "barbuda"],
    "Saint Vincent and the Grenadines": ["st vincent", "saint vincent", "the grenadines"],
    "Saint Kitts and Nevis": ["st kitts", "saint kitts", "nevis"],
    "Papua New Guinea": ["png", "papua"],
    "Democratic Republic of the Congo": ["drc", "dr congo", "congo kinshasa", "democratic republic of congo"],
    "Republic of the Congo": ["congo", "congo brazzaville", "republic of congo"],
    "Central African Republic": ["car"],
    "South Africa": ["rsa"],
    "New Zealand": ["nz"],
    "Saudi Arabia": ["saudi", "ksa"],
    "Palestine": ["west bank", "gaza", "state of palestine"],
    "The Bahamas": ["bahamas"],
    "Ivory Coast": ["cote d ivoire", "cotedivoire"],
    "Myanmar": ["burma"],
    "Eswatini": ["swaziland"],
    "Swaziland": ["eswatini"],
    "East Timor": ["timor leste", "timor", "timor-leste"],
    "Vatican": ["holy see", "vatican city", "the vatican"],
    "Turkey": ["turkiye", "turkei"],
    "Netherlands": ["holland", "the netherlands"],
    "Cape Verde": ["cabo verde"],
    "Syria": ["syrian arab republic"],
    "Vietnam": ["viet nam"],
    "Laos": ["lao pdr", "lao"],
    "Micronesia": ["federated states of micronesia"],
    "Sao Tome and Principe": ["sao tome"],
    "Kyrgyzstan": ["kyrgyz republic", "kirghizia"],
    "Moldova": ["republic of moldova"],
    "Tanzania": ["united republic of tanzania"],
    "Gambia": ["the gambia"]
};

export const IGNORED_WORDS = ["the", "republic", "of", "democracy", "democratic", "state", "kingdom", "federation", "people's", "peoples"];

export function normalizeName(name) {
    // Remove accents/diacritics
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, ""); // keep spaces for now
}

// Levenshtein Distance for fuzzy matching
function levenshtein(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// FUZZY MATCHING SETTINGS
// -----------------------
// How many typos allowed based on word length?
// Length < SHORT_WORD_LIMIT: 0 typos
// Length < LONG_WORD_LIMIT: 1 typo
// Length >= LONG_WORD_LIMIT: 2 typos (or adjust as needed)

const SHORT_WORD_LIMIT = 5; // Words shorter than this must be exact
const LONG_WORD_LIMIT = 9;  // Words shorter than this get max 1 typo. Longer get 2.

// You can change these to Make it stricter:
// const ALLOW_2_TYPOS = true; // Set to false to never allow 2 typos

export function isCorrectAnswer(guess, actualName) {
    const normalizedGuess = normalizeName(guess);
    const normalizedActual = normalizeName(actualName);

    // 0. Exact or normalized match (Always works)
    if (normalizedGuess === normalizedActual) return true;

    // 1. Fuzzy match on Actual Name
    let threshold = 0;
    const len = normalizedActual.length;

    if (len < SHORT_WORD_LIMIT) {
        threshold = 0;
    } else if (len < LONG_WORD_LIMIT) {
        threshold = 1;
    } else {
        threshold = 2; // Change to 1 if you want it stricter
    }

    if (levenshtein(normalizedGuess, normalizedActual) <= threshold) return true;

    // 2. Alias Check
    if (COUNTRY_ALIASES[actualName]) {
        return COUNTRY_ALIASES[actualName].some(alias => {
            const normAlias = normalizeName(alias);
            // Strict alias check: only 1 typo allowed for long aliases, 0 for short
            const aliasThreshold = normAlias.length <= 4 ? 0 : 1;
            return levenshtein(normalizedGuess, normAlias) <= aliasThreshold;
        });
    }

    // 3. Simplified Name Check
    let simplifiedActual = normalizedActual;
    IGNORED_WORDS.forEach(word => {
        simplifiedActual = simplifiedActual.replace(new RegExp(`\\b${word}\\b`, 'g'), "").trim();
    });
    simplifiedActual = simplifiedActual.replace(/\s+/g, " ");

    if (normalizedGuess === simplifiedActual) return true;

    // Allow 1 typo on simplified name if it's long enough
    if (simplifiedActual.length >= 5 && levenshtein(normalizedGuess, simplifiedActual) <= 1) return true;

    return false;
}
