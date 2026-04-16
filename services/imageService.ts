
/**
 * Utility to resolve keyword-based images or category fallbacks using Unsplash IDs.
 */

export const CATEGORY_FALLBACKS: Record<string, string[]> = {
    hotel: [
        'photo-1566073771259-6a8506099945',
        'photo-1582719478250-c89cae4dc85b',
        'photo-1542314831-068cd1dbfeeb',
        'photo-1566665797739-1674de7a421a',
        'photo-1571896349842-33c89424de2d'
    ],
    flight: [
        'photo-1436491865332-7a61a109c0f3', // Plane wing
        'photo-1542296332-2e4473faf563', // Airport
        'photo-1506012733855-00a5639b7517', // Cabin
        'photo-1520437358207-3577171f3951'  // Sunset flight
    ],
    activity: [
        'photo-1533105079780-92b9be482077', // Adventure
        'photo-1524661135-423995f22d0b', // City map
        'photo-1533903345306-15d1c30952de', // Amalfi
        'photo-1514890547357-a9ee2887ad8e', // Venice
        'photo-1541542684-d2cf7d85da19', // Florence
    ],
    dining: [
        'photo-1517248135467-4c7edcad34c4', // Dinner
        'photo-1414235077428-338989a2e8c0', // Fine dining
        'photo-1504674900247-0877df9cc836', // Meat
        'photo-1513104890138-7c749659a591', // Pizza
        'photo-1552566626-52f8b828add9'  // Italian
    ],
    transfer: [
        'photo-1449965408869-eaa3f722e40d', // Driving
        'photo-1615764812975-751f90d0b867', // Chauffeur
        'photo-1560958089-b8a1929cea89', // Tesla
        'photo-1549194382-346a85f06123'  // Black car
    ]
};

export const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

export const getKeywordImage = (keyword: string): string | null => {
    const k = keyword.toLowerCase();
    
    // Cities
    if (k.includes('paris') || k.includes('eiffel')) return 'photo-1502602898657-3e91760cbb34';
    if (k.includes('london') || k.includes('shard')) return 'photo-1513635269975-59663e0ac1ad';
    if (k.includes('rome') || k.includes('colosseum')) return 'photo-1552832230-c0197dd311b5';
    if (k.includes('dubai') || k.includes('burj')) return 'photo-1512453979798-5eaad0df3bd1';
    if (k.includes('tokyo') || k.includes('shibuya')) return 'photo-1540959733332-eab4deabeeaf';
    if (k.includes('abu-dhabi') || k.includes('uae')) return 'photo-1544161442-e3db36c4f67c';
    if (k.includes('frankfurt')) return 'photo-1565039235081-30ef1cae4f9b';
    
    // Food
    if (k.includes('pizza') || k.includes('pasta')) return 'photo-1513104890138-7c749659a591';
    if (k.includes('sushi') || k.includes('ramen')) return 'photo-1579871494447-9811cf80d66c';
    if (k.includes('fine-dining') || k.includes('michelin') || k.includes('dinner')) return 'photo-1414235077428-338989a2e8c0';
    if (k.includes('wine') || k.includes('vineyard')) return 'photo-1506377247377-2a5b3b417ebb';
    if (k.includes('breakfast') || k.includes('coffee')) return 'photo-1495474472287-4d71bcdd2085';
    
    // Transportation
    if (k.includes('chauffeur') || k.includes('limo') || k.includes('black-sedan') || k.includes('suv')) return 'photo-1615764812975-751f90d0b867';
    if (k.includes('tesla') || k.includes('electric')) return 'photo-1560958089-b8a1929cea89';
    if (k.includes('transfer') || k.includes('airport-car')) return 'photo-1449965408869-eaa3f722e40d';
    
    // Culture & Sightseeing
    if (k.includes('museum') || k.includes('louvre') || k.includes('art')) return 'photo-1567942585146-33d62b775db0';
    if (k.includes('cycling') || k.includes('bike')) return 'photo-1471506480208-8e93acc4c9bf';
    if (k.includes('gladiator') || k.includes('history')) return 'photo-1552832230-c0197dd311b5';
    if (k.includes('shopping') || k.includes('mall') || k.includes('boutique')) return 'photo-1483985988355-763728e1935b';
    
    // Nature & Outdoors
    if (k.includes('beach') || k.includes('ocean') || k.includes('sun') || k.includes('coast')) return 'photo-1507525428034-b723cf961d3e';
    if (k.includes('mountain') || k.includes('hiking') || k.includes('nature') || k.includes('trekking') || k.includes('forest')) return 'photo-1464822759023-fed622ff2c3b';
    if (k.includes('waterfall') || k.includes('river') || k.includes('lake')) return 'photo-1433086966358-54859d0ed716';
    if (k.includes('tropical') || k.includes('island') || k.includes('palm')) return 'photo-1506929199175-6091f3f21b8a';

    // Water Sports & Adventure
    if (k.includes('snorkel') || k.includes('scuba') || k.includes('diving') || k.includes('underwater') || k.includes('coral')) return 'photo-1544551763-47a01526aef1';
    if (k.includes('boat') || k.includes('sailing') || k.includes('yacht') || k.includes('cruise')) return 'photo-1534008757030-2679f4c86b3a';
    if (k.includes('surf') || k.includes('waves')) return 'photo-1502680390469-be75c89b70c7';
    if (k.includes('helicopter') || k.includes('aerial') || k.includes('flight-tour')) return 'photo-1464039397811-476f652a343b';
    if (k.includes('safari') || k.includes('wildlife') || k.includes('savanna')) return 'photo-1516422313130-3d9738d51912';

    // Essentials & Services
    if (k.includes('insurance') || k.includes('shield') || k.includes('medical')) return 'photo-1454165833022-88b934fe7f20';
    if (k.includes('sim') || k.includes('internet') || k.includes('data') || k.includes('wifi')) return 'photo-1562157873-818bc0726f68';
    if (k.includes('lounge') || k.includes('vip') || k.includes('airport-luxury')) return 'photo-1558281063-1daaa55a5b1c';

    return null;
};
