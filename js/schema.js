/* =========================================================
   DEEPSEA TRAWL FISHING LOG — FREEZER  (Form: OM/EN/2024)
   Faithful transcription of the paper logbook structure.
   ========================================================= */

const FORM_META = {
  formCode: "OM/EN/2024",
  title: "DEEPSEA TRAWL FISHING LOG",
  subtitle: "FREEZER",
  department: "Forestry, Fisheries and the Environment",
  country: "REPUBLIC OF SOUTH AFRICA",
  branch: "Fisheries",
  address: [
    "Foretrust Building",
    "Martin Hammerschlag Way",
    "Foreshore, Cape Town 8001",
    "Private Bag X2, Vlaeberg, 8018",
    "Facsimile: 021 402 3694",
  ],
};

/* ---------- Header Information per Activity Period ---------- */

const MAX_PERIODS = 7;

// Row definitions: [key, group, label, inputType]
const HEADER_ROWS = [
  { key: "activityCode",  group: null,       label: "Activity Code",            type: "text" },
  { key: "primarySpecies",group: null,       label: "Primary Retained Species", type: "text" },
  { key: "secondarySpecies", group: null,    label: "Secondary Retain. Species",type: "text" },
  { key: "startDate",     group: "Start",    label: "Date",      type: "date" },
  { key: "startTime",     group: "Start",    label: "Time",      type: "time" },
  { key: "startLat",      group: "Start",    label: "Latitude",  type: "text" },
  { key: "startLon",      group: "Start",    label: "Longitude", type: "text" },
  { key: "endDate",       group: "End",      label: "Date",      type: "date" },
  { key: "endTime",       group: "End",      label: "Time",      type: "time" },
  { key: "endLat",        group: "End",      label: "Latitude",  type: "text" },
  { key: "endLon",        group: "End",      label: "Longitude", type: "text" },
  { key: "gridBlock",     group: null,       label: "Grid Block",     type: "text" },
  { key: "courseTrue",    group: "Course",   label: "True",      type: "text" },
  { key: "courseMagnetic",group: "Course",   label: "Magnetic",  type: "text" },
  { key: "depthFishing",  group: "Depth(m)", label: "Fishing",   type: "number" },
  { key: "depthBottom",   group: "Depth(m)", label: "Bottom",    type: "number" },
  { key: "tempSurface",   group: "Temp(C°)", label: "Surface",   type: "number" },
  { key: "tempFishing",   group: "Temp(C°)", label: "Fishing",   type: "number" },
  { key: "windDirection", group: "Wind",     label: "Direction", type: "number" },
  { key: "windForce",     group: "Wind",     label: "Force",     type: "number" },
  { key: "gearCode",      group: null,       label: "Gear Code (075, 085, 110)", type: "text" },
  { key: "meshSize",      group: null,       label: "Mesh Size (Codend)",        type: "text" },
  { key: "towingSpeed",   group: null,       label: "Towing Speed (knots)",      type: "text" },
  { key: "distanceTowed", group: null,       label: "Distance Towed(nm)",        type: "text" },
  { key: "rpm",           group: null,       label: "R.P.M.",    type: "text" },
  { key: "pitch",         group: null,       label: "Pitch",     type: "text" },
  { key: "catchVolume",   group: "Catch",    label: "Volume (kg)",     type: "number" },
  { key: "catchProduction",group: "Catch",   label: "Production (kg)", type: "number" },
  { key: "birdScaringLines", group: null,    label: "Bird Scaring Lines", type: "text", emph: true },
  { key: "birdMortality", group: null,       label: "Bird Mortality",     type: "text", emph: true },
];

// Legend tables shown under the header grid (verbatim from the form)
const ACTIVITY_CODES = [
  ["1", "Bottom Trawling"], ["2", "Midwater Trawling"], ["3", "Steaming"],
  ["4", "Drifting (at night)"], ["5", "Dodgeing"], ["6", "Breakdown"],
  ["7", "In Port"], ["8", "Twin Bottom Trawl"], ["9", ""], ["10", ""],
];
const RETAINED_SPECIES_CODES = [
  ["1", "Hake"], ["2", "Maasbanker"], ["5", "Ecsole"], ["9", "Monk"],
  ["10", "Kingklip"], ["11", "Ribbonfish"], ["12", "Panga"], ["13", "Redeye"],
  ["14", ""], ["15", ""],
];
const BIRD_SCARING_CODES = [
  ["1", "Line deployed"], ["2", "Line not available"], ["3", "Line lost"],
  ["4", "Not deployed due to weather"],
];
const BIRD_MORTALITY_CODES = [
  ["A", "None"], ["B", "Shy Albatross"], ["C", "Black-browed Albatross"],
  ["D", "Yellow-nosed Albatross"], ["E", "Giant Petrel"],
  ["F", "White-chinned Petrel"], ["G", "Cape Gannet"], ["H", "Other"],
];

const DECLARATION_TEXT =
  "I hereby declare that, to the best of my knowledge, the information and data " +
  "submitted in this catch declaration sheet for hake trawl are true, correct and " +
  "complete in all respects.";

/* ---------- Estimated Catch per Day — Freezer ---------- */
/* Every entry row of the catch sheet, in paper order.
   kind: "entry" = mass input row, "total" = auto-computed row,
         "sub" = section sub-header band (Linefish / Deepsea / Sharks)
   sums: for totals — list of row keys to add up.                     */

const CATCH_LEFT = [
  // --- HAKE : Headed & Gutted ---
  { key:"hake_hg_xl", kind:"entry", species:"Hake", section:"Headed & Gutted", label:"XL", detail:"2400+",      code:"7&X&F" },
  { key:"hake_hg_l",  kind:"entry", species:"Hake", section:"Headed & Gutted", label:"L",  detail:"1500 – 2400",code:"5&E" },
  { key:"hake_hg_m",  kind:"entry", species:"Hake", section:"Headed & Gutted", label:"M",  detail:"800 – 1500", code:"4&D" },
  { key:"hake_hg_p",  kind:"entry", species:"Hake", section:"Headed & Gutted", label:"P",  detail:"500 – 800",  code:"3" },
  { key:"hake_hg_s",  kind:"entry", species:"Hake", section:"Headed & Gutted", label:"S",  detail:"350 – 500",  code:"2" },
  { key:"hake_hg_c",  kind:"entry", species:"Hake", section:"Headed & Gutted", label:"C",  detail:"250 – 350",  code:"1" },
  { key:"hake_hg_6",  kind:"entry", species:"Hake", section:"Headed & Gutted", label:"6",  detail:"150 - 250",  code:"6" },
  { key:"hake_hg_0",  kind:"entry", species:"Hake", section:"Headed & Gutted", label:"0",  detail:"80-150",     code:"0" },
  { key:"hake_hg_broken", kind:"entry", species:"Hake", section:"Headed & Gutted", label:"Broken / Ungraded", detail:"", code:"" },
  { key:"hake_hg_total",  kind:"total", species:"Hake", label:"Headed & Gutted Total",
    sums:["hake_hg_xl","hake_hg_l","hake_hg_m","hake_hg_p","hake_hg_s","hake_hg_c","hake_hg_6","hake_hg_0","hake_hg_broken"] },

  // --- HAKE : Deep Skinned Fillets ---
  { key:"hake_dsf_24pbo",  kind:"entry", species:"Hake", section:"Deep Skinned Fillets", label:"3-4", detail:"DPLS 2-4 oz PBO", code:"Catering" },
  { key:"hake_dsf_46pbo",  kind:"entry", species:"Hake", section:"Deep Skinned Fillets", label:"4-6", detail:"DPLS 4-6 oz PBO", code:"Catering" },
  { key:"hake_dsf_69pbo",  kind:"entry", species:"Hake", section:"Deep Skinned Fillets", label:"",    detail:"DPLS 6-9 oz PBO", code:"Catering" },
  { key:"hake_dsf_9pbo",   kind:"entry", species:"Hake", section:"Deep Skinned Fillets", label:"",    detail:"DPLS 9+ oz PBO",  code:"Catering" },
  { key:"hake_dsf_254",    kind:"entry", species:"Hake", section:"Deep Skinned Fillets", label:"8+",  detail:"DPLS 2.5-4 oz",   code:"C Haddie" },
  { key:"hake_dsf_46",     kind:"entry", species:"Hake", section:"Deep Skinned Fillets", label:"",    detail:"DPLS 4-6 oz",     code:"C Haddie" },
  { key:"hake_dsf_68",     kind:"entry", species:"Hake", section:"Deep Skinned Fillets", label:"",    detail:"DPLS 6-8 oz",     code:"C Haddie" },
  { key:"hake_dsf_814",    kind:"entry", species:"Hake", section:"Deep Skinned Fillets", label:"",    detail:"DPLS 8-14 oz",    code:"C Haddie" },
  { key:"hake_dsf_14",     kind:"entry", species:"Hake", section:"Deep Skinned Fillets", label:"",    detail:"DPLS 14+ oz",     code:"C Haddie" },
  { key:"hake_dsf_ungraded", kind:"entry", species:"Hake", section:"Deep Skinned Fillets", label:"", detail:"Ungraded", code:"" },
  { key:"hake_dsf_loose",  kind:"entry", species:"Hake", section:"Deep Skinned Fillets", label:"",    detail:"Loose Fillets",   code:"PBO" },
  { key:"hake_dsf_total",  kind:"total", species:"Hake", label:"Deep Skinned Fillets Total",
    sums:["hake_dsf_24pbo","hake_dsf_46pbo","hake_dsf_69pbo","hake_dsf_9pbo","hake_dsf_254","hake_dsf_46","hake_dsf_68","hake_dsf_814","hake_dsf_14","hake_dsf_ungraded","hake_dsf_loose"] },

  // --- HAKE : Mince ---
  { key:"hake_mince_dpls", kind:"entry", species:"Hake", section:"Mince", label:"Mince", detail:"DPLS Mince",   code:"", shaded:true },
  { key:"hake_mince_uw",   kind:"entry", species:"Hake", section:"Mince", label:"",      detail:"U/w Mince PBO",code:"", shaded:true },

  // --- HAKE : Skinless (Shallow) Fillets ---
  { key:"hake_ssf_lt1",   kind:"entry", species:"Hake", section:"Skinless (Shallow) Fillets", label:"2-4", detail:"<1 oz S/S PBI",  code:"" },
  { key:"hake_ssf_12",    kind:"entry", species:"Hake", section:"Skinless (Shallow) Fillets", label:"",    detail:"1-2 oz S/S PBI", code:"" },
  { key:"hake_ssf_24",    kind:"entry", species:"Hake", section:"Skinless (Shallow) Fillets", label:"",    detail:"2-4 oz S/S PBI", code:"" },
  { key:"hake_ssf_46",    kind:"entry", species:"Hake", section:"Skinless (Shallow) Fillets", label:"4-6", detail:"Hake 4-6 oz S/S PBI", code:"" },
  { key:"hake_ssf_69",    kind:"entry", species:"Hake", section:"Skinless (Shallow) Fillets", label:"6-8", detail:"Hake 6-9 oz S/S PBI", code:"" },
  { key:"hake_ssf_12c",   kind:"entry", species:"Hake", section:"Skinless (Shallow) Fillets", label:"8+",  detail:"1-2 oz S/S PBI", code:"Catering" },
  { key:"hake_ssf_24c",   kind:"entry", species:"Hake", section:"Skinless (Shallow) Fillets", label:"",    detail:"2-4 oz S/S PBI", code:"Catering" },
  { key:"hake_ssf_46c",   kind:"entry", species:"Hake", section:"Skinless (Shallow) Fillets", label:"",    detail:"4-6 oz S/S PBI", code:"Catering" },
  { key:"hake_ssf_69c",   kind:"entry", species:"Hake", section:"Skinless (Shallow) Fillets", label:"",    detail:"6-9 oz S/S PBI", code:"Catering" },
  { key:"hake_ssf_loose", kind:"entry", species:"Hake", section:"Skinless (Shallow) Fillets", label:"Ung", detail:"Loose Fillets",  code:"PBI" },
  { key:"hake_ssf_block", kind:"entry", species:"Hake", section:"Skinless (Shallow) Fillets", label:"",    detail:"Hake Fillet Block", code:"" },
  { key:"hake_ssf_total", kind:"total", species:"Hake", label:"Shallow Skin Fillets Total",
    sums:["hake_ssf_lt1","hake_ssf_12","hake_ssf_24","hake_ssf_46","hake_ssf_69","hake_ssf_12c","hake_ssf_24c","hake_ssf_46c","hake_ssf_69c","hake_ssf_loose","hake_ssf_block"] },

  // --- HAKE grand totals ---
  { key:"hake_fillets_total", kind:"total", species:"Hake", label:"Total Fillets",
    sums:["hake_dsf_total","hake_mince_dpls","hake_mince_uw","hake_ssf_total"] },
  { key:"hake_total", kind:"total", species:"Hake", label:"Total Hake", grand:true,
    sums:["hake_hg_total","hake_fillets_total"] },

  // --- KINGKLIP ---
  { key:"kingklip_l",   kind:"entry", species:"Kingklip", section:"H&G", label:"Kingklip", detail:"H&G", code:"Large" },
  { key:"kingklip_m",   kind:"entry", species:"Kingklip", section:"H&G", label:"", detail:"", code:"Medium" },
  { key:"kingklip_s",   kind:"entry", species:"Kingklip", section:"H&G", label:"", detail:"", code:"Small" },
  { key:"kingklip_ung", kind:"entry", species:"Kingklip", section:"H&G", label:"", detail:"", code:"Ungraded" },
  { key:"kingklip_total", kind:"total", species:"Kingklip", label:"Total Kingklip",
    sums:["kingklip_l","kingklip_m","kingklip_s","kingklip_ung"] },

  // --- MONK ---
  { key:"monk_tails",  kind:"entry", species:"Monk", section:"", label:"Monk", detail:"Tails", code:"" },
  { key:"monk_hog",    kind:"entry", species:"Monk", section:"", label:"",     detail:"Head-On Gutted", code:"" },

  // --- HORSE MACKEREL ---
  { key:"hm_round_l", kind:"entry", species:"Horse Mackerel", section:"Round", label:"Horse Mackerel", detail:"Round", code:"Large" },
  { key:"hm_round_m", kind:"entry", species:"Horse Mackerel", section:"Round", label:"", detail:"", code:"Medium" },
  { key:"hm_round_s", kind:"entry", species:"Horse Mackerel", section:"Round", label:"", detail:"", code:"Small" },
  { key:"hm_hg_l",    kind:"entry", species:"Horse Mackerel", section:"H&G",   label:"", detail:"H&G", code:"Large" },
  { key:"hm_hg_m",    kind:"entry", species:"Horse Mackerel", section:"H&G",   label:"", detail:"", code:"Medium" },
  { key:"hm_hg_ung",  kind:"entry", species:"Horse Mackerel", section:"H&G",   label:"", detail:"", code:"Ungraded" },
  { key:"hm_total",   kind:"total", species:"Horse Mackerel", label:"Total Horse Mackerel",
    sums:["hm_round_l","hm_round_m","hm_round_s","hm_hg_l","hm_hg_m","hm_hg_ung"] },

  // --- SNOEK ---
  { key:"snoek_ht",     kind:"entry", species:"Snoek", section:"", label:"Snoek", detail:"Headed and Tailed", code:"" },
  { key:"snoek_frozen", kind:"entry", species:"Snoek", section:"", label:"", detail:"Headed", code:"Frozen" },
  { key:"snoek_salted", kind:"entry", species:"Snoek", section:"", label:"", detail:"Headed", code:"Salted" },
  { key:"snoek_total",  kind:"total", species:"Snoek", label:"Total Snoek",
    sums:["snoek_ht","snoek_frozen","snoek_salted"] },
];

const CATCH_RIGHT = [
  { key:"squid_chokka", kind:"entry", species:"Squid", section:"", label:"Squid", detail:"Chokka", code:"Round" },
  { key:"squid_red",    kind:"entry", species:"Squid", section:"", label:"", detail:"Red", code:"Ungraded" },
  { key:"squid_total",  kind:"total", species:"Squid", label:"Total Squid", sums:["squid_chokka","squid_red"] },

  { key:"jacopever_round", kind:"entry", species:"Jacopever", section:"", label:"Jacopever", detail:"Round", code:"" },
  { key:"jacopever_hg",    kind:"entry", species:"Jacopever", section:"", label:"", detail:"H&G", code:"" },

  { key:"johndory_round", kind:"entry", species:"John Dory", section:"", label:"John Dory", detail:"Round", code:"" },
  { key:"johndory_hg",    kind:"entry", species:"John Dory", section:"", label:"", detail:"H&G", code:"" },

  { key:"chubb_round", kind:"entry", species:"Chubb Mackerel", section:"", label:"Chubb Mackerel", detail:"Round", code:"" },
  { key:"chubb_hg",    kind:"entry", species:"Chubb Mackerel", section:"", label:"", detail:"H&G", code:"" },

  { key:"anglefish_round", kind:"entry", species:"Anglefish", section:"", label:"Anglefish", detail:"Round", code:"" },
  { key:"anglefish_hg",    kind:"entry", species:"Anglefish", section:"", label:"", detail:"H&G", code:"" },

  { key:"ribbonfish_round", kind:"entry", species:"Ribbonfish", section:"", label:"Ribbonfish", detail:"Round", code:"" },
  { key:"ribbonfish_ht",    kind:"entry", species:"Ribbonfish", section:"", label:"", detail:"Headed + Tail", code:"" },
  { key:"ribbonfish_hgt",   kind:"entry", species:"Ribbonfish", section:"", label:"", detail:"Headed, Gutted & Tail", code:"" },

  { key:"gurnard_round", kind:"entry", species:"Gurnard", section:"", label:"Gurnard", detail:"Round", code:"" },
  { key:"gurnard_hg",    kind:"entry", species:"Gurnard", section:"", label:"", detail:"H&G", code:"" },

  { key:"sandsole_ung", kind:"entry", species:"Sand Sole", section:"", label:"Sand Sole", detail:"Ungraded", code:"" },

  { key:"panga_l", kind:"entry", species:"Panga", section:"Gutted", label:"Panga", detail:"Gutted", code:"Large" },
  { key:"panga_m", kind:"entry", species:"Panga", section:"Gutted", label:"", detail:"", code:"Medium" },
  { key:"panga_s", kind:"entry", species:"Panga", section:"Gutted", label:"", detail:"", code:"Small" },
  { key:"panga_total", kind:"total", species:"Panga", label:"Total Panga", sums:["panga_l","panga_m","panga_s"] },

  { key:"redmullet_round", kind:"entry", species:"Red Mullet", section:"", label:"Red Mullet", detail:"", code:"Round" },

  { key:"sub_linefish", kind:"sub", label:"Linefish" },
  { key:"silverfish_gutted", kind:"entry", species:"Silverfish", section:"Linefish", label:"Silverfish", detail:"", code:"Gutted" },
  { key:"stumpnose_gutted",  kind:"entry", species:"White Stumpnose", section:"Linefish", label:"White Stumpnose", detail:"", code:"Gutted" },
  { key:"biskop_gutted",     kind:"entry", species:"Biskop (Wreckfish)", section:"Linefish", label:"Biskop (Wreckfish)", detail:"", code:"Gutted" },

  { key:"sub_deepsea", kind:"sub", label:"Deepsea" },
  { key:"alfonsino_round",  kind:"entry", species:"Alfonsino", section:"Deepsea", label:"Alfonsino", detail:"", code:"Round" },
  { key:"orangeroughy_round", kind:"entry", species:"Orange Roughy", section:"Deepsea", label:"Orange Roughy", detail:"", code:"Round" },
  { key:"oreodory_round",   kind:"entry", species:"Oreo Dory", section:"Deepsea", label:"Oreo Dory", detail:"", code:"Round" },

  { key:"sub_sharks", kind:"sub", label:"Sharks" },
  { key:"vaalhaai_cleaned",   kind:"entry", species:"Vaalhaai", section:"Sharks", label:"Vaalhaai", detail:"", code:"Cleaned" },
  { key:"mustelus_cleaned",   kind:"entry", species:"Mustelus", section:"Sharks", label:"Mustelus", detail:"", code:"Cleaned" },
  { key:"shark_unspecified",  kind:"entry", species:"Unspecified Shark", section:"Sharks", label:"Unspecified", detail:"", code:"Cleaned" },

  { key:"skate_wings", kind:"entry", species:"Skate", section:"", label:"Skate", detail:"Wings", code:"" },

  { key:"stjoseph_hg",     kind:"entry", species:"St Joseph", section:"", label:"St Joseph", detail:"H&G", code:"" },
  { key:"stjoseph_fillet", kind:"entry", species:"St Joseph", section:"", label:"", detail:"Fillet", code:"" },

  { key:"octopus_round", kind:"entry", species:"Octopus", section:"", label:"Octopus", detail:"Round", code:"" },

  { key:"byproduct_heads",    kind:"entry", species:"By Product", section:"", label:"By Product", detail:"Heads", code:"" },
  { key:"byproduct_roes",     kind:"entry", species:"By Product", section:"", label:"", detail:"Roes", code:"" },
  { key:"byproduct_fishmeal", kind:"entry", species:"By Product", section:"", label:"", detail:"Fishmeal", code:"" },
];

const OTHERS_ROWS = 8; // "Others (Please specify)" — 8 blank species/category/mass rows

const CATCH_FOOTNOTE =
  "Companies that do not use the given category system for hake should insert " +
  "their own codes for the equivalent category in the space provided.";

/* All entry/total rows in one lookup */
const CATCH_ALL_ROWS = [...CATCH_LEFT, ...CATCH_RIGHT];
const CATCH_ROW_BY_KEY = Object.fromEntries(CATCH_ALL_ROWS.map(r => [r.key, r]));

/* ---------- Instructions / T&C pages (transcribed) ---------- */

const TC_PAGE_1 = {
  title: "FRONT COVER AND TRAWL FISHING LOG SHEET",
  sections: [
    {
      heading: null,
      items: [
        "The name of the <b>Registered Owner</b> of the vessel, name of the Vessel, the <b>Right Application Numbers</b> on whose behalf the vessel is fishing. Full dates and times for sailing, docking and discharge must be entered. <b>Quota year</b> is the year that the catch is to be held against.",
        "Where catch is <b>transferred to another vessel</b>, an additional landing sheet giving details of the transferred catch must be completed. Extra landing sheets can be requested prior to sailing.",
        "The unit of <b>weighing</b> applicable to your vessel <b>must be circled</b> and the unit value entered: e.g. if 50kg bins are used; circle “bins” and enter 50 in the space provided. This applies to both Retained and Discarded fish catches. If different units are used for different products, indicate which unit is applicable to which product.",
        "<b>Permit number</b> should be inserted (compulsory).",
      ],
    },
    {
      heading: "HEADER INFORMATION AND CATCH SHEETS",
      items: [
        "<b>A page should be used for each day</b> and the information inserted in the blocks provided; using a column per drag.",
        "<b>Activity Codes</b> are explained on the “Header Information” sheet.",
        "<b>Primary and Secondary Target Species Codes</b> must be indicated for each drag. Refer to next page.",
        "All times must be given using the <b>24-hour system</b> (not am and pm) e.g. 12:00 or 15:30. <b>Start and end times of drags are BLOCK-UP and KNOCK-OUT</b> respectively (i.e. the time that the net was on the bottom).",
        "The start and end <b>latitude and longitude</b> of the drag must be reported to the highest decimal place possible (e.g. DD° MM.SSS') and report the <b>grid number</b> (refer to the demersal grid map) corresponding to the start position.",
        "<b>Depths must be recorded in meters.</b>",
        "Temperature to be recorded in <b>degrees Celsius</b>.",
        "<b>Wind Direction</b> given in <b>compass degrees (1-360)</b> and <b>Wind Force</b> from the <b>Beaufort scale</b> (0-12).",
        "<b>Gear Code:</b> report the permitted minimum mesh size of the cod-end as per permit conditions (e.g. 75, 90 or 110mm).",
        "<b>Mesh Size (cod-end):</b> report the actual mesh size used in the cod end (e.g. 80mm when 75mm is required).",
        "<b>Towing Speed</b> is in <b>knots</b> and <b>Distance Towed</b> in <b>nautical miles</b>.",
        "<b>Catch Volume</b> is the estimated <b>total nominal (green) weight</b> of all species combined, including discards and; <b>Catch Production</b> is the estimated total <b>processed weight retained</b> from the catch.",
        "<b>Bird scaring line:</b> Specify whether or not bird scaring lines were deployed, or reasons for non-deployment (see codes).",
        "<b>Bird mortality:</b> Use the codes given to record number of dead birds per species brought aboard. (eg.: B1 = one Shy Albatross killed)",
        "<b>Other Fish:</b> Specify the species (if not listed) and estimated number of units.",
      ],
    },
    {
      heading: "DISTRIBUTION OF CATCH AMONG RIGHTS ALLOCATIONS",
      items: [
        "Please use the MS Excel Template where the processed weight is automatically raised to the nominal weight for the species Total. <b><i>Note that the distribution of catch now extends to all species and not just levied species.</i></b>",
        "If entering manually then all categories are to be distributed as <b>NOMINAL</b> weight.",
        "<b>This form must be completed even if there is only one (1) Right Holder.</b>",
        "Enter the name of the Right Holders, their Application Number, Permit Number and the Quota year in the upper portion of this form (all fields are compulsory).",
        "In the corresponding column enter the catch amounts per levy species to be held against that right.",
        "Please ensure that the document is signed.",
      ],
    },
  ],
  note: "NOTE: Care must be taken when completing the various sections of this logbook to ensure that the information declared is <u>true, correct and complete</u> in all respects.",
};

const TC_PAGE_2 = {
  title:
    "Additional field to the Header Information page in the Trawl Freezer and Wetfish logbooks for the Recording of target species.",
  intro:
    "The field for target species has been divided to allow for recording of <b>Primary</b> and <b>Secondary</b> target species to accommodate recording of semi-targeted effort. Both Primary and Secondary target species must be recorded for each drag, using the species code supplied. The target species codes must reflect the species that you were targeting when you shot your gear and must not be influenced by what you actually caught.",
  sections: [
    {
      heading: "Primary Target Species.",
      body: "For <b>Offshore vessels</b> only hake (01) or horse mackerel (02) are permitted as Primary Target Species. For <b>Inshore vessels</b> only hake (01), horse mackerel (02) and Agulhas sole (05) are permitted as Primary Target Species.",
    },
    {
      heading: "Secondary Target Species.",
      body: "If you are semi-targeting, that is fishing in a way that will maximise your bycatch of another species, then enter that species code as the Secondary Target Species. Otherwise enter the same codes as for the Primary Target Species.",
    },
    {
      heading: "Examples",
      items: [
        "You are targeting hake only then enter hake (01) in both the Primary and Secondary Target Species fields (we expect that this would be the majority of trawls for Offshore vessels)",
        "You are targeting Agulhas sole only then enter Agulhas sole (05) in both the Primary and Secondary Target Species fields (we expect that this would be the majority trawls for the “sole specialists”)",
        "You are targeting Agulhas sole, but instead of fishing where you would maximise the sole catch rate you fish where your hake bycatch would be highest to achieve a better species mix. Enter Agulhas sole (05) as the Primary Target Species and hake (01) as the Secondary Target Species.",
        "You are trying to maximise your monk bycatch either by fishing in an area where monk bycatch is high, or by using modified gear that is more efficient for catching monk, then enter hake (01) as the Primary Target Species and monk (04) as the Secondary Target Species.",
        "You are trying to maximise your panga bycatch by fishing in an area where panga bycatch is high, then enter hake (01) as the Primary Target Species and panga (08) as the Secondary Target Species.",
        "On the first drag you were targeting hake, but caught a lot of horse mackerel and then decide to target horse mackerel for the rest of the day. On the first drag enter hake (01) in both the Primary and Secondary Target Species fields. For the subsequent drags enter horse mackerel (02) in both the Primary and Secondary Target Species fields. Don't change the target on the first drag based on the catch, but leave it to reflect the species that you were expecting when you shot the gear.",
        "On the first drag you were targeting hake and you caught a lot of panga. You then decide to maximise your panga bycatch (semi-target) for the rest of the day. On the first drag enter hake (01) in both the Primary and Secondary Target Species fields. For the subsequent drags enter hake (01) as the Primary Target and panga (08) as the Secondary Target Species. Don't change the target on the first drag based on the catch, but leave it to reflect the species that you were expecting when you shot the gear.",
      ],
    },
    {
      heading: "Reason for the change",
      body: "The Department is aware that you are not always trying to maximise your hake catch rate, but will sometimes fish in areas where the catch rate of a particular bycatch species is higher even though the hake catch rate is low, i.e. you are trading hake catch rate for the benefit of increased bycatch. The change in the way that the target information is captured will help The Department to separate the drags where you were trying to maximise the hake catch rate (pure hake targeted drags) from those where you were semi-targeting another species.",
    },
  ],
};
