import type { SportDef, SkillDimensionDef } from '../types';

export const SPORTS: SportDef[] = [
  {
    "id": "sepak_bola",
    "name": "Sepak Bola",
    "icon": "trophy",
    "description": "Sepak bola adalah olahraga tim yang dimainkan oleh 11 pemain di setiap sisi.",
    "color": "#D1FF00",
    "dimensions": [
      {
        "id": "sb_speed",
        "name": "Kecepatan",
        "icon": "zap",
        "description": "Kemampuan akselerasi dan kecepatan lari",
        "items": [
          {
            "id": "sb_speed_sprint40",
            "label": "Sprint 40 meter",
            "unit": "detik",
            "higherIsBetter": false,
            "assessmentType": "ai_scan",
            "referenceValue": 5,
            "minRecommended": 4.4,
            "maxRecommended": 6
          },
          {
            "id": "sb_speed_accel10",
            "label": "Akselerasi 10m",
            "unit": "detik",
            "higherIsBetter": false,
            "assessmentType": "ai_scan",
            "referenceValue": 1.7,
            "minRecommended": 1.45,
            "maxRecommended": 2.1
          }
        ]
      },
      {
        "id": "sb_stamina",
        "name": "Daya Tahan",
        "icon": "heart",
        "description": "Ketahanan kardiovaskular dan pemulihan",
        "items": [
          {
            "id": "sb_stamina_yoyo",
            "label": "Yo-Yo Test IR1",
            "unit": "level",
            "higherIsBetter": true,
            "assessmentType": "ai_scan",
            "referenceValue": 18,
            "minRecommended": 15,
            "maxRecommended": 25
          },
          {
            "id": "sb_stamina_vo2max",
            "label": "Estimasi VO2Max",
            "unit": "ml/kg/min",
            "higherIsBetter": true,
            "assessmentType": "ai_scan",
            "referenceValue": 55,
            "minRecommended": 48,
            "maxRecommended": 70
          }
        ]
      },
      {
        "id": "sb_agility",
        "name": "Kelincahan",
        "icon": "target",
        "description": "Kemampuan mengubah arah dengan cepat",
        "items": [
          {
            "id": "sb_agility_ttest",
            "label": "T-Test",
            "unit": "detik",
            "higherIsBetter": false,
            "assessmentType": "ai_scan",
            "referenceValue": 9.8,
            "minRecommended": 8.2,
            "maxRecommended": 11.5
          },
          {
            "id": "sb_agility_zigzag",
            "label": "Zig-Zag Run",
            "unit": "detik",
            "higherIsBetter": false,
            "assessmentType": "ai_scan",
            "referenceValue": 13.5,
            "minRecommended": 11,
            "maxRecommended": 16
          }
        ]
      },
      {
        "id": "sb_technique",
        "name": "Teknik",
        "icon": "shield",
        "description": "Kemampuan teknis dengan bola",
        "items": [
          {
            "id": "sb_tech_passing",
            "label": "Passing Accuracy",
            "unit": "%",
            "higherIsBetter": true,
            "assessmentType": "ai_scan",
            "referenceValue": 85,
            "minRecommended": 70,
            "maxRecommended": 99
          },
          {
            "id": "sb_tech_dribbling",
            "label": "Dribbling Control",
            "unit": "rating",
            "higherIsBetter": true,
            "assessmentType": "ai_scan",
            "referenceValue": 82,
            "minRecommended": 60,
            "maxRecommended": 100
          }
        ]
      }
    ]
  },
  {
    "id": "bulutangkis",
    "name": "Bulutangkis",
    "icon": "target",
    "description": "Bulutangkis adalah olahraga raket yang dimainkan oleh dua atau empat pemain.",
    "color": "#FF6B6B",
    "dimensions": [
      {
        "id": "bt_speed",
        "name": "Kecepatan",
        "icon": "zap",
        "description": "Kecepatan reaksi dan footwork",
        "items": [
          {
            "id": "bt_speed_6point",
            "label": "6-Point Footwork",
            "unit": "detik",
            "higherIsBetter": false,
            "assessmentType": "ai_scan",
            "referenceValue": 16,
            "minRecommended": 14,
            "maxRecommended": 20
          },
          {
            "id": "bt_speed_reaction",
            "label": "Reaction Time",
            "unit": "ms",
            "higherIsBetter": false,
            "assessmentType": "ai_scan",
            "referenceValue": 210,
            "minRecommended": 170,
            "maxRecommended": 280
          }
        ]
      },
      {
        "id": "bt_stamina",
        "name": "Daya Tahan",
        "icon": "heart",
        "description": "Ketahanan fisik untuk rally panjang",
        "items": [
          {
            "id": "bt_stamina_multi",
            "label": "Multistage Fitness Test",
            "unit": "level",
            "higherIsBetter": true,
            "assessmentType": "ai_scan",
            "referenceValue": 14,
            "minRecommended": 11,
            "maxRecommended": 20
          },
          {
            "id": "bt_stamina_recovery",
            "label": "Heart Rate Recovery",
            "unit": "bpm",
            "higherIsBetter": false,
            "assessmentType": "ai_scan",
            "referenceValue": 22,
            "minRecommended": 14,
            "maxRecommended": 35
          }
        ]
      },
      {
        "id": "bt_agility",
        "name": "Kelincahan",
        "icon": "target",
        "description": "Kemampuan change of direction",
        "items": [
          {
            "id": "bt_agility_shadow",
            "label": "Shadow Footwork",
            "unit": "detik",
            "higherIsBetter": false,
            "assessmentType": "ai_scan",
            "referenceValue": 40,
            "minRecommended": 35,
            "maxRecommended": 48
          },
          {
            "id": "bt_agility_cod",
            "label": "Change of Direction",
            "unit": "detik",
            "higherIsBetter": false,
            "assessmentType": "ai_scan",
            "referenceValue": 3,
            "minRecommended": 2.6,
            "maxRecommended": 4
          }
        ]
      },
      {
        "id": "bt_technique",
        "name": "Teknik",
        "icon": "shield",
        "description": "Akurasi dan presisi pukulan",
        "items": [
          {
            "id": "bt_tech_clear",
            "label": "Clear Accuracy",
            "unit": "%",
            "higherIsBetter": true,
            "assessmentType": "ai_scan",
            "referenceValue": 86,
            "minRecommended": 70,
            "maxRecommended": 98
          },
          {
            "id": "bt_tech_dropshot",
            "label": "Dropshot Precision",
            "unit": "rating",
            "higherIsBetter": true,
            "assessmentType": "ai_scan",
            "referenceValue": 82,
            "minRecommended": 60,
            "maxRecommended": 100
          }
        ]
      }
    ]
  },
  {
    "id": "taekwondo",
    "name": "Taekwondo",
    "icon": "shield",
    "description": "Taekwondo adalah seni bela diri asal Korea yang menekankan tendangan dan pukulan.",
    "color": "#4ECDC4",
    "dimensions": [
      {
        "id": "tk_speed",
        "name": "Kecepatan",
        "icon": "zap",
        "description": "Kecepatan teknik tendangan",
        "items": [
          {
            "id": "tk_speed_kick",
            "label": "Round Kick Speed",
            "unit": "kicks/10s",
            "higherIsBetter": true,
            "assessmentType": "ai_scan",
            "referenceValue": 20,
            "minRecommended": 16,
            "maxRecommended": 28
          },
          {
            "id": "tk_speed_step",
            "label": "Step Combination",
            "unit": "detik",
            "higherIsBetter": false,
            "assessmentType": "ai_scan",
            "referenceValue": 2.8,
            "minRecommended": 2.2,
            "maxRecommended": 4
          }
        ]
      },
      {
        "id": "tk_power",
        "name": "Power",
        "icon": "zap",
        "description": "Kekuatan pukulan dan tendangan",
        "items": [
          {
            "id": "tk_power_breaking",
            "label": "Breaking Power",
            "unit": "kg",
            "higherIsBetter": true,
            "assessmentType": "ai_scan",
            "referenceValue": 55,
            "minRecommended": 40,
            "maxRecommended": 90
          },
          {
            "id": "tk_power_jump",
            "label": "Vertical Jump",
            "unit": "cm",
            "higherIsBetter": true,
            "assessmentType": "ai_scan",
            "referenceValue": 55,
            "minRecommended": 42,
            "maxRecommended": 80
          }
        ]
      },
      {
        "id": "tk_agility",
        "name": "Kelincahan",
        "icon": "target",
        "description": "Kelincahan gerakan dan kombinasi",
        "items": [
          {
            "id": "tk_agility_combo",
            "label": "Kicking Combination",
            "unit": "detik",
            "higherIsBetter": false,
            "assessmentType": "ai_scan",
            "referenceValue": 7,
            "minRecommended": 5.5,
            "maxRecommended": 10
          },
          {
            "id": "tk_agility_evasion",
            "label": "Evasion Speed",
            "unit": "rating",
            "higherIsBetter": true,
            "assessmentType": "ai_scan",
            "referenceValue": 80,
            "minRecommended": 60,
            "maxRecommended": 100
          }
        ]
      },
      {
        "id": "tk_technique",
        "name": "Teknik",
        "icon": "shield",
        "description": "Presisi dan akurasi jurus",
        "items": [
          {
            "id": "tk_tech_poomsae",
            "label": "Poomsae Precision",
            "unit": "rating",
            "higherIsBetter": true,
            "assessmentType": "ai_scan",
            "referenceValue": 85,
            "minRecommended": 65,
            "maxRecommended": 100
          },
          {
            "id": "tk_tech_sparring",
            "label": "Sparring Tactical",
            "unit": "rating",
            "higherIsBetter": true,
            "assessmentType": "ai_scan",
            "referenceValue": 82,
            "minRecommended": 65,
            "maxRecommended": 100
          }
        ]
      }
    ]
  }
];

export function getSport(id: string): SportDef | undefined {
  return SPORTS.find((s) => s.id === id);
}

export function getDimensionItems(sportId: string, dimensionId: string): SkillDimensionDef | undefined {
  const sport = getSport(sportId);
  if (!sport) return undefined;
  return sport.dimensions.find((d) => d.id === dimensionId);
}
