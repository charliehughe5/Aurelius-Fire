import { db } from './db.ts';
import { PremisesType, QuoteItem } from '../src/types.ts';

export interface PriceCalculationInput {
  premisesType: PremisesType;
  approxFloorAreaSqM: number;
  numberOfFloors: number;
  maxOccupancy: number;
  sleepingAccommodation: boolean;
  multiOccupancyBuilding?: boolean;
  isReviewOfPreviousFra?: boolean;
  outOfHours?: boolean;
  weekend?: boolean;
  outsideLondonTravel?: boolean;
  followUpVisitRequired?: boolean;
  compartmentationSampling?: boolean;
}

export interface QuoteCalculationResult {
  items: QuoteItem[];
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  assumptions: string[];
  exclusions: string[];
  termsSummary: string;
}

export function calculateQuote(input: PriceCalculationInput): QuoteCalculationResult {
  const rules = db.getPricingRules();
  const settings = db.getSettings();

  const items: QuoteItem[] = [];
  let itemCounter = 1;

  // 1. Base Assessment or Review fee
  const baseRule = rules.find((r) => r.ruleKey === 'base_assessment' && r.isEnabled);
  const reviewRule = rules.find((r) => r.ruleKey === 'review_fra_discount' && r.isEnabled);

  if (input.isReviewOfPreviousFra && reviewRule) {
    items.push({
      id: `item_${itemCounter++}`,
      description: 'Annual Review of Existing Fire Risk Assessment (PAS 79-1:2020)',
      quantity: 1,
      unitPrice: reviewRule.basePrice || 280,
      total: reviewRule.basePrice || 280,
    });
  } else if (baseRule) {
    items.push({
      id: `item_${itemCounter++}`,
      description: `Comprehensive Life Safety Fire Risk Assessment: ${input.premisesType} (PAS 79-1:2020)`,
      quantity: 1,
      unitPrice: baseRule.basePrice || 350,
      total: baseRule.basePrice || 350,
    });
  }

  // 2. Premises Type complexity
  if (input.premisesType === 'Care Homes & Healthcare') {
    const careRule = rules.find((r) => r.ruleKey === 'type_care_home' && r.isEnabled);
    if (careRule) {
      items.push({
        id: `item_${itemCounter++}`,
        description: 'Healthcare & Care Home progressive horizontal evacuation risk evaluation',
        quantity: 1,
        unitPrice: careRule.flatFee || 150,
        total: careRule.flatFee || 150,
      });
    }
  } else if (input.premisesType === 'Hotels & Sleeping Accommodation' || input.sleepingAccommodation) {
    const sleepRule = rules.find((r) => r.ruleKey === 'sleeping_risk' && r.isEnabled);
    if (sleepRule) {
      items.push({
        id: `item_${itemCounter++}`,
        description: 'Sleeping risk assessment (night-time vulnerability & detection audit)',
        quantity: 1,
        unitPrice: sleepRule.flatFee || 95,
        total: sleepRule.flatFee || 95,
      });
    }
  } else if (input.premisesType === 'Residential Flats / HMO Common Parts') {
    const hmoRule = rules.find((r) => r.ruleKey === 'type_residential_hmo' && r.isEnabled);
    if (hmoRule) {
      items.push({
        id: `item_${itemCounter++}`,
        description: 'Residential common parts assessment under Fire Safety Act 2021',
        quantity: 1,
        unitPrice: hmoRule.flatFee || 50,
        total: hmoRule.flatFee || 50,
      });
    }
  }

  // 3. Floor Area allowance
  if (input.approxFloorAreaSqM > 1500) {
    const xlargeRule = rules.find((r) => r.ruleKey === 'area_over_1500m2' && r.isEnabled);
    if (xlargeRule) {
      items.push({
        id: `item_${itemCounter++}`,
        description: `Large facility floor area scale (${input.approxFloorAreaSqM.toLocaleString()} m²)`,
        quantity: 1,
        unitPrice: xlargeRule.flatFee || 200,
        total: xlargeRule.flatFee || 200,
      });
    }
  } else if (input.approxFloorAreaSqM > 500) {
    const largeRule = rules.find((r) => r.ruleKey === 'area_over_500m2' && r.isEnabled);
    if (largeRule) {
      items.push({
        id: `item_${itemCounter++}`,
        description: `Extended floor area inspection (${input.approxFloorAreaSqM.toLocaleString()} m²)`,
        quantity: 1,
        unitPrice: largeRule.flatFee || 95,
        total: largeRule.flatFee || 95,
      });
    }
  }

  // 4. Building Height (Floors)
  if (input.numberOfFloors >= 4) {
    const floorRule = rules.find((r) => r.ruleKey === 'floors_4_plus' && r.isEnabled);
    if (floorRule) {
      items.push({
        id: `item_${itemCounter++}`,
        description: `Multi-storey vertical escape & stair enclosure audit (${input.numberOfFloors} floors)`,
        quantity: 1,
        unitPrice: floorRule.flatFee || 75,
        total: floorRule.flatFee || 75,
      });
    }
  }

  // 5. Multi-Occupancy
  if (input.multiOccupancyBuilding) {
    const multiRule = rules.find((r) => r.ruleKey === 'multi_occupancy' && r.isEnabled);
    if (multiRule) {
      items.push({
        id: `item_${itemCounter++}`,
        description: 'Multi-occupancy coordination & shared escape route review (FSO Art 22)',
        quantity: 1,
        unitPrice: multiRule.flatFee || 65,
        total: multiRule.flatFee || 65,
      });
    }
  }

  // 6. Optional / Special charges
  if (input.outsideLondonTravel) {
    const travelRule = rules.find((r) => r.ruleKey === 'travel_charge' && r.isEnabled);
    if (travelRule) {
      items.push({
        id: `item_${itemCounter++}`,
        description: 'Travel and site attendance charge',
        quantity: 1,
        unitPrice: travelRule.flatFee || 45,
        total: travelRule.flatFee || 45,
      });
    }
  }

  if (input.outOfHours) {
    const oohRule = rules.find((r) => r.ruleKey === 'out_of_hours' && r.isEnabled);
    if (oohRule) {
      items.push({
        id: `item_${itemCounter++}`,
        description: 'Out-of-hours on-site assessment attendance',
        quantity: 1,
        unitPrice: oohRule.flatFee || 110,
        total: oohRule.flatFee || 110,
      });
    }
  }

  if (input.weekend) {
    const weekendRule = rules.find((r) => r.ruleKey === 'weekend_assessment' && r.isEnabled);
    if (weekendRule) {
      items.push({
        id: `item_${itemCounter++}`,
        description: 'Weekend site assessment attendance surcharge',
        quantity: 1,
        unitPrice: weekendRule.flatFee || 160,
        total: weekendRule.flatFee || 160,
      });
    }
  }

  if (input.compartmentationSampling) {
    items.push({
      id: `item_${itemCounter++}`,
      description: 'Non-destructive sampling of fire stopping and accessible compartment lines',
      quantity: 1,
      unitPrice: 120,
      total: 120,
    });
  }

  if (input.followUpVisitRequired) {
    items.push({
      id: `item_${itemCounter++}`,
      description: 'Scheduled follow-up verification visit for high-priority actions',
      quantity: 1,
      unitPrice: 180,
      total: 180,
    });
  }

  const netAmount = items.reduce((sum, item) => sum + item.total, 0);
  const vatRate = settings.vatRegistered ? settings.vatRatePercent / 100 : 0;
  const vatAmount = Math.round(netAmount * vatRate * 100) / 100;
  const totalAmount = Math.round((netAmount + vatAmount) * 100) / 100;

  const assumptions = [
    'Assessment is non-destructive and covers all accessible common areas, escape corridors, risers, and plant rooms.',
    'A keyholder or premises representative will be on site to provide unhindered access to all required compartments.',
    'Access to available fire documentation (alarm test logbooks, emergency lighting logs, EICR) will be facilitated.',
    'Accredited assessor registered with the Institute of Fire Engineers (IFE) or Nationally Accredited Fire Risk Assessors Register (NAFRAR).',
  ];

  const exclusions = [
    'Destructive opening up of fire dampers, cavities, or concealed service risers.',
    'Specialist intrusive DSEAR (Dangerous Substances and Explosive Atmospheres) hazardous zoning.',
    'Commissioning or physical testing of fire alarm sound pressure levels or flow rates.',
  ];

  const termsSummary =
    'Quote valid for 30 calendar days. Subject to assessor site confirmation. The Responsible Person (or Dutyholder in Scotland) retains statutory responsibility under the Regulatory Reform (Fire Safety) Order 2005 / Fire (Scotland) Act 2005.';

  return {
    items,
    netAmount,
    vatRate,
    vatAmount,
    totalAmount,
    assumptions,
    exclusions,
    termsSummary,
  };
}
