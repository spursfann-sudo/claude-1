export interface PropertyData {
  address: string;
  price?: number;
  propertyType?: string;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
  lotSize?: number;
  hoaFees?: number;
  propertyTax?: number;
  neighborhoodName?: string;
  walkScore?: number;
  schoolRating?: number;
  medianAreaPrice?: number;
  estimatedRent?: number;
  priceHistory?: { year: number; price: number }[];
  researchSummary: string;
}

export type StrategyId =
  | 'brrrr'
  | 'turnkey_rental'
  | 'str'
  | 'buy_hold'
  | 'fix_flip'
  | 'wholesale';

export interface StrategyInputs {
  strategyId: StrategyId;
  renovationCost?: number;
  arvEstimate?: number;
  targetRent?: number;
  nightlyRate?: number;
  occupancyRate?: number;
  holdPeriodYears?: number;
  holdPeriodMonths?: number;
  sellingCostsPct?: number;
  assignmentFee?: number;
  earnestMoney?: number;
  refiLtv?: number;
  propertyMgmtPct?: number;
  platformFeePct?: number;
  annualAppreciationPct?: number;
  downPaymentPct?: number;
  interestRate?: number;
  loanTermYears?: number;
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface CostBreakdown {
  acquisitionCost: number;
  renovationCost?: number;
  carryCosts?: number;
  transactionCosts?: number;
  totalProjectCost: number;
}

export interface StrategyAnalysis {
  strategyId: StrategyId;
  strategyName: string;
  verdict: 'Strong Buy' | 'Buy' | 'Marginal' | 'Avoid';
  investmentScore: number;

  // Universal metrics
  totalCashInvested: number;
  cashOnCashReturn: number;
  cocIsAnnualized: boolean;

  summary: string;
  riskFactors: RiskFactor[];
  keyHighlights: string[];

  // Hold strategy metrics
  grossAnnualIncome?: number;
  monthlyNetIncome?: number;
  annualNetIncome?: number;
  capRate?: number;
  grossRentMultiplier?: number;

  // BRRRR-specific
  remainingCashPostRefi?: number;
  equityCaptured?: number;

  // STR-specific
  avgDailyRate?: number;
  occupancyRate?: number;
  revPAR?: number;

  // Sell strategy metrics
  costBreakdown?: CostBreakdown;
  projectedArv?: number;
  netProfit?: number;
  holdPeriodMonths?: number;

  // Wholesale-specific
  maxAllowableOffer?: number;
  assignmentFee?: number;

  // Projections
  valueProjections?: {
    year: number;
    estimatedValue: number;
    cumulativeTotalReturn: number;
    equity: number;
  }[];
}

export interface RealEstateAnalysis {
  propertyData: PropertyData;
  strategies: StrategyAnalysis[];
  comparativeSummary: string;
}
