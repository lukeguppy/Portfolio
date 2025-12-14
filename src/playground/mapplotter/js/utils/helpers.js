/**
 * Extracts a nested JSON object by balancing brackets.
 * Useful for parsing embedded JSON in HTML (like Rightmove's jsonModel).
 */
function extractJsonObject(str, startIndex) {
    let braceCount = 0;
    let endIndex = -1;

    for (let i = startIndex; i < str.length; i++) {
        if (str[i] === '{') braceCount++;
        else if (str[i] === '}') braceCount--;

        if (braceCount === 0) {
            endIndex = i + 1;
            break;
        }
    }

    if (endIndex !== -1) {
        return str.substring(startIndex, endIndex);
    }
    return null;
}

function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
