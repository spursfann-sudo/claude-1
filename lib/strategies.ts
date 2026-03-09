import { StrategyId, StrategyInputs } from './types';

export interface StrategyDefinition {
  id: StrategyId;
  name: string;
  superStrategy: 'Acquire & Hold' | 'Acquire & Sell';
  tagline: string;
  description: string;
  typicalKpis: string[];
  color: string;
  defaultInputs: Partial<StrategyInputs>;
}

export const STRATEGIES: StrategyDefinition[] = [
  {
    id: 'turnkey_rental',
    name: 'Turnkey Rental',
    superStrategy: 'Acquire & Hold',
    tagline: 'Acquire a cash-flowing asset with minimal work',
    description:
      'Buy a move-in ready property and rent it out immediately. Goal is steady monthly income and long-term appreciation with minimal renovation.',
    typicalKpis: ['Cap Rate', 'COCR', 'Monthly Net Income', 'GRM'],
    color: '#0ea5e9',
    defaultInputs: {
      downPaymentPct: 20,
      interestRate: 7.0,
      loanTermYears: 30,
      propertyMgmtPct: 10,
      annualAppreciationPct: 3,
    },
  },
  {
    id: 'brrrr',
    name: 'BRRRR',
    superStrategy: 'Acquire & Hold',
    tagline: 'Buy, Rehab, Rent, Refinance, Repeat',
    description:
      'Purchase a distressed property, renovate it, rent it out, then do a cash-out refinance to pull your equity back out and repeat the cycle.',
    typicalKpis: ['Post-Refi COCR', 'Equity Captured', 'ARV', 'Remaining Cash Invested'],
    color: '#8b5cf6',
    defaultInputs: {
      refiLtv: 75,
      propertyMgmtPct: 10,
      annualAppreciationPct: 3,
    },
  },
  {
    id: 'str',
    name: 'Short-Term Rental',
    superStrategy: 'Acquire & Hold',
    tagline: 'Airbnb / VRBO — maximize income per night',
    description:
      'Operate the property as a short-term rental on platforms like Airbnb or VRBO. Higher revenue potential than long-term rentals, but more management-intensive.',
    typicalKpis: ['COCR', 'ADR', 'Occupancy Rate', 'RevPAR', 'Annual Net Income'],
    color: '#f59e0b',
    defaultInputs: {
      occupancyRate: 65,
      platformFeePct: 15,
      downPaymentPct: 20,
      interestRate: 7.0,
      loanTermYears: 30,
    },
  },
  {
    id: 'buy_hold',
    name: 'Buy & Hold',
    superStrategy: 'Acquire & Hold',
    tagline: 'Long-term appreciation play',
    description:
      'Purchase the property with minimal renovation and hold it for long-term appreciation. May rent it out to cover carrying costs while equity builds.',
    typicalKpis: ['10-Year Total Return', 'COCR', 'Equity Growth', 'Annualized Appreciation'],
    color: '#10b981',
    defaultInputs: {
      holdPeriodYears: 10,
      annualAppreciationPct: 4,
      downPaymentPct: 20,
      interestRate: 7.0,
      loanTermYears: 30,
    },
  },
  {
    id: 'fix_flip',
    name: 'Fix & Flip',
    superStrategy: 'Acquire & Sell',
    tagline: 'Buy distressed, renovate, and sell for profit',
    description:
      'Purchase a below-market property, renovate it to maximize ARV, then list and sell. Profit is the delta between all-in cost and sale price.',
    typicalKpis: ['Net Profit', 'Annualized COCR', 'Total Project Cost', 'ARV', 'ROI'],
    color: '#ef4444',
    defaultInputs: {
      holdPeriodMonths: 6,
      sellingCostsPct: 8,
    },
  },
  {
    id: 'wholesale',
    name: 'Wholesale',
    superStrategy: 'Acquire & Sell',
    tagline: 'Assign the contract, collect the fee',
    description:
      'Get a property under contract below market value, then assign that contract to an end buyer for an assignment fee — without closing on the property yourself.',
    typicalKpis: ['Assignment Fee', 'Annualized COCR', 'MAO', 'Earnest Money'],
    color: '#f97316',
    defaultInputs: {
      earnestMoney: 5000,
      holdPeriodMonths: 1,
    },
  },
];

export const STRATEGY_MAP = Object.fromEntries(
  STRATEGIES.map((s) => [s.id, s])
) as Record<StrategyId, StrategyDefinition>;

export function getStrategyName(id: StrategyId): string {
  return STRATEGY_MAP[id]?.name ?? id;
}

export function getStrategyColor(id: StrategyId): string {
  return STRATEGY_MAP[id]?.color ?? '#6b7280';
}

export const VERDICT_COLORS: Record<string, string> = {
  'Strong Buy': '#10b981',
  Buy: '#0ea5e9',
  Marginal: '#f59e0b',
  Avoid: '#ef4444',
};
