export interface NzFishingSpot {
  id: string;
  name: string;
  island: 'North Island' | 'South Island';
  region: string;
  lat: number;
  lng: number;
  /** Compass bearing (degrees) from which offshore wind blows (calmest inshore water) */
  offshoreDeg: number;
  /** Regional harmonic tide phase offset in hours relative to Lyttelton */
  tideOffsetHrs: number;
  targetSpecies: string[];
  accessNote: string;
}

type SpotTuple = [
  id: string,
  name: string,
  island: 'N' | 'S',
  region: string,
  lat: number,
  lng: number,
  offshoreDeg: number,
  tideOffsetHrs: number,
];

const REGION_SPECIES: Record<string, string[]> = {
  'Northland East': ['Snapper', 'Kingfish', 'Kahawai', 'Trevally', 'John Dory'],
  'Northland West': ['Snapper', 'Kahawai', 'Gurnard', 'Trevally', 'Rig'],
  'Auckland / Rodney': ['Snapper', 'Kahawai', 'Kingfish', 'Gurnard', 'Trevally'],
  'Auckland West': ['Snapper', 'Kahawai', 'Gurnard', 'Trevally', 'Rig'],
  Coromandel: ['Snapper', 'Kingfish', 'Kahawai', 'Tarakihi', 'Blue Maomao'],
  'Waikato / Raglan': ['Snapper', 'Kahawai', 'Gurnard', 'Trevally', 'Kingfish'],
  'Bay of Plenty': ['Snapper', 'Kingfish', 'Kahawai', 'Tarakihi', 'Trevally'],
  'Gisborne / East Cape': ['Snapper', 'Kingfish', 'Kahawai', 'Tarakihi', 'Blue Moki'],
  "Hawke's Bay": ['Kahawai', 'Gurnard', 'Snapper', 'Rig', 'Blue Moki'],
  'Taranaki / SH45': ['Snapper', 'Kahawai', 'Gurnard', 'Kingfish', 'Blue Cod'],
  'Manawatu / Whanganui': ['Kahawai', 'Snapper', 'Gurnard', 'Rig', 'Trevally'],
  'Wellington / Wairarapa': ['Blue Cod', 'Kahawai', 'Blue Moki', 'Tarakihi', 'Kingfish'],
  'Marlborough / Nelson': ['Snapper', 'Blue Cod', 'Kahawai', 'Gurnard', 'Kingfish'],
  Canterbury: ['Kahawai', 'Blue Cod', 'Red Cod', 'Rig', 'Elephant Fish', 'Blue Moki'],
  Otago: ['Blue Cod', 'Kahawai', 'Red Cod', 'Tarakihi', 'Groper', 'Rig'],
  'Southland / Catlins': ['Blue Cod', 'Kahawai', 'Blue Moki', 'Trumpeter', 'Rig'],
  'West Coast': ['Kahawai', 'Snapper', 'Gurnard', 'Rig', 'Blue Cod'],
};

const RAW_SPOTS: SpotTuple[] = [
  // NORTHLAND EAST (10)
  ['henderson-bay', 'Henderson Bay', 'N', 'Northland East', -34.7385, 173.1245, 250, 3.1],
  ['taupo-bay', 'Taupo Bay', 'N', 'Northland East', -34.9908, 173.7112, 210, 3.1],
  ['matauri-bay', 'Matauri Bay', 'N', 'Northland East', -35.0285, 173.9082, 230, 3.1],
  ['takou-bay', 'Takou Bay', 'N', 'Northland East', -35.1068, 173.9515, 235, 3.1],
  ['elliot-bay', 'Elliot Bay', 'N', 'Northland East', -35.2912, 174.2654, 225, 3.2],
  ['sandy-bay', 'Sandy Bay', 'N', 'Northland East', -35.5542, 174.5045, 240, 3.2],
  ['ocean-beach', 'Ocean Beach (Whangārei)', 'N', 'Northland East', -35.8295, 174.5665, 250, 3.2],
  ['ruakaka', 'Ruakākā Beach', 'N', 'Northland East', -35.9082, 174.4628, 255, 3.2],
  ['waipu-cove', 'Waipū Cove', 'N', 'Northland East', -36.0265, 174.5072, 230, 3.2],
  ['mangawhai', 'Mangawhai Heads', 'N', 'Northland East', -36.0815, 174.5975, 230, 3.2],

  // NORTHLAND WEST (4)
  ['the-bluff', 'The Bluff (90 Mile Beach)', 'N', 'Northland West', -34.6825, 172.8855, 65, 5.4],
  ['tauroa-shippies', 'Tauroa / Shipwreck Bay', 'N', 'Northland West', -35.1692, 173.1125, 110, 5.5],
  ['waimamaku', 'Waimamaku Beach', 'N', 'Northland West', -35.5685, 173.4015, 65, 5.5],
  ['baylys-beach', 'Baylys Beach', 'N', 'Northland West', -35.9522, 173.7438, 60, 5.6],

  // AUCKLAND / RODNEY (9)
  ['te-arai', 'Te Ārai Point', 'N', 'Auckland / Rodney', -36.1525, 174.6485, 240, 3.2],
  ['forestry', 'Forestry Beach', 'N', 'Auckland / Rodney', -36.1855, 174.6712, 240, 3.2],
  ['tawharanui', 'Tāwharanui', 'N', 'Auckland / Rodney', -36.3685, 174.8425, 200, 3.2],
  ['omaha', 'Omaha Beach', 'N', 'Auckland / Rodney', -36.3385, 174.7795, 250, 3.2],
  ['orewa', 'Ōrewa Beach', 'N', 'Auckland / Rodney', -36.5855, 174.7005, 255, 3.3],
  ['takapuna', 'Takapuna Beach', 'N', 'Auckland / Rodney', -36.7878, 174.7775, 250, 3.3],
  ['onetangi-waiheke', 'Onetangi (Waiheke)', 'N', 'Auckland / Rodney', -36.7895, 175.0755, 185, 3.3],
  ['okiwi-gbi', 'Okiwi (Great Barrier)', 'N', 'Auckland / Rodney', -36.1535, 175.4255, 240, 3.1],
  ['awana-gbi', 'Awana Bay (Great Barrier)', 'N', 'Auckland / Rodney', -36.2085, 175.4712, 245, 3.1],

  // AUCKLAND WEST (4)
  ['muriwai', 'Muriwai Beach', 'N', 'Auckland West', -36.8265, 174.4265, 75, 5.8],
  ['maukatia-bay', 'Maukātia (Maori Bay)', 'N', 'Auckland West', -36.8365, 174.4242, 75, 5.8],
  ['te-henga-bethells', 'Te Henga / Bethells', 'N', 'Auckland West', -36.8925, 174.4428, 75, 5.8],
  ['piha', 'Piha Beach', 'N', 'Auckland West', -36.9535, 174.4685, 80, 5.9],

  // COROMANDEL (7)
  ['whangapoua-newchums', 'Whangapoua / New Chums', 'N', 'Coromandel', -36.7115, 175.6115, 210, 3.2],
  ['matarangi', 'Matarangi Beach', 'N', 'Coromandel', -36.7312, 175.6615, 195, 3.2],
  ['otama', 'Ōtama Beach', 'N', 'Coromandel', -36.7045, 175.7445, 195, 3.2],
  ['hotwater-beach', 'Hot Water Beach', 'N', 'Coromandel', -36.8812, 175.8205, 250, 3.1],
  ['tairua', 'Tairua Ocean Beach', 'N', 'Coromandel', -37.0012, 175.8625, 250, 3.1],
  ['pauanui', 'Pauanui Beach', 'N', 'Coromandel', -37.0185, 175.8695, 245, 3.1],
  ['whangamata', 'Whangamatā Bar & Beach', 'N', 'Coromandel', -37.2075, 175.8812, 255, 3.1],

  // WAIKATO / RAGLAN (5)
  ['port-waikato', 'Port Waikato River Mouth', 'N', 'Waikato / Raglan', -37.3865, 174.7185, 80, 5.9],
  ['ngarunui-beach', 'Ngarunui Beach (Raglan)', 'N', 'Waikato / Raglan', -37.8185, 174.8125, 95, 5.9],
  ['raglan-waikeri-manu', 'Raglan (Manu Bay / Indicators)', 'N', 'Waikato / Raglan', -37.8215, 174.8035, 130, 5.9],
  ['raglan-tirohanga-indies', 'Raglan (Whale Bay / Indies)', 'N', 'Waikato / Raglan', -37.8265, 174.7915, 130, 5.9],
  ['ruapuke', 'Ruapuke Beach', 'N', 'Waikato / Raglan', -37.9015, 174.7765, 80, 5.9],

  // BAY OF PLENTY (8)
  ['waihi-beach', 'Waihī Beach', 'N', 'Bay of Plenty', -37.4055, 175.9415, 240, 3.1],
  ['mt-maunganui-nth', 'Mt Maunganui (Main Beach)', 'N', 'Bay of Plenty', -37.6325, 176.1855, 210, 3.1],
  ['mt-maunganui-tay', 'Mt Maunganui (Tay St)', 'N', 'Bay of Plenty', -37.6515, 176.2035, 215, 3.1],
  ['papamoa', 'Pāpāmoa Beach', 'N', 'Bay of Plenty', -37.7015, 176.2985, 210, 3.1],
  ['newdicks', 'Newdicks Beach (Maketū)', 'N', 'Bay of Plenty', -37.7565, 176.4735, 230, 3.1],
  ['matata', 'Matatā Beach', 'N', 'Bay of Plenty', -37.8865, 176.7625, 210, 3.0],
  ['ohope', 'Ōhope Beach', 'N', 'Bay of Plenty', -37.9685, 177.0485, 200, 3.0],
  ['motu', 'Motu River Mouth', 'N', 'Bay of Plenty', -37.8515, 177.5885, 155, 3.0],

  // GISBORNE / EAST CAPE (6)
  ['te-araroa', 'Te Araroa', 'N', 'Gisborne / East Cape', -37.6345, 178.3685, 200, 2.7],
  ['uawa-tolaga-bay', 'Ūawa / Tolaga Bay Wharf', 'N', 'Gisborne / East Cape', -38.3745, 178.3135, 265, 2.5],
  ['waihau-bay-loisells', 'Waihau Beach / Loisels', 'N', 'Gisborne / East Cape', -38.4985, 178.2685, 275, 2.5],
  ['wainui-beach', 'Wainui Beach', 'N', 'Gisborne / East Cape', -38.6865, 178.0815, 290, 2.3],
  ['gizzy-pipe', 'Gisborne Pipe / Midway', 'N', 'Gisborne / East Cape', -38.6725, 178.0155, 330, 2.3],
  ['mid-shore', 'Midway / Waikanae Beach', 'N', 'Gisborne / East Cape', -38.6745, 178.0265, 335, 2.3],

  // HAWKE'S BAY (8)
  ['mahia-north-coast', 'Māhia Peninsula (North)', 'N', "Hawke's Bay", -39.0785, 177.9015, 200, 2.1],
  ['mahia-open-coast', 'Māhia Open Coast', 'N', "Hawke's Bay", -39.1525, 177.9655, 285, 2.1],
  ['wairoa', 'Wairoa River Mouth', 'N', "Hawke's Bay", -39.0625, 177.4195, 340, 2.1],
  ['awatoto', 'Awatoto Beach', 'N', "Hawke's Bay", -39.5465, 176.9215, 270, 2.0],
  ['te-awanga', 'Te Awanga', 'N', "Hawke's Bay", -39.6315, 176.9895, 240, 2.0],
  ['ocean-beach-hb', "Ocean Beach (Hawke's Bay)", 'N', "Hawke's Bay", -39.7425, 177.0125, 285, 2.0],
  ['waimarama', 'Waimārama Beach', 'N', "Hawke's Bay", -39.8185, 176.9925, 285, 2.0],
  ['herbertville', 'Herbertville / Cape Turnagain', 'N', "Hawke's Bay", -40.4915, 176.6215, 290, 1.8],

  // TARANAKI / SH45 (9)
  ['mokau', 'Mōkau River Mouth', 'N', 'Taranaki / SH45', -38.7045, 174.6165, 90, 5.7],
  ['fitzroy', 'Fitzroy Beach (New Plymouth)', 'N', 'Taranaki / SH45', -39.0485, 174.0985, 145, 5.6],
  ['back-beach', 'Back Beach (New Plymouth)', 'N', 'Taranaki / SH45', -39.0695, 174.0225, 130, 5.6],
  ['oakura', 'Ōākura Beach', 'N', 'Taranaki / SH45', -39.1125, 173.9465, 140, 5.6],
  ['okato', 'Ōkato / Stony River', 'N', 'Taranaki / SH45', -39.1885, 173.8415, 115, 5.6],
  ['stent-rd', 'Stent Road (Cape Egmont)', 'N', 'Taranaki / SH45', -39.2615, 173.7635, 100, 5.6],
  ['arawhata-rd', 'Arawhata Road', 'N', 'Taranaki / SH45', -39.4065, 173.7965, 60, 5.6],
  ['opunake', 'Ōpunake Bay', 'N', 'Taranaki / SH45', -39.4575, 173.8545, 35, 5.6],
  ['patea', 'Pātea River Mouth', 'N', 'Taranaki / SH45', -39.7765, 174.4715, 25, 5.5],

  // MANAWATU / WHANGANUI (3)
  ['waiinu-beach', 'Waiinu Beach', 'N', 'Manawatu / Whanganui', -39.8455, 174.6825, 20, 5.5],
  ['whanganui', 'Whanganui (Castlecliff)', 'N', 'Manawatu / Whanganui', -39.9465, 174.9855, 45, 5.5],
  ['himatangi', 'Himatangi Beach', 'N', 'Manawatu / Whanganui', -40.3715, 175.2325, 95, 5.4],

  // WELLINGTON / WAIRARAPA (11)
  ['akitio', 'Akitio Beach', 'N', 'Wellington / Wairarapa', -40.6145, 176.4185, 295, 1.7],
  ['rangiwhakaoma-castlepoint', 'Castlepoint (Rangiwhakaoma)', 'N', 'Wellington / Wairarapa', -40.9035, 176.2245, 295, 1.5],
  ['riversdale', 'Riversdale Beach', 'N', 'Wellington / Wairarapa', -41.0915, 176.0715, 295, 1.4],
  ['tora', 'Tora Coast', 'N', 'Wellington / Wairarapa', -41.5085, 175.5245, 305, 1.1],
  ['ngawi', 'Ngāwi (Cape Palliser)', 'N', 'Wellington / Wairarapa', -41.5945, 175.2385, 85, 1.1],
  ['onoke-lake-ferry', 'Lake Ferry / Ōnoke Spit', 'N', 'Wellington / Wairarapa', -41.4025, 175.1345, 350, 1.1],
  ['lyall-bay', 'Lyall Bay (Wellington)', 'N', 'Wellington / Wairarapa', -41.3295, 174.7965, 355, 1.0],
  ['titahi-bay', 'Tītahi Bay', 'N', 'Wellington / Wairarapa', -41.1045, 174.8325, 105, 5.2],
  ['paekakariki', 'Paekākāriki Beach', 'N', 'Wellington / Wairarapa', -40.9865, 174.9505, 105, 5.2],
  ['chur-otaki', 'Ōtaki Beach', 'N', 'Wellington / Wairarapa', -40.7425, 175.1185, 105, 5.3],
  ['cray-bay', 'Cray Bay (South Coast)', 'N', 'Wellington / Wairarapa', -41.3515, 174.7425, 355, 1.0],

  // MARLBOROUGH / NELSON (7)
  ['ruby-bay', 'Ruby Bay (Tasman)', 'S', 'Marlborough / Nelson', -41.2365, 173.0815, 225, 5.3],
  ['whangamoa', 'Whangamoa / Cable Bay', 'S', 'Marlborough / Nelson', -41.1585, 173.4165, 165, 5.3],
  ['robin-hood-bay', 'Robin Hood Bay', 'S', 'Marlborough / Nelson', -41.3625, 174.0725, 300, 1.0],
  ['the-cut-blenheim', 'Wairau Bar (The Cut)', 'S', 'Marlborough / Nelson', -41.5045, 174.0645, 250, 1.0],
  ['kekerengu', 'Kekerengu Coast', 'S', 'Marlborough / Nelson', -42.0025, 174.0115, 300, 0.7],
  ['mangamaunu', 'Mangamaunu (Kaikōura)', 'S', 'Marlborough / Nelson', -42.2745, 173.7635, 300, 0.5],
  ['meatworks', 'Meatworks (Kaikōura)', 'S', 'Marlborough / Nelson', -42.3455, 173.7025, 305, 0.5],

  // CANTERBURY (39 — North Canterbury, Christchurch, Lyttelton, Banks Peninsula, Mid/South Canterbury)
  ['gore-bay', 'Gore Bay', 'S', 'Canterbury', -42.8635, 173.3105, 300, 0.3],
  ['motunau-beach', 'Motunau Beach & Island', 'S', 'Canterbury', -43.0465, 173.0765, 315, 0.2],
  ['amberley-beach', 'Amberley Beach', 'S', 'Canterbury', -43.1685, 172.7965, 285, 0.15],
  ['leithfield-beach', 'Leithfield Beach', 'S', 'Canterbury', -43.2045, 172.7715, 280, 0.1],
  ['waikuku-beach', 'Waikuku Beach', 'S', 'Canterbury', -43.2855, 172.7195, 280, 0.1],
  ['pegasus-beach', 'Pegasus Beach', 'S', 'Canterbury', -43.3145, 172.7145, 280, 0.1],
  ['woodend-beach', 'Woodend Beach', 'S', 'Canterbury', -43.3385, 172.7125, 280, 0.1],
  ['waimakariri-mouth', 'Waimakariri River Mouth (Kairaki)', 'S', 'Canterbury', -43.3905, 172.7135, 275, 0.05],
  ['spencer-park', 'Spencer Park Beach', 'S', 'Canterbury', -43.4285, 172.7165, 275, 0.05],
  ['waimairi-beach', 'Waimairi Beach', 'S', 'Canterbury', -43.4825, 172.7285, 270, 0.0],
  ['new-brighton', 'New Brighton Pier', 'S', 'Canterbury', -43.5063, 172.7347, 270, 0.0],
  ['south-shore-spit', 'South Shore Spit (Estuary)', 'S', 'Canterbury', -43.5412, 172.731, 270, 0.0],
  ['shag-rock', 'Shag Rock / Rapanui (Sumner Bar)', 'S', 'Canterbury', -43.5658, 172.7542, 235, 0.0],
  ['sumner-scarborough', 'Sumner & Scarborough Beach', 'S', 'Canterbury', -43.5705, 172.7625, 225, 0.0],
  ['taylors-mistake', "Taylor's Mistake & Boulder Bay", 'S', 'Canterbury', -43.5835, 172.7775, 235, 0.0],
  ['godley-head', 'Godley Head Ledges', 'S', 'Canterbury', -43.5936, 172.8021, 250, 0.0],
  ['schnappers-cut', 'Lyttelton / Naval Point Marina', 'S', 'Canterbury', -43.6068, 172.7125, 240, 0.0],
  ['corsair-bay', 'Corsair Bay Jetty & Ramp', 'S', 'Canterbury', -43.606, 172.715, 260, 0.0],
  ['rapaki-bay', 'Rāpaki Bay (Mātaitai)', 'S', 'Canterbury', -43.61, 172.68, 300, 0.0],
  ['governors-bay', 'Governors Bay Jetty', 'S', 'Canterbury', -43.6275, 172.6515, 280, 0.0],
  ['charteris-bay', 'Charteris Bay / Orton Bradley', 'S', 'Canterbury', -43.6535, 172.7015, 210, 0.0],
  ['diamond-harbour', 'Diamond Harbour Wharf', 'S', 'Canterbury', -43.623, 172.721, 200, 0.0],
  ['purau-bay', 'Purau Bay', 'S', 'Canterbury', -43.6315, 172.7525, 200, 0.0],
  ['port-levy', 'Port Levy / Koukourarata', 'S', 'Canterbury', -43.6435, 172.8285, 195, -0.05],
  ['pigeon-bay', 'Pigeon Bay Wharf & Ramp', 'S', 'Canterbury', -43.6815, 172.8985, 195, -0.05],
  ['okains-bay', 'Okains Bay', 'S', 'Canterbury', -43.6945, 173.0635, 240, -0.1],
  ['le-bons-bay', 'Le Bons Bay', 'S', 'Canterbury', -43.7395, 173.0915, 255, -0.1],
  ['hickory-bay', 'Hickory Bay (Banks Peninsula)', 'S', 'Canterbury', -43.7765, 173.1125, 290, -0.1],
  ['akaroa-wharf', 'Akaroa Wharf & Harbour', 'S', 'Canterbury', -43.804, 172.965, 220, -0.15],
  ['wainui-akaroa', 'Wainui Wharf (Akaroa)', 'S', 'Canterbury', -43.8165, 172.9025, 270, -0.15],
  ['magnet-bay', 'Magnet Bay (Banks Peninsula)', 'S', 'Canterbury', -43.8465, 172.7425, 15, -0.1],
  ['birdlings-flat', 'Birdlings Flat / Kaitōrete Spit', 'S', 'Canterbury', -43.8255, 172.7015, 355, -0.15],
  ['lake-ellesmere', 'Lake Ellesmere / Te Waihora', 'S', 'Canterbury', -43.798, 172.368, 320, -0.2],
  ['rakaia-mouth', 'Rakaia River Mouth', 'S', 'Canterbury', -43.8965, 172.2035, 320, -0.35],
  ['ashburton-mouth', 'Ashburton / Hakatere Mouth', 'S', 'Canterbury', -44.0485, 171.8125, 315, -0.45],
  ['rangitata-mouth', 'Rangitata River Mouth', 'S', 'Canterbury', -44.1885, 171.5085, 310, -0.55],
  ['patiti-pt-timaru', 'Patiti Point & Timaru Harbour', 'S', 'Canterbury', -44.4145, 171.2685, 280, -0.6],
  ['waitaki-mouth', 'Waitaki River Mouth', 'S', 'Canterbury', -44.9415, 171.1385, 290, -0.8],
  ['oamaru', 'Oamaru Harbour & Cape Wanbrow', 'S', 'Canterbury', -45.1065, 170.9785, 280, -0.9],

  // OTAGO (7)
  ['karitane-beach', 'Karitāne Bar & Beach', 'S', 'Otago', -45.6395, 170.6625, 275, -1.1],
  ['whareakeake-murdering-bay', 'Whareakeake (Murdering Bay)', 'S', 'Otago', -45.7635, 170.6715, 200, -1.1],
  ['aramoana', 'Aramoana Mole (Otago Heads)', 'S', 'Otago', -45.7745, 170.7155, 220, -1.1],
  ['victory-beach', 'Victory Beach (Otago Peninsula)', 'S', 'Otago', -45.8265, 170.7325, 295, -1.1],
  ['allans-beach', 'Allans Beach', 'S', 'Otago', -45.8755, 170.6955, 315, -1.1],
  ['st-clair', 'St Clair Beach (Dunedin)', 'S', 'Otago', -45.9125, 170.4895, 345, -1.2],
  ['taieri-mouth', 'Taieri River Mouth', 'S', 'Otago', -46.0555, 170.1945, 315, -1.3],

  // SOUTHLAND / CATLINS (7)
  ['kaka-pt', 'Kaka Point (Catlins)', 'S', 'Southland / Catlins', -46.3865, 169.7825, 265, -1.5],
  ['papatowai', 'Papatowai / Tahakopa Bay', 'S', 'Southland / Catlins', -46.5615, 169.4765, 320, -1.7],
  ['porridge', 'Porpoise / Porridge Reef', 'S', 'Southland / Catlins', -46.6545, 169.1045, 300, -1.8],
  ['curio-bay', 'Curio Bay', 'S', 'Southland / Catlins', -46.6625, 169.1015, 325, -1.8],
  ['riverton', 'Riverton Rocks', 'S', 'Southland / Catlins', -46.3615, 168.0215, 350, -2.2],
  ['oraka-colac-bay', 'Ōraka / Colac Bay', 'S', 'Southland / Catlins', -46.3655, 167.8935, 330, -2.3],
  ['blue-cliffs', 'Bluecliffs Beach (Te Waewae)', 'S', 'Southland / Catlins', -46.1855, 167.5525, 15, -2.4],

  // WEST COAST (8)
  ['karamea', 'Karamea River Mouth', 'S', 'West Coast', -41.2525, 172.1015, 95, 5.8],
  ['westport', 'Westport / Buller Bar', 'S', 'West Coast', -41.7345, 171.5865, 125, 5.8],
  ['tauranga-bay', 'Tauranga Bay (Cape Foulwind)', 'S', 'West Coast', -41.7715, 171.4545, 105, 5.8],
  ['punakaiki', 'Punakaiki / Pororari Mouth', 'S', 'West Coast', -42.1085, 171.3355, 105, 5.9],
  ['blaketown-cobden', 'Greymouth (Blaketown / Cobden)', 'S', 'West Coast', -42.4445, 171.1925, 105, 5.9],
  ['okarito', 'Ōkārito Lagoon & Bar', 'S', 'West Coast', -43.2245, 170.1615, 125, 6.0],
  ['okahu-jackson-bay', 'Jackson Bay / Okahu', 'S', 'West Coast', -43.9725, 168.6145, 145, 6.1],
  ['te-hokiauau-big-bay', 'Te Hokiauau / Big Bay', 'S', 'West Coast', -44.2885, 168.1145, 115, 6.1],
];

const SPOT_RULES: Record<string, string> = {
  'new-brighton': 'Pier fishing closed Sun 10am–5pm (CCC Bylaw)',
  'waimakariri-mouth': 'Fish & Game licence + Sea-Run Salmon Endorsement required for trout/salmon',
  'rakaia-mouth': 'Fish & Game licence req. for salmon/trout · 4WD caution on loose shingle',
  'rangitata-mouth': 'Prime Chinook Salmon & Kahawai water · Fish & Game licence required',
  'waitaki-mouth': 'Fish & Game licence required for salmon/trout · Strong shingle surf',
  'schnappers-cut': 'Whakaraupō Mātaitai Reserve rules apply · Multi-lane concrete ramp',
  'corsair-bay': 'Whakaraupō Mātaitai rules apply · Sheltered concrete ramp & jetty',
  'rapaki-bay': 'Rāpaki Mātaitai Reserve — strict customary & bag limits enforced',
  'governors-bay': 'Whakaraupō Mātaitai rules apply · Shallow mud/sand harbour flat',
  'akaroa-wharf': 'Watch Akaroa & Pohatu No-Take Marine Reserves · Rue Jolie ramp',
  'birdlings-flat': 'Caution: steep shingle beach & heavy dumping shorebreak',
  'lake-ellesmere': 'Check ECan water quality alerts · Shallow windy lake (flounder, eel, perch)',
};

const SPOT_SPECIES_OVERRIDE: Record<string, string[]> = {
  'waimakariri-mouth': ['Chinook Salmon', 'Sea-run Brown Trout', 'Kahawai', 'Yellow-eyed Mullet'],
  'rakaia-mouth': ['Chinook Salmon', 'Sea-run Brown Trout', 'Kahawai', 'Rig'],
  'rangitata-mouth': ['Chinook Salmon', 'Sea-run Brown Trout', 'Kahawai', 'Rig'],
  'ashburton-mouth': ['Chinook Salmon', 'Brown Trout', 'Kahawai', 'Red Cod'],
  'waitaki-mouth': ['Chinook Salmon', 'Sea-run Brown Trout', 'Kahawai', 'Red Cod'],
  'lake-ellesmere': ['Yellow-belly Flounder', 'Shortfin Eel (Tuna)', 'Perch', 'Brown Trout'],
  'akaroa-wharf': ['Blue Cod', 'Tarakihi', 'Blue Moki', 'Yellowtail Kingfish', 'Sea Perch'],
  'godley-head': ['Yellowtail Kingfish', 'Blue Cod', 'Blue Moki', 'Tarakihi', 'Kahawai'],
};

export const NZ_SPOTS_125: NzFishingSpot[] = RAW_SPOTS.map(
  ([id, name, islandCode, region, lat, lng, offshoreDeg, tideOffsetHrs]) => ({
    id,
    name,
    island: islandCode === 'N' ? 'North Island' : 'South Island',
    region,
    lat,
    lng,
    offshoreDeg,
    tideOffsetHrs,
    targetSpecies:
      SPOT_SPECIES_OVERRIDE[id] ?? REGION_SPECIES[region] ?? ['Kahawai', 'Snapper', 'Blue Cod', 'Gurnard'],
    accessNote: SPOT_RULES[id] ?? `${region} coastal access · Check local MPI rules & bar safety`,
  })
);

export const DEFAULT_SPOT =
  NZ_SPOTS_125.find((s) => s.id === 'new-brighton') ?? NZ_SPOTS_125[0];
