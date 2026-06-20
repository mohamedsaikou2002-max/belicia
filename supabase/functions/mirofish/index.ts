// MiroFish Reactive Cold System — Deno port of mirofish_reactor.py
// All actions routed by ?action=...
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
const MODEL = "claude-sonnet-4-5-20250929";
const GEMINI_MODELS = [
  Deno.env.get("GEMINI_MODEL"),
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-pro",
].filter((m, i, a): m is string => !!m && a.indexOf(m) === i) as string[];

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const THEATRE_CONTEXT: Record<string, string> = {
  italia: "Italian Mediterranean culture: family ties, regional pride, quality-over-price, Catholic social norms, oral trust networks, fierce skepticism of foreign brands, food as identity, slow trust but fierce loyalty once earned.",
  gulf: "Gulf States MENA culture: Islamic ethics and halal-first, hierarchy and wasta (connections), majlis culture, hospitality as strategy, long-term relationship building, formality in initial contact, face-saving absolutely critical.",
  westaf: "West African culture: communal solidarity and ubuntu, elder respect as gatekeeping, oral tradition and storytelling, faith-based network infrastructure (evangelical + Islamic), entrepreneurial hustle, deep distrust of formal institutions.",
  sea: "Southeast Asian maritime culture: face-saving and avoiding public conflict, group harmony over individual expression, indirect communication, price-sensitivity, integration of adat (custom) with Islam, hierarchy in commerce.",
  latam: "Latin American Southern Cone culture: personalism (relationships over systems), evangelical church growth networks, strong urban/rural split, football culture as social glue, economic inequality shaping trust, machismo dynamics.",
  custom: "Custom cultural context as defined in the narrative seed materials.",
};

const SIM_TYPE_CONTEXT: Record<string, string> = {
  campaign: "marketing campaign reception and organic spread through social networks",
  redteam: "adversarial attack vector and organizational resilience testing",
  narrative: "narrative warfare — how a story spreads, mutates, and inoculates a population",
  humint: "trust dynamics in human intelligence cultivation and source development",
  asabiyya: "community cohesion building (Ibn Khaldun asabiyya — social solidarity)",
  financial: "financial disruption and rent-stream collapse dynamics",
};

const DEFAULT_ARCHETYPES: Record<string, string[]> = {
  italia: ["Community Elder", "Restaurateur", "Food Influencer", "Parish Priest", "Skeptic", "Competitor"],
  gulf: ["Islamic Scholar", "Business Patron", "Young Professional", "Community Gatekeeper", "Skeptic", "Wasta Broker"],
  westaf: ["Village Elder", "Market Trader", "Pastor/Imam", "Youth Leader", "NGO Worker", "Skeptic"],
  sea: ["Clan Elder", "Small Business Owner", "Social Media Influencer", "Religious Leader", "Price-Conscious Buyer", "Skeptic"],
  latam: ["Evangelical Pastor", "Football Club President", "Community Organizer", "Political Patron", "Skeptic", "Journalist"],
  custom: ["Community Elder", "Gatekeeper", "Amplifier", "Skeptic", "Early Adopter", "Blocker"],
};

const AGENT_COLORS = ["#5a3a8a", "#c8a96e", "#2d6a4f", "#e85d24", "#3a7ca5", "#8a3a7a", "#b8423a", "#3a8a6e", "#6e3a8a", "#8a6e3a", "#3a6e8a", "#a83a5a"];

const NAME_POOLS: Record<string, { first: string[]; last: string[] }> = {
  italia: {
    first: ["Marco","Giulia","Luca","Sofia","Matteo","Chiara","Alessandro","Francesca","Davide","Martina","Lorenzo","Valentina","Simone","Elena","Riccardo","Beatrice","Andrea","Camilla","Giovanni","Aurora","Federico","Greta","Tommaso","Anna"],
    last: ["Rossi","Bianchi","Esposito","Romano","Ferrari","Russo","Greco","Conti","Marino","Ricci","De Luca","Mancini","Costa","Galli","Bruno","Lombardi","Moretti","Barbieri","Fontana","Vitale"],
  },
  gulf: {
    first: ["Ahmed","Fatima","Khalid","Aisha","Omar","Maryam","Yousef","Noura","Saeed","Latifa","Hamad","Hessa","Mohammed","Shaikha","Rashid","Mariam","Sultan","Reem","Faisal","Amna"],
    last: ["Al-Maktoum","Al-Sabah","Al-Thani","Al-Saud","Al-Nahyan","Al-Qasimi","Al-Mansouri","Al-Hashimi","Al-Shamsi","Al-Falasi","Al-Mazrouei","Al-Suwaidi","Al-Ghurair","Al-Habtoor","Al-Rashed","Al-Otaibi"],
  },
  westaf: {
    first: ["Kwame","Aisha","Chinedu","Aminata","Kofi","Adaeze","Babatunde","Fatou","Olumide","Ngozi","Sekou","Mariama","Ibrahim","Khadija","Yaw","Esi","Tunde","Folake","Mamadou","Awa"],
    last: ["Okafor","Diallo","Mensah","Adeyemi","Touré","Eze","Bah","Owusu","Camara","Adebayo","Sankara","Nkrumah","Conteh","Obi","Sylla","Asante","Fofana","Abubakar"],
  },
  sea: {
    first: ["Budi","Siti","Aditya","Nur","Wayan","Dewi","Andi","Putri","Bambang","Ratna","Made","Sri","Joko","Indah","Agus","Lestari","Hendra","Maya","Surya","Citra"],
    last: ["Wijaya","Santoso","Tan","Pratama","Lim","Susanto","Halim","Hartono","Kusuma","Setiawan","Nguyen","Tran","Lee","Wong","Suharto","Iskandar","Rahman","Saputra"],
  },
  latam: {
    first: ["Diego","Sofía","Mateo","Valentina","Santiago","Camila","Sebastián","Isabella","Joaquín","Martina","Tomás","Lucía","Benjamín","Renata","Emilio","Catalina","Andrés","Paula","Gabriel","Florencia"],
    last: ["González","Rodríguez","Pérez","Fernández","López","Martínez","Silva","Sánchez","Romero","Torres","Vargas","Castro","Ramírez","Ruiz","Álvarez","Morales","Ortiz","Mendoza","Herrera","Cabrera"],
  },
  custom: {
    first: ["Alex","Sam","Jordan","Taylor","Morgan","Casey","Riley","Avery","Quinn","Reese","Drew","Skyler","Cameron","Hayden","Rowan","Sage","Emery","Phoenix"],
    last: ["Smith","Johnson","Lee","Patel","Kim","Garcia","Müller","Dubois","Ivanov","Yamamoto","Cohen","Andersson","Novak","Khan","Silva","Okonkwo"],
  },
};

const AGE_BRACKETS = ["19","23","27","31","35","39","44","48","53","58","63","68","72"];
const PROFESSIONS = ["barista","accountant","mechanic","teacher","nurse","logistics manager","street vendor","copywriter","electrician","midwife","university lecturer","cab driver","pharmacist","NGO field officer","software contractor","wedding planner","sales rep","fishmonger","mid-level bureaucrat","content creator","real-estate broker","mosque caretaker","football coach","unemployed graduate","family-business heir"];
const CORE_VALUES = ["family-first","reputation above all","pragmatic survivor","ideologically driven","status-seeking","spiritually devout","cynical realist","openly idealistic","quietly ambitious","tribal loyalty","contrarian by reflex","conflict-averse"];
const QUIRKS = ["tells stories instead of arguments","never says no directly","name-drops constantly","speaks in proverbs","obsessed with conspiracy theories","always quotes scripture","hides wealth","performs piety in public","laughs at authority","records everything on phone","negotiates aggressively","forwards every WhatsApp rumor","silent until provoked","monologues when nervous","switches languages mid-sentence"];
const COMM_STYLES = ["voice-note heavy","WhatsApp group dominant","face-to-face only","Twitter/X firebrand","TikTok native","email formalist","Telegram channel admin","mosque/parish pulpit","café back-table whisperer","reels lurker"];
const STANCES = ["NEUTRAL","NEUTRAL","CURIOUS","CURIOUS","HOSTILE","AMPLIFIER"];

function pick<T>(arr: T[], i: number): T { return arr[((i % arr.length) + arr.length) % arr.length]; }
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const ANGLO_FIRST = ["James","Olivia","Noah","Emma","Liam","Ava","Ethan","Sophia","Mason","Isabella","Lucas","Mia","Logan","Charlotte","Henry","Amelia","Owen","Harper","Jack","Evelyn","Caleb","Zoe"];
const ANGLO_LAST = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Wilson","Anderson","Taylor","Thomas","Moore","Jackson","Martin","Lee","Walker","Hall","Young","King"];

type CountryEntry = { name: string; continent: string; theatre: string; regions: string[]; first: string[]; last: string[] };

const COUNTRY_CORPUS: Record<string, CountryEntry> = {
  DE: { name:"Germany", continent:"Europe", theatre:"custom", regions:["Berlin","Bavaria","Hamburg","NRW","Saxony","Baden-Württemberg"], first:["Lukas","Mia","Felix","Hannah","Jonas","Lena","Tim","Laura","Max","Sophie","Paul","Emilia","Leon","Anna","Finn","Marie"], last:["Müller","Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann","Bauer","Koch","Richter","Klein","Wolf","Neumann"] },
  FR: { name:"France", continent:"Europe", theatre:"custom", regions:["Île-de-France","Provence-Alpes-Côte d'Azur","Auvergne-Rhône-Alpes","Occitanie","Bretagne","Normandie"], first:["Léa","Hugo","Camille","Louis","Manon","Lucas","Chloé","Nathan","Emma","Théo","Inès","Gabriel","Sarah","Antoine","Juliette","Maxime"], last:["Martin","Bernard","Dubois","Thomas","Robert","Richard","Petit","Durand","Leroy","Moreau","Simon","Laurent","Lefebvre","Michel","Garcia","David"] },
  GB: { name:"United Kingdom", continent:"Europe", theatre:"custom", regions:["London","Greater Manchester","West Midlands","Scotland","Wales","Yorkshire"], first:ANGLO_FIRST, last:ANGLO_LAST },
  IT: { name:"Italy", continent:"Europe", theatre:"italia", regions:["Lombardia","Lazio","Sicilia","Veneto","Campania","Toscana","Puglia"], first:["Marco","Giulia","Luca","Sofia","Matteo","Chiara","Alessandro","Francesca","Davide","Martina","Lorenzo","Valentina","Andrea","Camilla","Giovanni","Aurora"], last:["Rossi","Bianchi","Esposito","Romano","Ferrari","Russo","Greco","Conti","Marino","Ricci","De Luca","Mancini","Costa","Galli","Bruno","Lombardi"] },
  ES: { name:"Spain", continent:"Europe", theatre:"custom", regions:["Madrid","Cataluña","Andalucía","Valencia","Galicia","País Vasco"], first:["Hugo","Lucía","Martín","Sofía","Mateo","Valeria","Daniel","Paula","Pablo","Emma","Álvaro","Carla","Diego","Noa","Adrián","Julia"], last:["García","Rodríguez","González","Fernández","López","Martínez","Sánchez","Pérez","Gómez","Martín","Jiménez","Ruiz","Hernández","Díaz","Moreno","Muñoz"] },
  CN: { name:"China", continent:"Asia", theatre:"custom", regions:["Beijing","Shanghai","Guangdong","Sichuan","Zhejiang","Hubei","Shandong"], first:["Wei","Fang","Ming","Li","Jing","Hao","Yan","Lei","Xiu","Tao","Chen","Mei","Jun","Hua","Bo","Lin"], last:["Wang","Li","Zhang","Liu","Chen","Yang","Zhao","Huang","Zhou","Wu","Xu","Sun","Hu","Zhu","Gao","Lin"] },
  IN: { name:"India", continent:"Asia", theatre:"custom", regions:["Maharashtra","Tamil Nadu","Karnataka","West Bengal","Uttar Pradesh","Gujarat","Kerala","Punjab"], first:["Aarav","Diya","Arjun","Saanvi","Vihaan","Aanya","Aditya","Myra","Krishna","Pari","Reyansh","Anika","Ishaan","Kiara","Rohan","Tara"], last:["Sharma","Verma","Patel","Singh","Kumar","Gupta","Reddy","Iyer","Khan","Mehta","Joshi","Nair","Das","Chatterjee","Mukherjee","Pillai"] },
  ID: { name:"Indonesia", continent:"Asia", theatre:"sea", regions:["Jakarta","West Java","East Java","Central Java","Bali","Sumatra","Sulawesi"], first:["Budi","Siti","Aditya","Nur","Wayan","Dewi","Andi","Putri","Bambang","Ratna","Made","Sri","Joko","Indah","Agus","Maya"], last:["Wijaya","Santoso","Pratama","Susanto","Halim","Hartono","Kusuma","Setiawan","Suharto","Iskandar","Rahman","Saputra","Hidayat","Nugroho","Ananda","Wibowo"] },
  JP: { name:"Japan", continent:"Asia", theatre:"custom", regions:["Tokyo","Osaka","Kanagawa","Aichi","Hokkaido","Fukuoka","Kyoto"], first:["Haruto","Yui","Sota","Aoi","Yuto","Hina","Ren","Sakura","Riku","Mio","Kaito","Rin","Hiroto","Akari","Ayato","Saki"], last:["Sato","Suzuki","Takahashi","Tanaka","Watanabe","Ito","Yamamoto","Nakamura","Kobayashi","Kato","Yoshida","Yamada","Sasaki","Yamaguchi","Matsumoto","Inoue"] },
  PK: { name:"Pakistan", continent:"Asia", theatre:"gulf", regions:["Punjab","Sindh","Khyber Pakhtunkhwa","Balochistan","Islamabad","Karachi"], first:["Muhammad","Ayesha","Ali","Fatima","Hassan","Zainab","Bilal","Hira","Usman","Sana","Ahmed","Maryam","Hamza","Iqra","Saad","Mahnoor"], last:["Khan","Ahmed","Ali","Hussain","Malik","Sheikh","Chaudhry","Iqbal","Raza","Butt","Qureshi","Awan","Siddiqui","Mirza","Baig","Shah"] },
  AE: { name:"UAE", continent:"Middle East", theatre:"gulf", regions:["Dubai","Abu Dhabi","Sharjah","Ajman","Ras Al Khaimah","Fujairah"], first:["Ahmed","Fatima","Khalid","Aisha","Omar","Maryam","Yousef","Noura","Saeed","Latifa","Hamad","Hessa","Mohammed","Shaikha","Rashid","Mariam"], last:["Al-Maktoum","Al-Nahyan","Al-Qasimi","Al-Mansouri","Al-Hashimi","Al-Shamsi","Al-Falasi","Al-Mazrouei","Al-Suwaidi","Al-Ghurair","Al-Habtoor","Al-Marri","Al-Rashed","Al-Ali","Al-Nuaimi","Al-Kaabi"] },
  SA: { name:"Saudi Arabia", continent:"Middle East", theatre:"gulf", regions:["Riyadh","Makkah","Eastern Province","Madinah","Asir","Jeddah"], first:["Abdullah","Norah","Faisal","Reem","Saud","Lina","Khalid","Hala","Bandar","Sara","Turki","Aljawhara","Naif","Mona","Sultan","Dana"], last:["Al-Saud","Al-Otaibi","Al-Qahtani","Al-Ghamdi","Al-Harbi","Al-Shehri","Al-Zahrani","Al-Subaie","Al-Anazi","Al-Dosari","Al-Mutairi","Al-Shammari","Al-Juhani","Al-Sulaiman","Al-Rashid","Al-Faisal"] },
  TR: { name:"Turkey", continent:"Middle East", theatre:"custom", regions:["İstanbul","Ankara","İzmir","Bursa","Antalya","Adana","Konya"], first:["Mehmet","Ayşe","Mustafa","Fatma","Ahmet","Emine","Hüseyin","Hatice","Ali","Zeynep","İbrahim","Elif","Yusuf","Merve","Hasan","Selin"], last:["Yılmaz","Kaya","Demir","Çelik","Şahin","Yıldız","Yıldırım","Öztürk","Aydın","Özdemir","Arslan","Doğan","Kılıç","Aslan","Çetin","Koç"] },
  IR: { name:"Iran", continent:"Middle East", theatre:"custom", regions:["Tehran","Isfahan","Razavi Khorasan","Fars","Khuzestan","East Azerbaijan"], first:["Ali","Fatemeh","Mohammad","Zahra","Hossein","Maryam","Reza","Sara","Amir","Niloofar","Mehdi","Nazanin","Saeed","Leila","Hassan","Negar"], last:["Hosseini","Mohammadi","Karimi","Rezaei","Ahmadi","Ghasemi","Hashemi","Tehrani","Najafi","Sadeghi","Mousavi","Jafari","Esfahani","Nourani","Shirazi","Tabrizi"] },
  IQ: { name:"Iraq", continent:"Middle East", theatre:"custom", regions:["Baghdad","Basra","Mosul","Erbil","Najaf","Sulaymaniyah"], first:["Ali","Zainab","Mohammed","Fatima","Hassan","Mariam","Ahmed","Noor","Mustafa","Hawra","Karim","Sara","Hamza","Aya","Yousef","Rasha"], last:["Al-Abadi","Al-Maliki","Al-Jaffari","Al-Hakim","Al-Sadr","Al-Tikriti","Al-Dulaimi","Al-Janabi","Al-Khazraji","Al-Obeidi","Al-Samarrai","Al-Bayati","Al-Iraqi","Al-Kadhim","Al-Mosuli","Al-Najafi"] },
  NG: { name:"Nigeria", continent:"Africa", theatre:"westaf", regions:["Lagos","Kano","Rivers","Oyo","Kaduna","Anambra","Enugu"], first:["Chinedu","Adaeze","Babatunde","Ngozi","Olumide","Folake","Tunde","Chidinma","Emeka","Aisha","Ibrahim","Halima","Kelechi","Yetunde","Obinna","Bisola"], last:["Okafor","Adeyemi","Eze","Adebayo","Okoro","Nwosu","Bello","Lawal","Obi","Onyeka","Mohammed","Abubakar","Chukwu","Ojo","Salami","Igwe"] },
  ET: { name:"Ethiopia", continent:"Africa", theatre:"custom", regions:["Addis Ababa","Oromia","Amhara","Tigray","SNNPR","Somali"], first:["Abebe","Selam","Daniel","Hanna","Yonas","Tigist","Mulugeta","Bethel","Henok","Meron","Samuel","Liya","Dawit","Mahlet","Robel","Eden"], last:["Tesfaye","Bekele","Haile","Girma","Mekonnen","Alemu","Kebede","Wolde","Tadesse","Abebe","Desta","Gebre","Hailu","Mengistu","Negash","Yohannes"] },
  EG: { name:"Egypt", continent:"Africa", theatre:"custom", regions:["Cairo","Alexandria","Giza","Qalyubia","Sharqia","Dakahlia"], first:["Ahmed","Fatma","Mohamed","Mariam","Mahmoud","Aya","Youssef","Nour","Khaled","Salma","Ali","Habiba","Omar","Farida","Karim","Yasmine"], last:["Mohamed","Ahmed","Hassan","Hussein","Ibrahim","Mahmoud","Said","Mostafa","Ali","Abdelrahman","Farouk","Saleh","Nasser","El-Sayed","Mansour","Khalil"] },
  CD: { name:"DR Congo", continent:"Africa", theatre:"westaf", regions:["Kinshasa","Katanga","Nord-Kivu","Sud-Kivu","Kasaï","Kongo Central"], first:["Jean","Marie","Patrick","Esther","Joseph","Grace","Daniel","Thérèse","Pascal","Charlotte","Eric","Léa","Christian","Béatrice","Olivier","Sandrine"], last:["Mukendi","Kabongo","Mbuyi","Tshisekedi","Lumumba","Mwamba","Ilunga","Kasongo","Ngoy","Bemba","Kalala","Mukamba","Nzuzi","Mbala","Tshibanda","Kimbembe"] },
  ZA: { name:"South Africa", continent:"Africa", theatre:"custom", regions:["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga"], first:["Sipho","Thandi","Lerato","Themba","Nomvula","Sizwe","Zinhle","Mandla","Nokuthula","Bongani","Lindiwe","Tshepo","Palesa","Khaya","Naledi","Kagiso"], last:["Nkosi","Dlamini","Khumalo","Mokoena","Mthembu","Zulu","Ndlovu","Sithole","Tshabalala","Mabaso","Mahlangu","Buthelezi","Cele","Ngcobo","Radebe","Mokwena"] },
  US: { name:"United States", continent:"North America", theatre:"custom", regions:["California","Texas","Florida","New York","Illinois","Pennsylvania","Ohio","Georgia"], first:ANGLO_FIRST, last:ANGLO_LAST },
  MX: { name:"Mexico", continent:"North America", theatre:"latam", regions:["CDMX","Jalisco","Nuevo León","Puebla","Veracruz","Guanajuato","Yucatán"], first:["José","María","Juan","Guadalupe","Luis","Ana","Carlos","Sofía","Miguel","Valentina","Diego","Camila","Fernando","Regina","Alejandro","Ximena"], last:["Hernández","García","Martínez","López","González","Pérez","Rodríguez","Sánchez","Ramírez","Cruz","Flores","Gómez","Morales","Vázquez","Jiménez","Reyes"] },
  CA: { name:"Canada", continent:"North America", theatre:"custom", regions:["Ontario","Quebec","British Columbia","Alberta","Manitoba","Nova Scotia"], first:ANGLO_FIRST, last:ANGLO_LAST },
  GT: { name:"Guatemala", continent:"North America", theatre:"latam", regions:["Guatemala","Quetzaltenango","Escuintla","Alta Verapaz","Petén","San Marcos"], first:["José","María","Carlos","Ana","Luis","Lucía","Juan","Sofía","Diego","Valeria","Marco","Camila","Miguel","Andrea","Pedro","Daniela"], last:["López","García","Méndez","Pérez","Hernández","González","Rodríguez","Morales","Castillo","Ramírez","Vásquez","Sánchez","Reyes","Aguilar","Gómez","Cruz"] },
  CU: { name:"Cuba", continent:"North America", theatre:"latam", regions:["La Habana","Santiago de Cuba","Holguín","Camagüey","Pinar del Río","Matanzas"], first:["Yandi","Yaima","Liosvanny","Yusimí","Reinier","Yanela","Alejandro","Yaquelín","Frank","Mileidys","Yoel","Yanet","Osmany","Yuleidys","Yusniel","Dayana"], last:["Pérez","González","Rodríguez","Hernández","García","Martínez","Sánchez","Fernández","Díaz","Ramírez","Suárez","Castro","Cabrera","Mendoza","Reyes","Acosta"] },
  BR: { name:"Brazil", continent:"South America", theatre:"latam", regions:["São Paulo","Rio de Janeiro","Minas Gerais","Bahia","Paraná","Rio Grande do Sul","Pernambuco"], first:["João","Maria","Pedro","Ana","Lucas","Júlia","Gabriel","Beatriz","Mateus","Sofia","Felipe","Larissa","Rafael","Camila","Bruno","Isabela"], last:["Silva","Santos","Oliveira","Souza","Rodrigues","Ferreira","Alves","Pereira","Lima","Gomes","Costa","Ribeiro","Martins","Carvalho","Almeida","Barbosa"] },
  AR: { name:"Argentina", continent:"South America", theatre:"latam", regions:["Buenos Aires","Córdoba","Santa Fe","Mendoza","Tucumán","Salta"], first:["Mateo","Sofía","Benjamín","Valentina","Joaquín","Catalina","Tomás","Martina","Bautista","Emma","Lautaro","Renata","Santino","Mía","Ignacio","Lola"], last:["González","Rodríguez","Gómez","Fernández","López","Díaz","Martínez","Pérez","Sánchez","Romero","Sosa","Álvarez","Torres","Ruiz","Ramírez","Flores"] },
  CO: { name:"Colombia", continent:"South America", theatre:"latam", regions:["Bogotá","Antioquia","Valle del Cauca","Atlántico","Santander","Cundinamarca"], first:["Santiago","Valentina","Sebastián","Isabella","Mateo","Mariana","Nicolás","Camila","Samuel","Sofía","Daniel","Luciana","Andrés","Sara","Alejandro","Emma"], last:["Rodríguez","Gómez","González","Hernández","Martínez","López","Ramírez","García","Castro","Vargas","Moreno","Jiménez","Álvarez","Romero","Suárez","Torres"] },
  PE: { name:"Peru", continent:"South America", theatre:"latam", regions:["Lima","Arequipa","La Libertad","Piura","Cusco","Junín"], first:["Mateo","Valentina","Thiago","Camila","Liam","Luciana","Sebastián","Mía","Benjamin","Emma","Joaquín","Sofía","Santiago","Renata","Diego","Antonia"], last:["Quispe","Huamán","Mamani","Condori","García","López","Rojas","Flores","Vargas","Torres","Pérez","Cruz","Castillo","Ramos","Salazar","Espinoza"] },
  CL: { name:"Chile", continent:"South America", theatre:"latam", regions:["Santiago","Valparaíso","Biobío","Maule","Araucanía","Antofagasta"], first:["Vicente","Florencia","Agustín","Antonella","Maximiliano","Catalina","Cristóbal","Isidora","Tomás","Amanda","Benjamín","Javiera","Joaquín","Emilia","Matías","Constanza"], last:["González","Muñoz","Rojas","Díaz","Pérez","Soto","Contreras","Silva","Martínez","Sepúlveda","Morales","Rodríguez","López","Fuentes","Hernández","Torres"] },
  AU: { name:"Australia", continent:"Oceania", theatre:"custom", regions:["New South Wales","Victoria","Queensland","Western Australia","South Australia","Tasmania"], first:ANGLO_FIRST, last:ANGLO_LAST },
  NZ: { name:"New Zealand", continent:"Oceania", theatre:"custom", regions:["Auckland","Wellington","Canterbury","Waikato","Bay of Plenty","Otago"], first:["Oliver","Charlotte","Jack","Isla","Noah","Olivia","Hunter","Mia","Leo","Amelia","Mason","Harper","Lucas","Ava","Cooper","Ella"], last:["Smith","Williams","Wilson","Brown","Taylor","Anderson","Walker","Ngata","Te Rangi","Tane","Kahu","Manu","Hapeta","Heke","Rangi","Kingi"] },
  PG: { name:"Papua New Guinea", continent:"Oceania", theatre:"custom", regions:["Port Moresby","Lae","Mt. Hagen","Madang","Wewak","Goroka"], first:["John","Mary","Peter","Grace","Michael","Sarah","David","Anna","James","Ruth","Paul","Esther","Daniel","Joy","Samuel","Hope"], last:["Namaliu","Somare","O'Neill","Marape","Pato","Polye","Wingti","Skate","Morauta","Chan","Kavo","Basil","Steven","Kua","Maru","Tomscoll"] },
  FJ: { name:"Fiji", continent:"Oceania", theatre:"custom", regions:["Central","Western","Northern","Eastern","Suva","Nadi"], first:["Inoke","Mereoni","Sefanaia","Litiana","Josua","Vani","Ratu","Ana","Manasa","Salote","Apolosi","Adi","Setareki","Loraini","Mosese","Ema"], last:["Tuilagi","Vunipola","Naiqama","Saukuru","Bola","Naiveli","Tuisova","Dawai","Vatubua","Tikoirotuma","Rokocoko","Caucau","Domolailai","Loco","Senibici","Qoro"] },
  SB: { name:"Solomon Islands", continent:"Oceania", theatre:"custom", regions:["Honiara","Western","Malaita","Guadalcanal","Choiseul","Makira-Ulawa"], first:["John","Mary","Peter","Grace","David","Sarah","Daniel","Hope","Samuel","Joy","Michael","Ruth","James","Esther","Paul","Faith"], last:["Sogavare","Kemakeza","Lilo","Houenipwela","Manele","Wale","Maelanga","Hilly","Talasasa","Boyers","Tausinga","Filualea","Maetia","Sasako","Rini","Ramofafia"] },
};

const USER_ID = "default";

type SimState = {
  status: "idle" | "building" | "running" | "paused" | "complete" | "error";
  round: number;
  max_rounds: number;
  influence: number;
  resistance: number;
  clusters: number;
  world_build: string;
  report: string;
  agents: any[];
  rounds: any[];
  config: any;
  chat_histories: Record<string, any[]>;
  injected_variables: string[];
  error: string;
};

function emptyState(): SimState {
  return {
    status: "idle", round: 0, max_rounds: 20, influence: 0, resistance: 0, clusters: 0,
    world_build: "", report: "", agents: [], rounds: [], config: {},
    chat_histories: {}, injected_variables: [], error: "",
  };
}

async function loadState(): Promise<{ id: string | null; state: SimState }> {
  const { data } = await supabase
    .from("mirofish_sims")
    .select("id, state")
    .eq("user_id", USER_ID)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return { id: null, state: emptyState() };
  return { id: data.id, state: { ...emptyState(), ...(data.state as any) } };
}

async function saveState(id: string | null, state: SimState): Promise<string> {
  if (id) {
    await supabase.from("mirofish_sims").update({ state, updated_at: new Date().toISOString() }).eq("id", id);
    return id;
  }
  const { data } = await supabase.from("mirofish_sims").insert({ user_id: USER_ID, state }).select("id").single();
  return data!.id;
}

async function geminiCall(prompt: string, system: string, max_tokens: number, model: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: max_tokens },
    }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Gemini ${model} ${r.status}: ${text.slice(0, 200)}`);
  const j = JSON.parse(text);
  return (j.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? "").join("");
}

async function claude(prompt: string, system = "", max_tokens = 1000): Promise<string> {
  // Gemini-first
  if (GEMINI_KEY) {
    for (const model of GEMINI_MODELS) {
      try { return await geminiCall(prompt, system, max_tokens, model); }
      catch (err) { console.error(`Gemini ${model} failed:`, (err as Error).message?.slice(0, 200)); }
    }
  }
  // Lovable gateway fallback
  if (LOVABLE_KEY) {
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_KEY}` },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          max_tokens,
          messages: [
            ...(system ? [{ role: "system", content: system }] : []),
            { role: "user", content: prompt },
          ],
        }),
      });
      const t = await r.text();
      if (r.ok) {
        const j = JSON.parse(t);
        return j.choices?.[0]?.message?.content ?? "";
      }
      console.error("Lovable gateway failed:", r.status, t.slice(0, 200));
    } catch (err) { console.error("Lovable gateway threw:", (err as Error).message?.slice(0, 200)); }
  }
  // Anthropic last resort
  if (!ANTHROPIC_KEY) throw new Error("No AI provider available");
  const body: any = { model: MODEL, max_tokens, messages: [{ role: "user", content: prompt }] };
  if (system) body.system = system;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.content?.[0]?.text ?? "";
}

function randInt(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }

async function buildWorld(config: any): Promise<string> {
  const theatre = config.theatre ?? "italia";
  const sim_type = config.sim_type ?? "campaign";
  const narrative = config.narrative ?? "";
  const agent_count = config.agent_count ?? 50;
  const max_rounds = config.max_rounds ?? 20;
  const archetypes = config.archetypes ?? DEFAULT_ARCHETYPES[theatre] ?? DEFAULT_ARCHETYPES.custom;
  const cold_mode = config.cold_system_mode ?? true;
  const theatre_ctx = THEATRE_CONTEXT[theatre] ?? THEATRE_CONTEXT.custom;
  const sim_ctx = SIM_TYPE_CONTEXT[sim_type] ?? "general social simulation";

  const prompt = `You are MiroFish — a swarm intelligence simulation engine (github.com/666ghj/MiroFish).
You construct high-fidelity parallel digital worlds from seed narratives and simulate social
evolution using multi-agent technology.

COLD SYSTEM MODE: ${cold_mode ? "ON — agents are dormant until the narrative is injected as first stimulus. No spontaneous agent activity." : "OFF — agents self-initiate."}

NARRATIVE SEED (the stimulus the swarm will react to):
"""
${narrative}
"""

CULTURAL CONTEXT: ${theatre_ctx}
SIMULATION TYPE: ${sim_ctx}
AGENT COUNT: ${agent_count}
MAX ROUNDS: ${max_rounds}
ARCHETYPES TO SPAWN: ${archetypes.join(", ")}

Complete STEPS 01 & 02 of the MiroFish pipeline:

STEP 01 — GRAPH BUILD:
Extract key entities, relationships, and tension points from the narrative.
Identify 3 hub nodes (high-centrality actors) and their connection type.

STEP 02 — ENVIRONMENT SETUP:
Spawn 12 distinct agent persona TEMPLATES (the swarm of ${agent_count} will be procedurally diversified from these). For each:
  NAME: [first name last initial]
  ARCHETYPE: [from the archetype list above]
  PERSONALITY: [one sentence, culturally specific]
  INITIAL STANCE: [NEUTRAL | CURIOUS | HOSTILE | AMPLIFIER]

Then state:
EDGES: the 3 most critical relationship edges that will drive emergence
COLD STATE: pre-injection conditions, latent tensions, what tips the first domino

Be specific to the ${theatre} cultural context. Plain text, no markdown.`;
  return claude(prompt, "", 1200);
}

function parseAgents(
  worldText: string,
  theatre: string,
  agentCount: number = 50,
  opts: { country?: string; region?: string; seed?: number } = {},
): any[] {
  const templates: any[] = [];
  let current: any = null;
  for (const raw of worldText.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("NAME:")) {
      if (current?.archetype) templates.push(current);
      current = { archetype: "", personality: "", stance: "NEUTRAL" };
    } else if (line.startsWith("ARCHETYPE:") && current) {
      current.archetype = line.replace("ARCHETYPE:", "").trim();
    } else if (line.startsWith("PERSONALITY:") && current) {
      current.personality = line.replace("PERSONALITY:", "").trim();
    } else if (line.startsWith("INITIAL STANCE:") && current) {
      current.stance = line.replace("INITIAL STANCE:", "").trim();
    }
  }
  if (current?.archetype) templates.push(current);
  if (templates.length === 0) {
    const arc = DEFAULT_ARCHETYPES[theatre] ?? DEFAULT_ARCHETYPES.custom;
    arc.forEach((a) => templates.push({
      archetype: a,
      personality: `A culturally authentic ${a.toLowerCase()} from the ${theatre} theatre.`,
      stance: "NEUTRAL",
    }));
  }

  const country = opts.country && COUNTRY_CORPUS[opts.country] ? COUNTRY_CORPUS[opts.country] : null;
  const pool = country
    ? { first: country.first, last: country.last }
    : (NAME_POOLS[theatre] ?? NAME_POOLS.custom);
  const regions = country?.regions ?? [];
  const fixedRegion = opts.region && opts.region.trim() ? opts.region.trim() : "";

  const total = Math.max(1, Math.min(agentCount, 5000));
  const agents: any[] = [];
  const seenNames = new Set<string>();

  // Deterministic seeded RNG so the same seed reproduces the swarm
  const baseSeed = (opts.seed ?? 0) >>> 0;
  const seedFor = (i: number, salt: number) =>
    (baseSeed ^ Math.imul(i + 1, 2654435761) ^ Math.imul(salt + 1, 40503)) >>> 0;
  const r = (i: number, salt: number) => mulberry32(seedFor(i, salt))();
  const pickR = <T,>(arr: T[], i: number, salt: number) => arr[Math.floor(r(i, salt) * arr.length)];

  const initials = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < total; i++) {
    const t = templates[i % templates.length];
    const first = pickR(pool.first, i, 1);
    const last = pickR(pool.last, i, 2);
    const age = pickR(AGE_BRACKETS, i, 3);
    const profession = pickR(PROFESSIONS, i, 4);
    const value = pickR(CORE_VALUES, i, 5);
    const quirk = pickR(QUIRKS, i, 6);
    const comm = pickR(COMM_STYLES, i, 7);
    const stance = i < templates.length ? t.stance : pickR(STANCES, i, 8);
    const region = fixedRegion || (regions.length ? pickR(regions, i, 9) : "");

    // Dedup ladder: bare → +middle initial → +second initial → +numeric suffix
    let name = `${first} ${last}`;
    if (seenNames.has(name)) {
      const m1 = initials[Math.floor(r(i, 10) * 26)];
      name = `${first} ${m1}. ${last}`;
    }
    if (seenNames.has(name)) {
      const m1 = initials[Math.floor(r(i, 10) * 26)];
      const m2 = initials[Math.floor(r(i, 11) * 26)];
      name = `${first} ${m1}.${m2}. ${last}`;
    }
    let suf = 2;
    const baseAttempt = name;
    while (seenNames.has(name)) { name = `${baseAttempt} ${suf++}`; if (suf > 9999) break; }
    seenNames.add(name);

    const locStr = region ? ` Based in ${region}${country ? `, ${country.name}` : ""}.` : (country ? ` Based in ${country.name}.` : "");
    const personality = `${age}yo ${profession}.${locStr} ${value}; ${quirk}. Comms: ${comm}. Frame: ${t.personality}`;

    agents.push({
      id: `agent_${i}_${name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`,
      name,
      archetype: t.archetype,
      personality,
      stance,
      color: AGENT_COLORS[i % AGENT_COLORS.length],
      country: opts.country ?? null,
      region: region || null,
      memory: [],
    });
  }
  return agents;
}

async function runRound(state: SimState, roundNumber: number): Promise<any> {
  const config = state.config;
  const narrative = config.narrative ?? "";
  const theatre = config.theatre ?? "italia";
  const sim_type = config.sim_type ?? "campaign";
  const theatre_ctx = THEATRE_CONTEXT[theatre] ?? THEATRE_CONTEXT.custom;
  const sim_ctx = SIM_TYPE_CONTEXT[sim_type] ?? "general simulation";
  const cold_mode = config.cold_system_mode ?? true;

  let prevSummary = "";
  if (state.rounds.length) {
    const last = state.rounds[state.rounds.length - 1];
    prevSummary = (last.events ?? []).map((e: any) => `[${e.agent_name}]: ${e.text}`).join(" | ");
  }
  const latestInjection = state.injected_variables.length ? state.injected_variables[state.injected_variables.length - 1] : null;
  const injectionNote = latestInjection ? `\n\nGOD'S-EYE INJECTION THIS ROUND: "${latestInjection}" — all agents may react to this new variable.` : "";
  const coldNote = (roundNumber === 1 && cold_mode) ? "\n\nCOLD SYSTEM ACTIVATION: Round 1. The narrative is being injected into the dormant swarm for the first time. Show the initial reactive sparks — first awareness, first interpretations, first micro-decisions." : "";

  const agentDesc = state.agents.map(a => `- ${a.name} (${a.archetype}, stance: ${a.stance}): ${a.personality}`).join("\n");
  const feel = roundNumber <= 5 ? "early/uncertain — first contact" : roundNumber <= 12 ? "momentum building" : "consolidating/decisive";

  const prompt = `You are MiroFish running Round ${roundNumber}/${state.max_rounds} of a cold-system swarm simulation.

NARRATIVE (the stimulus the swarm is reacting to):
"""
${narrative}
"""

CULTURAL CONTEXT: ${theatre_ctx}
SIMULATION TYPE: ${sim_ctx}
CURRENT STATE: Influence ${state.influence}%, Resistance ${state.resistance}%
PREVIOUS ROUND: ${prevSummary || "Simulation just started."}
${injectionNote}${coldNote}

AGENT ROSTER:
${agentDesc}

Generate exactly 3 agent interaction snippets for this round.
Use this EXACT format for each:
[Name — Archetype — STANCE]: "their exact words or internal monologue (1-3 sentences)"

Rules:
- Cold reactive: agents respond TO the narrative stimulus, not to each other spontaneously
- Culturally specific dialogue — use real concerns, idioms, values of ${theatre} culture
- Show emotional reality: skepticism, excitement, fear, calculation, gossip, prayer
- Round ${roundNumber} feels: ${feel}
- Mix stances: not everyone agrees — realistic resistance is required

After the 3 snippets, add:
EMERGENCE NOTE: [one sentence — what collective pattern is crystallizing this round]
INFLUENCE DELTA: [integer 2-8 — how much influence spread this round]
RESISTANCE DELTA: [integer 0-4 — how much resistance hardened this round]`;

  const raw = await claude(prompt, "", 600);
  const events: any[] = [];
  let emergence = "";
  let influenceDelta = randInt(2, 6);
  let resistanceDelta = randInt(0, 3);

  for (const raw_line of raw.split("\n")) {
    const line = raw_line.trim();
    const m = line.match(/^\[(.+?)\s*[—\-]+\s*(.+?)\s*[—\-]+\s*(.+?)\]:\s*"(.+)"/);
    if (m) {
      const [, name, archetype, stance, text] = m;
      const sl = stance.toLowerCase();
      const color = sl.includes("amplif") ? "#5a3a8a"
        : (sl.includes("hostile") || sl.includes("resist")) ? "#e85d24"
        : sl.includes("curious") ? "#c8a96e" : "#3a7ca5";
      const agent = state.agents.find(a => name.toLowerCase().includes(a.name.split(" ")[0].toLowerCase()));
      const agent_id = agent?.id ?? name.replace(/ /g, "_");
      if (agent) {
        agent.memory = [...(agent.memory ?? []), text.slice(0, 120)];
        agent.stance = stance.toUpperCase();
      }
      events.push({
        agent_id, agent_name: name, agent_color: color, archetype, stance, text,
        type: latestInjection ? "injection" : "reaction", round: roundNumber,
      });
    } else if (line.startsWith("EMERGENCE NOTE:")) {
      emergence = line.replace("EMERGENCE NOTE:", "").trim();
    } else if (line.startsWith("INFLUENCE DELTA:")) {
      const n = line.match(/\d+/); if (n) influenceDelta = parseInt(n[0]);
    } else if (line.startsWith("RESISTANCE DELTA:")) {
      const n = line.match(/\d+/); if (n) resistanceDelta = parseInt(n[0]);
    }
  }
  return {
    round: roundNumber, timestamp: new Date().toISOString(),
    events, emergence_note: emergence, raw,
    influence_delta: influenceDelta, resistance_delta: resistanceDelta,
  };
}

async function generateReport(state: SimState): Promise<string> {
  const config = state.config;
  const narrative = config.narrative ?? "";
  const theatre = config.theatre ?? "italia";
  const sim_type = config.sim_type ?? "campaign";
  const theatre_ctx = THEATRE_CONTEXT[theatre] ?? "";
  const sim_ctx = SIM_TYPE_CONTEXT[sim_type] ?? "general simulation";
  const recent = state.rounds.slice(-5);
  const samples = recent.map(r => `Round ${r.round}: ` + (r.events ?? []).map((e: any) => `[${e.agent_name}]: ${e.text}`).join(" | ")).join("\n");
  const injections = state.injected_variables.join("; ") || "none";

  const prompt = `You are the MiroFish ReportAgent. You observed a complete ${state.rounds.length}-round
cold-system swarm simulation. Write the full prediction report.

NARRATIVE INJECTED:
"""
${narrative}
"""

SIMULATION DATA:
- Theatre: ${theatre} (${theatre_ctx.split(":")[0].trim()})
- Type: ${sim_ctx}
- Rounds completed: ${state.rounds.length}/${state.max_rounds}
- Final influence spread: ${state.influence}%
- Final resistance level: ${state.resistance}%
- God's-Eye injections: ${injections}

LAST 5 ROUNDS SAMPLE:
${samples}

Write the report with these labeled sections (plain text, no markdown):

HEADLINE: [one sentence — the single most important prediction]

ADOPTION TRAJECTORY: [how the narrative spread — key inflection points, what triggered momentum or stalling]

CULTURAL DRIVERS: [exactly 3 factors specific to ${theatre} culture that drove or blocked adoption]

RESISTANCE ANALYSIS: [who resisted, why, what moved them or didn't — name archetypes]

EMERGENCE SURPRISES: [1-2 things that emerged from agent interactions the narrative author didn't anticipate]

CRITICAL PATH: [the single highest-leverage intervention to increase spread or reduce resistance]

BELICIA INTEL: [3 specific operational recommendations connecting to Eagle's Doctrine — nafs/aql/taqwa/asabiyya framework]

Be tactical, culturally precise, operationally specific. This drives real decisions.`;
  return claude(prompt, "", 1400);
}

async function interrogate(state: SimState, agentId: string, message: string): Promise<{ reply: string; agent: any }> {
  const config = state.config;
  const narrative = config.narrative ?? "";
  const theatre = config.theatre ?? "italia";
  const theatre_ctx = THEATRE_CONTEXT[theatre] ?? "";
  const isReport = agentId === "ReportAgent";
  let system = "";
  let agent: any = null;
  if (isReport) {
    system = `You are the MiroFish ReportAgent — you observed the entire ${state.round}-round simulation. You have complete visibility into all agent behaviors and social dynamics. Answer analytical questions precisely. Keep responses to 3-5 sentences.`;
    agent = { id: "ReportAgent", name: "ReportAgent", archetype: "Meta-Observer", color: "#5a3a8a", stance: "OBSERVER", personality: "Bird's-eye analytical observer of the swarm." };
  } else {
    agent = state.agents.find(a => a.id === agentId || a.name.replace(/ /g, "_") === agentId);
    if (!agent) return { reply: "Agent not found in this simulation.", agent: null };
    const memories = (agent.memory ?? []).slice(-5).join(" | ") || "No significant memories yet.";
    system = `You are ${agent.name}, a ${agent.archetype} in a MiroFish social simulation. Cultural context: ${theatre_ctx.split(".")[0]}. You've been reacting to this narrative: "${narrative.slice(0, 250)}". Your recent memories from the simulation: ${memories}. Current stance: ${agent.stance}. Round: ${state.round}. Stay in character. Be culturally authentic. Keep responses to 2-4 sentences.`;
  }
  const history = state.chat_histories[agentId] ?? [];
  const histText = history.length
    ? "\n\nConversation so far:\n" + history.slice(-6).map((m: any) => `${m.role === "user" ? "OPERATOR" : "AGENT"}: ${m.content}`).join("\n")
    : "";
  const reply = await claude(`${histText}\n\nOPERATOR: ${message}`, system, 300);
  return { reply, agent };
}

function snapshot(state: SimState) {
  return {
    status: state.status, round: state.round, max_rounds: state.max_rounds,
    influence: state.influence, resistance: state.resistance, clusters: state.clusters,
    agents: state.agents, injected_variables: state.injected_variables,
    world_build: state.world_build, report: state.report,
    round_count: state.rounds.length,
    latest_round: state.rounds[state.rounds.length - 1] ?? null,
    error: state.error, config: state.config,
  };
}

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!ANTHROPIC_KEY) return json({ error: "ANTHROPIC_API_KEY missing" }, 500);

  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "state";
  let body: any = {};
  if (req.method === "POST") { try { body = await req.json(); } catch { /* empty */ } }

  try {
    let { id, state } = await loadState();

    switch (action) {
      case "health":
        return json({ status: "ok", model: MODEL, sim_status: state.status });

      case "state":
        return json(snapshot(state));

      case "rounds": {
        const limit = parseInt(url.searchParams.get("limit") ?? "10");
        return json({ rounds: state.rounds.slice(-limit), total: state.rounds.length });
      }

      case "theatres":
        return json({
          theatres: Object.keys(THEATRE_CONTEXT).map(k => ({
            id: k, context: THEATRE_CONTEXT[k], archetypes: DEFAULT_ARCHETYPES[k] ?? [],
          })),
        });

      case "agents":
        return json({ agents: state.agents, count: state.agents.length });

      case "countries": {
        const list = Object.entries(COUNTRY_CORPUS).map(([code, c]) => ({
          code, name: c.name, continent: c.continent, theatre: c.theatre, regions: c.regions,
        }));
        const byContinent: Record<string, any[]> = {};
        for (const c of list) (byContinent[c.continent] ??= []).push(c);
        return json({ countries: list, by_continent: byContinent });
      }

      case "reset":
        state = emptyState();
        await saveState(id, state);
        return json({ status: "idle", message: "Simulation reset. Ready for a new narrative." });

      case "start": {
        if (!body.narrative) return json({ error: "narrative required" }, 400);
        state = emptyState();
        const country = body.country && COUNTRY_CORPUS[body.country] ? body.country : null;
        const inferredTheatre = country ? COUNTRY_CORPUS[country].theatre : (body.theatre ?? "italia");
        const seed = (typeof body.seed === "number" && Number.isFinite(body.seed))
          ? Math.floor(body.seed)
          : (typeof body.seed === "string" && body.seed.length ? hashStr(body.seed) : Math.floor(Math.random() * 0xffffffff));
        state.config = {
          theatre: body.theatre ?? inferredTheatre,
          sim_type: body.sim_type ?? "campaign",
          narrative: body.narrative,
          agent_count: body.agent_count ?? 50,
          max_rounds: body.max_rounds ?? 20,
          archetypes: body.archetypes ?? null,
          cold_system_mode: body.cold_system_mode ?? true,
          country,
          region: body.region ?? null,
          seed,
        };
        state.max_rounds = state.config.max_rounds;
        state.status = "building";
        const world = await buildWorld(state.config);
        state.world_build = world;
        state.agents = parseAgents(world, state.config.theatre, state.config.agent_count, {
          country: state.config.country, region: state.config.region, seed: state.config.seed,
        });
        state.clusters = state.agents.length;
        state.status = "running";
        await saveState(id, state);
        return json({
          status: "running", world_build: world, agents: state.agents, seed,
          message: `World built. ${state.agents.length} agents spawned. Ready for round stepping.`,
        });
      }

      case "step": {
        if (!["running", "paused"].includes(state.status))
          return json({ error: `Cannot step: simulation is ${state.status}.` }, 400);
        if (state.round >= state.max_rounds) {
          state.status = "complete"; await saveState(id, state);
          return json({ error: "Simulation complete. Generate report." }, 400);
        }
        const next = state.round + 1;
        const rd = await runRound(state, next);
        state.round = next;
        state.influence = Math.min(100, state.influence + rd.influence_delta);
        state.resistance = Math.min(60, state.resistance + rd.resistance_delta);
        state.rounds.push(rd);
        if (next % 5 === 0) state.clusters = Math.max(2, state.clusters - 1);
        if (next >= state.max_rounds) state.status = "complete";
        await saveState(id, state);
        return json({
          round: next, events: rd.events, emergence_note: rd.emergence_note,
          influence: state.influence, resistance: state.resistance,
          clusters: state.clusters, status: state.status,
        });
      }

      case "auto": {
        if (!["running", "paused"].includes(state.status))
          return json({ error: `Cannot auto-run: simulation is ${state.status}.` }, 400);
        const all: any[] = [];
        while (state.round < state.max_rounds) {
          const next = state.round + 1;
          const rd = await runRound(state, next);
          state.round = next;
          state.influence = Math.min(100, state.influence + rd.influence_delta);
          state.resistance = Math.min(60, state.resistance + rd.resistance_delta);
          state.rounds.push(rd);
          if (next % 5 === 0) state.clusters = Math.max(2, state.clusters - 1);
          all.push({ round: next, events: rd.events, emergence_note: rd.emergence_note });
        }
        state.status = "complete";
        await saveState(id, state);
        return json({
          status: "complete", rounds_run: all.length,
          influence: state.influence, resistance: state.resistance, rounds: all,
          message: "All rounds complete. Call ?action=report to generate the prediction report.",
        });
      }

      case "inject": {
        if (!body.variable) return json({ error: "variable required" }, 400);
        if (!["running", "paused", "complete"].includes(state.status))
          return json({ error: "No active simulation to inject into." }, 400);
        state.injected_variables.push(body.variable);
        state.resistance = Math.min(60, state.resistance + randInt(3, 8));
        if (state.status === "complete") {
          state.status = "running";
          state.max_rounds += 5;
        }
        await saveState(id, state);
        return json({
          variable: body.variable, total_injections: state.injected_variables.length,
          resistance: state.resistance, status: state.status,
          message: `Variable injected. Resistance now ${state.resistance}%. Run ?action=step to see reactions.`,
        });
      }

      case "report": {
        const report = await generateReport(state);
        state.report = report;
        await saveState(id, state);
        return json({
          report, influence: state.influence, resistance: state.resistance,
          rounds_analysed: state.rounds.length, agents: state.agents,
        });
      }

      case "interrogate": {
        if (!body.agent_id || !body.message) return json({ error: "agent_id and message required" }, 400);
        const { reply, agent } = await interrogate(state, body.agent_id, body.message);
        if (!agent) return json({ error: "Agent not found" }, 404);
        const hist = state.chat_histories[body.agent_id] ?? [];
        hist.push({ role: "user", content: body.message });
        hist.push({ role: "assistant", content: reply });
        state.chat_histories[body.agent_id] = hist;
        await saveState(id, state);
        return json({
          agent_id: agent.id, agent_name: agent.name, agent_color: agent.color,
          archetype: agent.archetype, reply, round: state.round,
        });
      }

      default:
        return json({ error: `unknown action: ${action}` }, 400);
    }
  } catch (e: any) {
    console.error("mirofish error", e);
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
