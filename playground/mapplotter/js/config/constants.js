const COMMON_CATEGORIES = {
    'restaurant': { key: 'amenity', value: 'restaurant', label: 'Restaurants', examples: 'restaurant, cafe, pub' },
    'cafe': { key: 'amenity', value: 'cafe', label: 'Cafes', examples: 'coffee shop, cafe' },
    'pub': { key: 'amenity', value: 'pub', label: 'Pubs', examples: 'pub, bar' },
    'bank': { key: 'amenity', value: 'bank', label: 'Banks', examples: 'bank, ATM' },
    'pharmacy': { key: 'amenity', value: 'pharmacy', label: 'Pharmacies', examples: 'pharmacy, chemist' },
    'school': { key: 'amenity', value: 'school', label: 'Schools', examples: 'school, college' },
    'hospital': { key: 'amenity', value: 'hospital', label: 'Hospitals', examples: 'hospital, medical centre' },
    'library': { key: 'amenity', value: 'library', label: 'Libraries', examples: 'library, public library' },
    'supermarket': { key: 'shop', value: 'supermarket', label: 'Supermarkets', examples: 'supermarket, grocery store' },
    'convenience': { key: 'shop', value: 'convenience', label: 'Convenience Stores', examples: 'convenience store, corner shop' },
    'bakery': { key: 'shop', value: 'bakery', label: 'Bakeries', examples: 'bakery, bread shop' },
    'clothes': { key: 'shop', value: 'clothes', label: 'Clothing Stores', examples: 'clothing store, fashion' },
    'electronics': { key: 'shop', value: 'electronics', label: 'Electronics', examples: 'electronics store' },
    'hairdresser': { key: 'shop', value: 'hairdresser', label: 'Hairdressers', examples: 'hair salon, barber' },
    'fitness_centre': { key: 'leisure', value: 'fitness_centre', label: 'Fitness Centres', examples: 'gym, fitness centre' },
    'park': { key: 'leisure', value: 'park', label: 'Parks', examples: 'park, recreation' },
    'swimming_pool': { key: 'leisure', value: 'swimming_pool', label: 'Swimming Pools', examples: 'swimming pool, leisure centre' },
    'hotel': { key: 'tourism', value: 'hotel', label: 'Hotels', examples: 'hotel, accommodation' },
    'museum': { key: 'tourism', value: 'museum', label: 'Museums', examples: 'museum, gallery' },
    'parking': { key: 'amenity', value: 'parking', label: 'Parking', examples: 'car park, parking' }
};

const DEFAULT_PIN_COLOUR = '#4ECDC4';

const CATEGORY_COLOURS = [
    '#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCF7F', '#A78BFA', '#F472B6', '#60A5FA', '#34D399',
    '#FF9F43', '#576574' /* Added Orange & Grey */
];
