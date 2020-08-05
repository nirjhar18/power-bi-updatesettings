import * as types from "../actions/actionTypes";
import initialState from "./initialState";
import produce from "immer";

export default function chartReducer(state = initialState, action) {
  switch (action.type) {
    case types.LOAD_CHARTS_SUCCESS:
      return produce(state, (draft) => {
        draft.charts = action.charts;
      });
    case types.GET_EMBEDDED_REPORT:
      return produce(state, (draft) => {
        draft.LayoutShowcaseState.layoutReport = action.report;
      });
    case types.UPDATE_ACTIVE_PAGE_VISUALS:
      return produce(state, (draft) => {
        draft.LayoutShowcaseState.layoutVisuals = action.visuals;
      });
    case types.UPDATE_LAYOUT_COLUMNS:
      return produce(state, (draft) => {
        draft.LayoutShowcaseState.columns = action.columns;
        draft.columns = action.columns;
      });
    case types.REMOVE_VISUAL_STATE:
      return produce(state, (draft) => {
        draft.LayoutShowcaseState.layoutVisuals = null;
      });

    default:
      return state;
  }
}
