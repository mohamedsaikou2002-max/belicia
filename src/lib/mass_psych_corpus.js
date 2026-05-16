// ============================================================
// BELICIA — Mass Psychology Corpus
// Academic sources, research papers, behavioral economics,
// historical event analyses — all publicly available
// Run this file once to seed agent_behavior_corpus
// ============================================================

const CORPUS_DOCS = [

  // ── FOUNDATIONAL MASS PSYCHOLOGY ─────────────────────────

  {
    id: "lebon_crowd_001",
    source: "https://www.gutenberg.org/ebooks/445",
    title: "The Crowd: A Study of the Popular Mind — Le Bon (1895)",
    text: "Crowds exhibit a collective mind distinct from individual minds. The individual in a crowd acquires a sentiment of invincible power. Anonymity produces irresponsibility. Contagion spreads feelings and acts with such rapidity that personal interests are sacrificed to the collective interest. Suggestibility replaces conscious personality. The crowd thinks in images and is moved by exaggeration, one-sidedness, and simplifications."
  },
  {
    id: "lebon_crowd_002",
    source: "https://www.gutenberg.org/ebooks/445",
    title: "Le Bon — Crowd Contagion and Unanimity",
    text: "In crowds, every sentiment and act is contagious to such a degree that an individual readily sacrifices his personal interest to the collective interest. This is an aptitude very contrary to his nature and of which a man is scarcely capable except when he makes part of a crowd. A crowd is always intellectually inferior to the isolated individual. Crowds are only powerful for destruction."
  },
  {
    id: "tarde_imitation_001",
    source: "https://archive.org/details/lawsofimitation00tardgoog",
    title: "Gabriel Tarde — The Laws of Imitation (1890)",
    text: "Social life is essentially imitative. Beliefs and desires spread through society by imitation just as waves spread through water. Imitation flows downward from elites to masses, and from urban centers to rural peripheries. Fashion and custom are the two great forms of social imitation. Counter-imitation produces opposition movements."
  },
  {
    id: "freud_group_001",
    source: "https://www.gutenberg.org/ebooks/35877",
    title: "Freud — Group Psychology and the Analysis of the Ego (1921)",
    text: "The individual gives up his ego ideal and substitutes for it the group ideal as embodied in the leader. Groups require a leader or leading idea. Love bonds tie the group together. Members identify with each other through shared identification with the leader. Loss of the leader produces panic as libidinal ties dissolve simultaneously."
  },
  {
    id: "freud_group_002",
    source: "https://www.gutenberg.org/ebooks/35877",
    title: "Freud — Identification and Suggestibility in Groups",
    text: "The uncanny and coercive characteristics of group formations, which show themselves in their suggestion phenomena, can be traced back to the fact of their origin from the primal horde. Panic arises when the group ceases to exist, when the tie with the leader and ties between members dissolve."
  },

  // ── BEHAVIORAL ECONOMICS ─────────────────────────────────

  {
    id: "kahneman_pt_001",
    source: "https://doi.org/10.2307/1914185",
    title: "Kahneman & Tversky — Prospect Theory (1979) Econometrica",
    text: "Losses loom larger than gains. The pain of losing $100 is psychologically twice as powerful as the pleasure of gaining $100. People are risk-averse for gains but risk-seeking to avoid losses. Reference points determine framing. Certainty effect: people overweight certain outcomes relative to probable ones. This produces systematic violations of expected utility theory."
  },
  {
    id: "kahneman_pt_002",
    source: "https://doi.org/10.2307/1914185",
    title: "Prospect Theory — Loss Aversion and Framing",
    text: "The value function is concave for gains and convex for losses and generally steeper for losses than for gains. Choices involving risky prospects exhibit systematic violations of utility theory. Framing effects show that economically equivalent descriptions produce different choices. Loss aversion coefficient estimated at 2.0-2.5x for most populations."
  },
  {
    id: "thaler_nudge_001",
    source: "https://doi.org/10.1086/467392",
    title: "Thaler & Sunstein — Nudge Theory and Choice Architecture",
    text: "Default options have enormous power. Most people accept whatever option is presented as the default. Opt-out designs dramatically increase participation versus opt-in. Anchoring effects persist even when anchors are random. Social norms information changes behavior more than information about personal benefits. Loss framing outperforms gain framing for compliance."
  },
  {
    id: "cialdini_influence_001",
    source: "https://www.influenceatwork.com/principles-of-persuasion/",
    title: "Cialdini — Six Principles of Influence (1984)",
    text: "Reciprocity: people feel obligated to return favors. Commitment and consistency: once committed publicly, people align behavior with commitment. Social proof: uncertainty drives imitation of others, especially similar others. Authority: people defer to credible experts. Liking: we comply with those we like. Scarcity: less availability increases desirability and urgency."
  },
  {
    id: "cialdini_influence_002",
    source: "https://www.influenceatwork.com/principles-of-persuasion/",
    title: "Cialdini — Social Proof and Uncertainty",
    text: "Social proof is strongest under conditions of uncertainty and when the models are similar to the observer. Pluralistic ignorance occurs when everyone privately doubts but publicly conforms, believing others are more certain. Bystander effect reduces individual action as group size increases. Consensus information changes behavior more than personal benefit information."
  },
  {
    id: "ariely_predictably_001",
    source: "https://doi.org/10.1093/jcr/ucaa004",
    title: "Ariely — Predictably Irrational Behavior Patterns",
    text: "Human irrationality is systematic and predictable, not random. Anchoring persists even with irrelevant numbers. Relativity: we judge value relative to context, not absolutely. Zero price effect: free items are valued disproportionately. Expectations shape experience. Price-quality associations cause expensive placebos to work better. Ownership creates overvaluation."
  },

  // ── INFORMATION CASCADES & HERDING ───────────────────────

  {
    id: "bikhchandani_cascade_001",
    source: "https://doi.org/10.1086/261849",
    title: "Bikhchandani, Hirshleifer & Welch — Information Cascades (1992)",
    text: "Information cascades occur when it is optimal for an individual to follow the behavior of those preceding them, regardless of their own private information signal. Cascades can be wrong and fragile. A small amount of public information can overwhelm all private information. Fads, fashions, and bubbles result from rational cascades."
  },
  {
    id: "bikhchandani_cascade_002",
    source: "https://doi.org/10.1086/261849",
    title: "Cascade Fragility and Reversal",
    text: "Information cascades are fragile. A small shock or a single credible contrarian signal can break a cascade and reverse it completely. The speed of cascade reversal depends on how public the counter-signal is. Cascades in financial markets produce bubbles that reverse rapidly when a single prominent actor dissents publicly."
  },
  {
    id: "surowiecki_wisdom_001",
    source: "https://en.wikipedia.org/wiki/The_Wisdom_of_Crowds",
    title: "Surowiecki — Wisdom of Crowds vs Madness of Crowds",
    text: "Crowds are wise when: diversity of opinion exists, opinions are independent, local knowledge is decentralized, and aggregation mechanisms exist. Crowds become mad when: homogenization occurs, imitation replaces independent thinking, and feedback loops amplify initial signals. Social networks can destroy independence, converting diverse crowds into herds."
  },
  {
    id: "watts_small_world_001",
    source: "https://doi.org/10.1038/30918",
    title: "Watts & Strogatz — Small World Networks (Nature 1998)",
    text: "Most real networks including social networks have small-world properties: high clustering coefficient but short average path length. Information spreads rapidly through small-world networks due to bridge ties connecting clusters. Six degrees of separation is an emergent property of small-world topology. Removing hubs dramatically disrupts information flow."
  },
  {
    id: "barabasi_scale_free_001",
    source: "https://doi.org/10.1126/science.286.5439.509",
    title: "Barabasi & Albert — Scale-Free Networks (Science 1999)",
    text: "Real networks grow by preferential attachment: new nodes connect to already well-connected nodes. This produces power-law degree distributions with few hubs having many connections. Hubs are highly influential in information spread. Scale-free networks are robust to random node failure but highly vulnerable to targeted hub removal. Social influence concentrates in hubs."
  },

  // ── EPIDEMIC MODELS FOR INFORMATION SPREAD ───────────────

  {
    id: "kermack_seir_001",
    source: "https://doi.org/10.1098/rspa.1927.0118",
    title: "Kermack & McKendrick — SIR Epidemic Model (1927)",
    text: "The SIR model divides a population into Susceptible, Infected, and Recovered compartments. The reproduction number R0 determines whether an epidemic spreads (R0>1) or dies out (R0<1). Herd immunity threshold is 1-1/R0. Information epidemics follow similar dynamics: narrative R0 depends on contact rate, transmission probability, and recovery rate."
  },
  {
    id: "goffman_epidemic_001",
    source: "https://doi.org/10.1038/205604a0",
    title: "Goffman & Newill — Generalization of Epidemic Theory to Ideas (Nature 1964)",
    text: "Mathematical epidemic models apply to the spread of ideas and scientific theories. An idea spreads through a population analogously to a disease: susceptible individuals are exposed, some become infected (convinced), and eventually recover (lose interest or reject). The basic reproduction number determines idea persistence in a population."
  },
  {
    id: "dodds_rumor_001",
    source: "https://doi.org/10.1103/PhysRevE.64.046135",
    title: "Dodds & Watts — Universal Behavior in a Generalized Model of Contagion (2004)",
    text: "Social contagion differs from biological contagion: complex contagion requires multiple exposures before adoption. Simple contagion spreads with single exposure. Ideas and behaviors requiring social proof are complex contagions with higher thresholds. Network structure affects complex contagion differently than simple: dense local clusters accelerate complex contagion."
  },

  // ── GRANOVETTER THRESHOLD MODELS ─────────────────────────

  {
    id: "granovetter_threshold_001",
    source: "https://doi.org/10.2307/2778111",
    title: "Granovetter — Threshold Models of Collective Behavior (1978)",
    text: "Individual behavior in collective action depends on the number of others already engaged. Each person has a threshold: the proportion of the group that must act before they will act. Riots, strikes, and social movements follow threshold cascade dynamics. Small changes in threshold distribution can produce radically different collective outcomes."
  },
  {
    id: "granovetter_threshold_002",
    source: "https://doi.org/10.2307/2778111",
    title: "Granovetter — Cascade Dynamics from Threshold Distributions",
    text: "If thresholds are distributed unevenly, a population can have two identical members but one produces a riot and the other produces nothing, depending on threshold distribution of others. Tipping points emerge from threshold cascade dynamics. A small shift in the distribution of thresholds can move a system from stasis to revolution."
  },
  {
    id: "granovetter_weak_ties_001",
    source: "https://doi.org/10.1086/225469",
    title: "Granovetter — Strength of Weak Ties (1973)",
    text: "Weak ties (acquaintances) are more valuable for information spread than strong ties (close friends) because weak ties bridge different social clusters. Information reaches more people through weak ties. Strong ties create redundancy within clusters. Bridge ties across clusters are the primary mechanism of large-scale information diffusion in social networks."
  },

  // ── SOCIAL IDENTITY & GROUP DYNAMICS ─────────────────────

  {
    id: "tajfel_soc_identity_001",
    source: "https://doi.org/10.1016/S0065-2601(08)60357-1",
    title: "Tajfel & Turner — Social Identity Theory (1979)",
    text: "People derive self-esteem from group membership. Ingroup favoritism and outgroup derogation emerge spontaneously from minimal group conditions. Social categorization drives intergroup behavior more than personal relationships. Threatened social identity increases ingroup cohesion and outgroup hostility. Identity-based narratives spread rapidly within ingroups."
  },
  {
    id: "festinger_dissonance_001",
    source: "https://psycnet.apa.org/record/1958-00148-000",
    title: "Festinger — Cognitive Dissonance Theory (1957)",
    text: "Inconsistency between beliefs or between beliefs and actions creates psychological discomfort. People reduce dissonance by changing beliefs, changing behavior, or rationalizing inconsistency. Post-decision dissonance: after committing to a choice, people increase evaluation of chosen option. Dissonance reduction makes people resistant to counter-narratives after initial adoption."
  },
  {
    id: "milgram_authority_001",
    source: "https://doi.org/10.1037/h0040525",
    title: "Milgram — Obedience to Authority (1963)",
    text: "65% of participants obeyed authority commands contrary to their own moral judgment. Proximity to authority figure increases obedience. Proximity to victim decreases obedience. Presence of other resistors dramatically reduces obedience. Legitimacy of authority context matters. Incremental escalation (foot-in-the-door) increases compliance beyond what direct requests would achieve."
  },
  {
    id: "moscovici_minority_001",
    source: "https://doi.org/10.1037/h0032552",
    title: "Moscovici — Minority Influence (1969)",
    text: "Consistent, confident minorities can influence majority opinion even without numerical power. Minority influence is slower but more deeply processed than majority influence. Conversion effect: minority influence often changes private beliefs without public compliance. Consistent minority advocacy seeds doubt that later produces silent majority opinion shift."
  },

  // ── FINANCIAL CRISIS PSYCHOLOGY ──────────────────────────

  {
    id: "kindleberger_manias_001",
    source: "https://en.wikipedia.org/wiki/Manias,_Panics,_and_Crashes",
    title: "Kindleberger — Manias, Panics and Crashes (1978)",
    text: "Financial crises follow a recurring pattern: displacement (new opportunity), boom, overtrading, revulsion, discredit, and panic. Minsky moment: the point where speculative investment collapses causing a rapid drop in asset values. Contagion spreads across markets through financial linkages and psychological spillover. Lender of last resort can stabilize but creates moral hazard."
  },
  {
    id: "minsky_instability_001",
    source: "https://doi.org/10.1093/0198287593.001.0001",
    title: "Minsky — Financial Instability Hypothesis",
    text: "Stability breeds instability. During stable periods, risk appetite increases, leverage rises, and speculative positions accumulate. Three financing types: hedge (income covers debt), speculative (income covers interest only), Ponzi (income insufficient). Economy naturally moves toward Ponzi financing during booms. Sudden recognition of insolvency produces cascade defaults."
  },
  {
    id: "shiller_narrative_001",
    source: "https://doi.org/10.1257/aer.109.4.967",
    title: "Shiller — Narrative Economics (AER 2019)",
    text: "Economic narratives go viral and affect economic behavior on a large scale. Narratives about recessions can cause recessions. Stories about stock market crashes increase selling. Economic narratives spread like epidemics. The 1920s prosperity narrative, the Great Depression poverty narrative, the 1990s tech narrative each drove corresponding economic behavior. Contagious stories are economic forces."
  },
  {
    id: "akerlof_animal_spirits_001",
    source: "https://doi.org/10.1515/9781400834723",
    title: "Akerlof & Shiller — Animal Spirits (2009)",
    text: "Five animal spirits drive economic behavior: confidence (and its multiplier effect), fairness (wages and prices held stable for fairness even when economically suboptimal), corruption and antisocial behavior (corrodes trust), money illusion (confusion of nominal and real), and stories (narratives driving economic decision-making). Recessions are partly confidence crises, not just resource allocation failures."
  },

  // ── POLARIZATION & ECHO CHAMBERS ─────────────────────────

  {
    id: "sunstein_echo_001",
    source: "https://doi.org/10.1515/9780691196770",
    title: "Sunstein — #Republic: Divided Democracy in the Age of Social Media",
    text: "Echo chambers form when people self-select into ideologically homogeneous information environments. Exposure to like-minded others intensifies existing views through group polarization. Deliberation within homogeneous groups produces more extreme positions than individual prior views. Cross-cutting exposure reduces polarization. Algorithmic curation accelerates echo chamber formation."
  },
  {
    id: "pariser_filter_001",
    source: "https://en.wikipedia.org/wiki/The_Filter_Bubble",
    title: "Pariser — The Filter Bubble (2011)",
    text: "Algorithmic personalization creates invisible filter bubbles where individuals receive only information consistent with prior beliefs. Users are unaware of what is being filtered out. Filter bubbles reinforce existing beliefs, suppress counter-narratives, and accelerate polarization. Different people seeing different versions of reality cannot agree on basic facts."
  },
  {
    id: "bail_social_media_001",
    source: "https://doi.org/10.1073/pnas.1804840115",
    title: "Bail et al — Exposure to Opposing Views Increases Political Polarization (PNAS 2018)",
    text: "Republican Twitter users who followed a liberal bot became significantly more conservative. Democratic users became slightly more liberal. Counter-intuitively, exposure to opposing views can increase polarization rather than reduce it, especially for those with strong prior identities. Backlash effect: threatening identity triggers defensive strengthening of existing beliefs."
  },
  {
    id: "vosoughi_fake_news_001",
    source: "https://doi.org/10.1126/science.aap9559",
    title: "Vosoughi, Roy & Aral — Spread of True and False News Online (Science 2018)",
    text: "False news spreads faster, farther, deeper, and more broadly than true news on Twitter. Novelty and emotional arousal explain false news spread advantage. False news is more novel than true news. Humans spread false news more than bots. Fear, disgust, and surprise predict false news spread. Positive emotions predict true news spread."
  },

  // ── CONTAGION & EMOTIONAL SPREAD ─────────────────────────

  {
    id: "hatfield_emotional_001",
    source: "https://doi.org/10.1017/S0140525X9800011X",
    title: "Hatfield et al — Emotional Contagion (1993)",
    text: "Emotions spread automatically through unconscious mimicry and afferent feedback. People synchronize facial expressions, vocalizations, postures with interaction partners. Synchrony produces emotional convergence. Negative emotions (fear, anger) are more contagious than positive. Leaders disproportionately infect group emotional states. Mass media enables large-scale emotional contagion without physical proximity."
  },
  {
    id: "kramer_facebook_001",
    source: "https://doi.org/10.1073/pnas.1320040111",
    title: "Kramer et al — Emotional Contagion via Facebook (PNAS 2014)",
    text: "Emotional states transfer to others through emotional contagion, leading people to experience the same emotions without awareness. Exposure to more positive emotional content produces more positive posts. Exposure to negative content produces more negative posts. Online social networks enable mass-scale emotional contagion without face-to-face interaction."
  },
  {
    id: "fowler_happiness_001",
    source: "https://doi.org/10.1136/bmj.a2338",
    title: "Fowler & Christakis — Dynamic Spread of Happiness (BMJ 2008)",
    text: "Happiness spreads through social networks up to three degrees of separation. Happy friends, friends of friends, and friends of friends of friends increase probability of being happy. Emotional states cluster in networks and spread over time. Geographic proximity amplifies spread. Network centrality affects both susceptibility and spreading potential."
  },

  // ── POLITICAL PSYCHOLOGY ─────────────────────────────────

  {
    id: "haidt_moral_001",
    source: "https://doi.org/10.1037/a0022301",
    title: "Haidt — The Righteous Mind: Moral Foundations Theory",
    text: "Six moral foundations: care/harm, fairness/cheating, loyalty/betrayal, authority/subversion, sanctity/degradation, liberty/oppression. Liberals weight care and fairness. Conservatives weight all six equally. Narratives that trigger moral foundations spread faster within aligned groups. Cross-foundation messaging fails. Moral outrage is the most virally potent emotion."
  },
  {
    id: "lakoff_framing_001",
    source: "https://doi.org/10.1177/1750481310382252",
    title: "Lakoff — Don't Think of an Elephant: Framing and Political Thought",
    text: "Frames are mental structures that shape how we see the world. Language activates frames. Negating a frame activates it. Strict father vs nurturant parent frames organize conservative and liberal worldviews respectively. Facts don't change minds when they conflict with existing frames. Reframing requires activating alternative neural pathways through repetition."
  },
  {
    id: "altemeyer_authoritarian_001",
    source: "https://home.cc.umanitoba.ca/~altemey/",
    title: "Altemeyer — Right-Wing Authoritarianism and Narrative Susceptibility",
    text: "High RWA individuals show: deference to authority, aggression toward outgroups sanctioned by authority, and adherence to social conventions. High RWA populations show greater susceptibility to authority-endorsed narratives, lower critical evaluation of ingroup sources, and higher rejection of outgroup-associated narratives regardless of content quality."
  },

  // ── PROPAGANDA & PERSUASION ───────────────────────────────

  {
    id: "bernays_propaganda_001",
    source: "https://archive.org/details/bernays-propaganda",
    title: "Bernays — Propaganda (1928)",
    text: "The conscious and intelligent manipulation of organized habits and opinions of the masses is an important element in democratic society. Those who manipulate this unseen mechanism constitute an invisible government which is the true ruling power. Invisible wire pulling controls public opinion. Mass psychology enables engineering consent. Narrative must connect to existing desires and symbols."
  },
  {
    id: "lasswell_propaganda_001",
    source: "https://archive.org/details/propagandatechni00lass",
    title: "Lasswell — Propaganda Technique in the World War (1927)",
    text: "Propaganda management of collective attitudes by manipulation of significant symbols. Four objectives: mobilize hatred against the enemy, preserve friendship of allies, preserve friendship and neutrality of third parties, demoralize the enemy. Atrocity stories spread fastest. Simplification and repetition are core techniques. Credible sources amplify spread dramatically."
  },
  {
    id: "ellul_propaganda_001",
    source: "https://en.wikipedia.org/wiki/Propaganda_(book)",
    title: "Ellul — Propaganda: The Formation of Men's Attitudes (1962)",
    text: "Modern propaganda is total and continuous, not episodic. It works with the grain of existing beliefs rather than against them. Effective propaganda exploits pre-existing prejudices rather than creating new ones. The educated are more susceptible because they consume more media. Propaganda creates false sense of participation while producing conformity. Sociological propaganda shapes environment; agitation propaganda triggers action."
  },

  // ── SOCIAL MOVEMENT THEORY ────────────────────────────────

  {
    id: "gladwell_tipping_001",
    source: "https://en.wikipedia.org/wiki/The_Tipping_Point",
    title: "Gladwell — The Tipping Point (2000)",
    text: "Social epidemics tip at the moment they reach a critical mass of adoption. Three rules: the law of the few (connectors, mavens, and salesmen drive spread), the stickiness factor (message must be memorable and actionable), and the power of context (environment shapes behavior more than character). Small changes in context can tip epidemics."
  },
  {
    id: "tarrow_power_001",
    source: "https://doi.org/10.1017/CBO9780511791000",
    title: "Tarrow — Power in Movement: Social Movements and Contentious Politics",
    text: "Social movements emerge when political opportunity structures open. Collective action frames are constructed to assign blame, propose solutions, and motivate action. Framing resonance depends on: narrative fidelity (consistent with cultural heritage), experiential commensurability (resonates with daily experience), and empirical credibility. Movements cycle through emergence, coalescence, bureaucratization, and decline."
  },
  {
    id: "benford_framing_001",
    source: "https://doi.org/10.1146/annurev.so.26.080100.001435",
    title: "Benford & Snow — Framing Processes and Social Movements (2000)",
    text: "Social movement organizations construct collective action frames through diagnostic framing (problem identification), prognostic framing (solution attribution), and motivational framing (call to action). Frame amplification, extension, transformation, and bridging are core framing tasks. Counter-framing competition determines which diagnosis-solution pairs achieve dominance."
  },

  // ── DIGITAL AGE SOCIAL DYNAMICS ──────────────────────────

  {
    id: "centola_spread_001",
    source: "https://doi.org/10.1126/science.1185231",
    title: "Centola — Spread of Behavior in Online Social Network (Science 2010)",
    text: "Complex behaviors spread more effectively through clustered networks than random networks, opposite to simple information. Behaviors requiring social reinforcement (exercise, health behaviors) benefit from network clustering. Simple information follows weak tie advantage. Social reinforcement changes optimal network structure for behavior change campaigns."
  },
  {
    id: "watts_twitter_001",
    source: "https://doi.org/10.1073/pnas.1400842111",
    title: "Goel, Watts & Goldstein — Structure of Online Diffusion Networks (2016)",
    text: "Most viral content achieves wide reach through broadcast from single influential nodes, not through chains of person-to-person transmission. True viral cascades (each person infects multiple others) are rare. One-step spread from hubs is the dominant diffusion mechanism online. Influencer marketing is more efficient than seeding ordinary users."
  },
  {
    id: "bakshy_exposure_001",
    source: "https://doi.org/10.1126/science.aaa1160",
    title: "Bakshy et al — Exposure to Ideologically Diverse News on Facebook (Science 2015)",
    text: "Social networks limit exposure to cross-cutting content. Individual choice reduces cross-cutting exposure more than algorithmic ranking. But algorithmic ranking does reduce cross-cutting exposure relative to unfiltered feed. Both individual agency and algorithms contribute to ideological segregation. Hard news cross-cutting exposure is lower than soft news."
  },
  {
    id: "pennycook_lazy_001",
    source: "https://doi.org/10.1037/xge0000465",
    title: "Pennycook & Rand — Lazy Not Biased: Susceptibility to Partisan Fake News",
    text: "Susceptibility to fake news is better explained by lazy thinking than partisan bias. Analytic thinkers are less likely to believe fake news regardless of political alignment. Intuitive thinkers accept headlines that match their prior beliefs without scrutiny. Belief accuracy incentives reduce fake news sharing. Attentional prompts increase accuracy discernment."
  },

  // ── CULTURAL PSYCHOLOGY ───────────────────────────────────

  {
    id: "hofstede_dimensions_001",
    source: "https://doi.org/10.1016/j.ibusrev.2010.03.003",
    title: "Hofstede — Cultural Dimensions Theory",
    text: "Six cultural dimensions predict behavior across nations: power distance (acceptance of hierarchy), individualism vs collectivism, uncertainty avoidance, masculinity vs femininity, long vs short term orientation, indulgence vs restraint. High collectivism: group consensus precedes individual adoption. High uncertainty avoidance: resistance to novel narratives. High power distance: authority endorsement critical for adoption."
  },
  {
    id: "hofstede_dimensions_002",
    source: "https://doi.org/10.1016/j.ibusrev.2010.03.003",
    title: "Hofstede — Collectivism and Narrative Adoption Patterns",
    text: "In collectivist cultures (China, Japan, Arab world, Latin America, sub-Saharan Africa), narrative adoption follows community consensus dynamics. Outlier adoption is suppressed until group threshold is reached, then rapid convergence follows. In individualist cultures (US, UK, Australia, Netherlands), early adopter curves are smoother and cascades develop more gradually."
  },
  {
    id: "triandis_individualism_001",
    source: "https://doi.org/10.1037/0033-295X.96.3.506",
    title: "Triandis — The Self and Social Behavior in Cultural Contexts (1989)",
    text: "Allocentric (collectivist) individuals subordinate personal goals to ingroup goals and define self relative to group. Idiocentric (individualist) individuals prioritize personal goals and define self independently. Allocentric individuals are more susceptible to in-group social proof and less susceptible to out-group narratives. Idiocentric individuals respond more to personal benefit framing."
  },
  {
    id: "inglehart_values_001",
    source: "https://doi.org/10.1017/CBO9780511589140",
    title: "Inglehart — World Values Survey — Cultural Evolution",
    text: "Post-materialist values emerge with economic security. Survival values (security focus) versus self-expression values (freedom focus) predict narrative receptivity. Traditional vs secular-rational values predict authority narrative adoption. Economic anxiety reverses post-materialist trends, increasing survival value orientation and receptivity to nationalist and security narratives."
  },

  // ── RECENT SOCIAL RESEARCH ───────────────────────────────

  {
    id: "brady_moral_contagion_001",
    source: "https://doi.org/10.1073/pnas.1618923114",
    title: "Brady et al — Emotion Shapes Diffusion of Moralized Content on Social Media (PNAS 2017)",
    text: "Moral-emotional language increases message diffusion within political networks. Each moral-emotional word increases retweet probability by 20%. Effect is network-specific: moral-emotional content spreads within ideological communities but not across them. Moral outrage is the most contagious political emotion. Moral framing amplifies existing emotional reactions."
  },
  {
    id: "acerbi_cultural_001",
    source: "https://doi.org/10.1371/journal.pone.0073700",
    title: "Acerbi et al — The Logic of Fashion Cycles (2012)",
    text: "Fashion cycles emerge from conformist and anticonformist transmission biases interacting. Conformist bias: adopt what majority does. Anticonformist bias: avoid what majority does. Interaction produces oscillations. Prestige bias (copy high-status individuals) accelerates initial adoption. Success bias (copy successful individuals) produces slower but more stable adoption."
  },
  {
    id: "guess_misinformation_001",
    source: "https://doi.org/10.1126/sciadv.aau4586",
    title: "Guess, Nagler & Tucker — Less than 1% Share Fake News (Science Advances 2019)",
    text: "Only 0.1% of adults accounted for 80% of fake news source visits. Fake news consumption concentrated in older, conservative-leaning users. Most social media users never encounter or share fake news. Super-spreaders of misinformation are a tiny minority with outsized influence. Platform interventions targeting high-sharing individuals could have large aggregate effects."
  },
  {
    id: "pennycook_crowdwisdom_001",
    source: "https://doi.org/10.1038/s41562-022-01352-y",
    title: "Pennycook et al — Shifting Attention Increases Accuracy of News Discernment (Nature Human Behaviour 2022)",
    text: "Simply asking people to assess the accuracy of one headline before seeing their news feed significantly reduces subsequent sharing of misinformation. Nudges to consider accuracy can have large aggregate effects with minimal cost. Social media platforms that prompt accuracy consideration could substantially reduce misinformation spread without censorship."
  },

  // ── ECONOMIC CRISIS BEHAVIOR ─────────────────────────────

  {
    id: "reinhart_crisis_001",
    source: "https://en.wikipedia.org/wiki/This_Time_Is_Different",
    title: "Reinhart & Rogoff — This Time Is Different: Eight Centuries of Financial Folly",
    text: "Financial crises follow remarkably similar patterns across centuries and countries. Overconfidence and willful amnesia cause each generation to believe their situation is unique. Debt build-up precedes every crisis. Complacency grows with stability. Sudden loss of confidence triggers rapid deleveraging. Recovery is always slower than markets anticipate."
  },
  {
    id: "shleifer_inefficient_001",
    source: "https://doi.org/10.1515/9781400829125",
    title: "Shleifer — Inefficient Markets: An Introduction to Behavioral Finance",
    text: "Limits to arbitrage prevent rational actors from correcting mispricings. Noise traders with correlated beliefs can push prices far from fundamentals. Sentiment-driven investors create systematic pricing errors. Professional investors face career risk from contrarian positions. Markets can stay irrational longer than rational investors can stay solvent."
  },

  // ── TRUST & INSTITUTIONAL LEGITIMACY ─────────────────────

  {
    id: "putnam_bowling_001",
    source: "https://en.wikipedia.org/wiki/Bowling_Alone",
    title: "Putnam — Bowling Alone: Collapse of American Community",
    text: "Social capital (trust, norms, networks) enables collective action and information sharing. Bridging social capital connects diverse groups. Bonding social capital strengthens ingroup ties. Declining civic participation erodes bridging capital while bonding capital persists, accelerating polarization. Low social capital environments show higher susceptibility to fear and conspiracy narratives."
  },
  {
    id: "fukuyama_trust_001",
    source: "https://en.wikipedia.org/wiki/Trust_(Fukuyama_book)",
    title: "Fukuyama — Trust: Social Virtues and the Creation of Prosperity",
    text: "High-trust societies (Germany, Japan, US, Denmark) have lower transaction costs and can form large voluntary organizations. Low-trust societies rely on family networks or state enforcement. Trust is a cultural variable that changes slowly. Institutional betrayal rapidly destroys trust that took decades to build. Narrative credibility depends critically on source trust levels."
  },
  {
    id: "edelman_trust_001",
    source: "https://www.edelman.com/trust/2024/trust-barometer",
    title: "Edelman Trust Barometer 2024 — Global Trust Trends",
    text: "Global trust in institutions remains at historically low levels. Business is the most trusted institution globally, ahead of government and media. NGOs have lost trust significantly. Peer trust (someone like me) has risen relative to expert trust. Economic anxiety is the primary driver of institutional distrust. Polarized societies show the largest trust gaps."
  },

];

// ============================================================
// EXPORT for use in CorpusSeeder component
// ============================================================

export default CORPUS_DOCS;

export const CORPUS_BY_CATEGORY = {
  "Foundational Mass Psychology": CORPUS_DOCS.filter(d =>
    ["lebon","tarde","freud"].some(k => d.id.startsWith(k))),
  "Behavioral Economics": CORPUS_DOCS.filter(d =>
    ["kahneman","thaler","cialdini","ariely"].some(k => d.id.startsWith(k))),
  "Information Cascades & Networks": CORPUS_DOCS.filter(d =>
    ["bikhchandani","surowiecki","watts","barabasi","goffman","dodds"].some(k => d.id.startsWith(k))),
  "Threshold & Contagion Models": CORPUS_DOCS.filter(d =>
    ["granovetter","kermack","centola"].some(k => d.id.startsWith(k))),
  "Emotional & Social Contagion": CORPUS_DOCS.filter(d =>
    ["hatfield","kramer","fowler","brady"].some(k => d.id.startsWith(k))),
  "Financial Crisis Psychology": CORPUS_DOCS.filter(d =>
    ["kindleberger","minsky","shiller","akerlof","reinhart","shleifer"].some(k => d.id.startsWith(k))),
  "Political & Group Psychology": CORPUS_DOCS.filter(d =>
    ["tajfel","festinger","milgram","moscovici","haidt","lakoff","altemeyer"].some(k => d.id.startsWith(k))),
  "Propaganda & Persuasion": CORPUS_DOCS.filter(d =>
    ["bernays","lasswell","ellul"].some(k => d.id.startsWith(k))),
  "Social Movements": CORPUS_DOCS.filter(d =>
    ["gladwell","tarrow","benford"].some(k => d.id.startsWith(k))),
  "Digital Age Dynamics": CORPUS_DOCS.filter(d =>
    ["vosoughi","bakshy","pennycook","guess","bail","pariser","sunstein","acerbi"].some(k => d.id.startsWith(k))),
  "Cultural Psychology": CORPUS_DOCS.filter(d =>
    ["hofstede","triandis","inglehart"].some(k => d.id.startsWith(k))),
  "Trust & Institutions": CORPUS_DOCS.filter(d =>
    ["putnam","fukuyama","edelman"].some(k => d.id.startsWith(k))),
};

export const TOTAL_DOCS = CORPUS_DOCS.length;
