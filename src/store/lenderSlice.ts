import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Lender {
  objectID: string;
  lenderName: string;
  contactName: string;
  contactEmail: string;
  minimumCheckSize: number;
  maximumCheckSize: number;
  industry: string[];
  vertical: string[];
  fundingUse: string[];
  stage: string[];
  collateralTypes: string[];
  personalGuarantyRule: string;
  collateralToPledgeYesNo: string;
  covenantsYesNo: string;
  ebitdaPositiveRule: string;
  pathToRevenueRule: string;
  minPriorYearRevenueRule: string;
  minPriorYearRevenueAmt: number;
  minCashRunwayRule: string;
  pathToRevenueLogic: string;
  recurringRevenueRule: string;
  minProjectedRevenueRule: string;
  minProjectedRevenueAmt: number;
  loanRunwayMonthsRule: string;
  minMonthsInBusinessRule: string;
}

interface LenderState {
  selectedLenders: Record<string, Lender>;
}

const initialState: LenderState = {
  selectedLenders: {}
};

export const lenderSlice = createSlice({
  name: 'lenders',
  initialState,
  reducers: {
    toggleLender: (state, action: PayloadAction<Lender>) => {
      const lender = action.payload;
      if (state.selectedLenders[lender.objectID]) {
        delete state.selectedLenders[lender.objectID];
      } else {
        state.selectedLenders[lender.objectID] = lender;
      }
    },
    clearSelectedLenders: (state) => {
      state.selectedLenders = {};
    },
    setSelectedLenders: (state, action: PayloadAction<Record<string, Lender>>) => {
      state.selectedLenders = action.payload;
    }
  }
});

export const { toggleLender, clearSelectedLenders, setSelectedLenders } = lenderSlice.actions;
export default lenderSlice.reducer;