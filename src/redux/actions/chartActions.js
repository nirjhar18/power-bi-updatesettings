import * as types from "./actionTypes";
import { models } from "powerbi-client";
import "powerbi-report-authoring";
import * as constants from "../../_helpers/constants";

var xCoordinates = 0;
var yCoordinates = 0;
export function loadChartSuccess(charts) {
  return { type: types.LOAD_CHARTS_SUCCESS, charts };
}

export function loadCharts() {
  return function (dispatch) {
    return getJsonArray()
      .then((charts) => {
        dispatch(loadChartSuccess(charts));
      })
      .catch((error) => {
        throw error;
      })
      .then(() => {
        dispatch(handleLoadCharts());
      });
  };
}

export function updateLayoutColumnsState(columns) {
  return { type: types.UPDATE_LAYOUT_COLUMNS, columns };
}

export function handleLoadCharts() {
  return function (dispatch, getState) {
    let columns = window.innerWidth > 1000 ? 3 : 2;
    dispatch(updateLayoutColumnsState(columns));
    var storeData = getState();
    CreateVisualsWithCoordinates(storeData, dispatch, getState);
  };
}

export function getEmbeddedReport(report) {
  return { type: types.GET_EMBEDDED_REPORT, report };
}

export function renderVisualsResize() {
  return function (dispatch, getState) {
    var storeData = getState();
    renderVisuals(storeData.charts.LayoutShowcaseState);
  };
}

export function updateActivePagesVisuals(visuals) {
  return { type: types.UPDATE_ACTIVE_PAGE_VISUALS, visuals };
}

export function handlePageLoadSuccess(visuals) {
  return { type: types.LOAD_CHARTS_SUCCESS, visuals };
}

export function updateLayoutColumns(columns) {
  return function (dispatch) {
    return dispatch(updateLayoutColumnsState(columns));
  };
}

function getVisualLayout(LayoutShowcaseState, index) {
  // Get embedContainer width and height
  var LayoutShowcaseConsts = {
    margin: 0,
    minPageWidth: 270,
  };
  let pageWidth = window.innerWidth;

  // Calculating the overall width of the visuals in each row
  let visualsTotalWidth =
    pageWidth - LayoutShowcaseConsts.margin * (LayoutShowcaseState.columns + 1);

  // Calculate the width of a single visual, according to the number of columns
  // For one and three columns visuals width will be a third of visuals total width

  let width =
    LayoutShowcaseState.columns === constants.ColumnsNumber.Two
      ? visualsTotalWidth / 2
      : visualsTotalWidth / 3;

  // For one column, set page width to visual's width with margins
  if (LayoutShowcaseState.columns === constants.ColumnsNumber.One) {
    pageWidth = width + 2 * LayoutShowcaseConsts.margin;

    // Check if page width is smaller than minimum width and update accordingly
    if (pageWidth < LayoutShowcaseConsts.minPageWidth) {
      pageWidth = LayoutShowcaseConsts.minPageWidth;

      // Visuals width is set to fit minimum page width with margins on both sides
      width =
        LayoutShowcaseConsts.minPageWidth - 2 * LayoutShowcaseConsts.margin;
    }
  }

  // Set visuals height according to width - 9:16 ratio
  const height = width * (9 / 16);

  if (xCoordinates !== 0 || yCoordinates !== 0) {
    xCoordinates += width + LayoutShowcaseConsts.margin;
    if (xCoordinates + width > pageWidth) {
      xCoordinates = LayoutShowcaseConsts.margin;
      yCoordinates += height + LayoutShowcaseConsts.margin;
    }
  } else {
    xCoordinates = -1;
  }

  return {
    width: width - 10,
    height: height - 10,
    x: xCoordinates,
    y: yCoordinates,
    displayState: {
      // Change the selected visuals display mode to visible
      mode: models.VisualContainerDisplayMode.Visible,
    },
  };
}

function propertyToSelector(propertyName) {
  switch (propertyName) {
    case "title":
      return { objectName: "title", propertyName: "visible" };
    case "xAxis":
      return { objectName: "categoryAxis", propertyName: "visible" };
    case "yAxis":
      return { objectName: "valueAxis", propertyName: "visible" };
    case "legend":
      return { objectName: "legend", propertyName: "visible" };
    case "titleText":
      return { objectName: "title", propertyName: "titleText" };
    case "titleAlign":
      return { objectName: "title", propertyName: "alignment" };
    case "titleSize":
      return { objectName: "title", propertyName: "textSize" };
    case "titleColor":
      return { objectName: "title", propertyName: "fontColor" };
    default:
      return { objectName: "title", propertyName: "fontColor" };
  }
}

function renderVisuals(LayoutShowcaseState) {
  // render only if report and visuals initialized
  if (!LayoutShowcaseState.layoutReport || !LayoutShowcaseState.layoutVisuals)
    return;

  // Get embedContainer width and height
  let pageWidth = window.innerWidth;
  let pageHeight = window.innerHeight;

  // Calculating the overall width of the visuals in each row
  // let visualsTotalWidth = pageWidth - 0 * (LayoutShowcaseState.columns + 1);
  let visualsTotalWidth = pageWidth - 0 * (LayoutShowcaseState.columns + 1);

  // // Calculate the width of a single visual, according to the number of columns
  // // For one and three columns visuals width will be a third of visuals total width
  let width =
    LayoutShowcaseState.columns === constants.ColumnsNumber.Two
      ? visualsTotalWidth / 2
      : visualsTotalWidth / 3;
  // For one column, set page width to visual's width with margins
  if (LayoutShowcaseState.columns === constants.ColumnsNumber.One) {
    pageWidth = width + 2 * 0;

    // Check if page width is smaller than minimum width and update accordingly
    if (pageWidth < constants.LayoutShowcaseConsts.minPageWidth) {
      pageWidth = constants.LayoutShowcaseConsts.minPageWidth;

      // Visuals width is set to fit minimum page width with margins on both sides
      width =
        constants.LayoutShowcaseConsts.minPageWidth -
        2 * constants.LayoutShowcaseConsts.minPageWidth;
    }
  }

  // // Set visuals height according to width - 9:16 ratio
  const height = width * (9 / 16);

  // Filter the visuals list to display only the checked visuals
  let checkedVisuals = LayoutShowcaseState.layoutVisuals.filter(function (
    visual
  ) {
    return visual.checked;
  });

  // Calculate the number of lines
  const lines = Math.ceil(checkedVisuals.length / LayoutShowcaseState.columns);

  // Calculate page height with margins
  pageHeight = Math.max(pageHeight, lines * height + (lines + 1) * 0);

  let visualsLayout = {};
  for (let i = 0; i < checkedVisuals.length; i++) {
    visualsLayout[checkedVisuals[i].name] = {
      x: checkedVisuals[i].x,
      y: checkedVisuals[i].y,
      width: width,
      height: height,
      displayState: {
        // Change the selected visuals display mode to visible
        mode: models.VisualContainerDisplayMode.visible,
      },
    };
  }

  //Building pagesLayout object
  let pagesLayout = {};
  pagesLayout[LayoutShowcaseState.layoutPageName] = {
    defaultLayout: {
      displayState: {
        // Default display mode for visuals is hidden
        mode: models.VisualContainerDisplayMode.Visible,
      },
    },
    visualsLayout: visualsLayout,
  };

  // Building settings object
  let settings = {
    layoutType: models.LayoutType.Custom,
    customLayout: {
      pageSize: {
        type: models.PageSizeType.Custom,
        width: pageWidth,
        height: pageHeight,
      },
      displayOption: models.DisplayOption.FitToPage,
      pagesLayout: pagesLayout,
    },
  };

  // If pageWidth or pageHeight is changed, change display option to actual size to add scroll bar
  // if (pageWidth !== window.innerWidth || pageHeight !== window.innerHeight) {
  //   settings.customLayout.displayOption = models.DisplayOption.ActualSize;
  // }

  // Change page background to transparent on Two / Three columns configuration
  settings.background =
    LayoutShowcaseState.columns === 1
      ? models.BackgroundType.Default
      : models.BackgroundType.Transparent;

  // Call updateSettings with the new settings object
  LayoutShowcaseState.layoutReport.updateSettings(settings);
}

function CreateVisualsWithCoordinates(storeData, dispatch, getState) {
  xCoordinates = 0;
  yCoordinates = 0;
  storeData.charts.LayoutShowcaseState.layoutReport
    .getPages()
    .then(function (pages) {
      let activePage = pages[0];
      let jsonArray = storeData.charts.charts;

      jsonArray.map((visualJson, index) =>
        activePage
          .createVisual(
            visualJson["chartType"],
            getVisualLayout(storeData.charts.LayoutShowcaseState, index)
          )
          .then(function (createdVisual) {
            let vis = createdVisual.visual;
            vis.setProperty(propertyToSelector("legend"), {
              schema: schemas.property,
              value: true,
            });
            vis.setProperty(propertyToSelector("titleSize"), {
              schema: schemas.property,
              value: 14,
            });
            vis.setProperty(propertyToSelector("titleColor"), {
              schema: schemas.property,
              value: "#000000",
            });
            vis.getCapabilities().then(function (capabilities) {
              visualJson["dataRoles"].forEach((dataRole) => {
                let roleDisplayName = dataRole["dataRole"];
                let field = dataRole["field"];
                // Getting the data role name
                let dataRoleName = capabilities.dataRoles.filter(function (dr) {
                  return dr.displayName === roleDisplayName;
                })[0].name;
                vis.addDataField(dataRoleName, field);
              });
            });
          })
      );
      // Retrieve active page visuals.

      //Dispatch an action to update layout Visuals
      let activeVisuals = storeData.charts.LayoutShowcaseState.layoutVisuals;

      activePage.getVisuals().then(function (visuals) {
        activeVisuals = visuals.map(function (visual) {
          return {
            name: visual.name,
            title: visual.title ? visual.title : visual.name,
            checked: true,
            pageName: activePage.name,
            x: visual.layout.x,
            y: visual.layout.y,
          };
        });
        dispatch(updateActivePagesVisuals(activeVisuals));
        // Create visuals array from the visuals of the active page
        let updatedStoreData = getState();

        renderVisuals(updatedStoreData.charts.LayoutShowcaseState);
      });
    })
    .catch((error) => {
      throw error;
    });
}

function getJsonArray() {
  return new Promise(function (resolve, reject) {
    resolve([
      {
        topic: "123",
        chartType: "pieChart",
        isVisible: true,
        isEditable: false,
        dataRoles: [
          {
            dataRole: "Legend",
            field: { column: "State", table: "Geo", schema: schemas.column },
          },
          {
            dataRole: "Values",
            field: {
              measure: "Total Units",
              table: "SalesFact",
              schema: schemas.measure,
            },
          },
        ],
      },
      {
        topic: "124",
        chartType: "columnChart",
        isVisible: true,
        isEditable: true,
        dataRoles: [
          {
            dataRole: "Axis",
            field: { column: "Region", table: "Geo", schema: schemas.column },
          },
          {
            dataRole: "Values",
            field: {
              measure: "Total Units",
              table: "SalesFact",
              schema: schemas.measure,
            },
          },
        ],
      },
      {
        topic: "125",
        chartType: "pieChart",
        isVisible: true,
        isEditable: false,
        dataRoles: [
          {
            dataRole: "Legend",
            field: { column: "State", table: "Geo", schema: schemas.column },
          },
          {
            dataRole: "Values",
            field: {
              measure: "Total Units",
              table: "SalesFact",
              schema: schemas.measure,
            },
          },
        ],
      },
      {
        topic: "124",
        chartType: "columnChart",
        isVisible: true,
        isEditable: false,
        dataRoles: [
          {
            dataRole: "Axis",
            field: { column: "Region", table: "Geo", schema: schemas.column },
          },
          {
            dataRole: "Values",
            field: {
              measure: "Total Units",
              table: "SalesFact",
              schema: schemas.measure,
            },
          },
        ],
      },
      {
        topic: "123",
        chartType: "pieChart",
        isVisible: true,
        isEditable: false,
        dataRoles: [
          {
            dataRole: "Legend",
            field: { column: "State", table: "Geo", schema: schemas.column },
          },
          {
            dataRole: "Values",
            field: {
              measure: "Total Units",
              table: "SalesFact",
              schema: schemas.measure,
            },
          },
        ],
      },
      {
        topic: "129",
        chartType: "columnChart",
        isVisible: true,
        isEditable: false,
        dataRoles: [
          {
            dataRole: "Axis",
            field: { column: "Region", table: "Geo", schema: schemas.column },
          },
          {
            dataRole: "Values",
            field: {
              measure: "Total Units",
              table: "SalesFact",
              schema: schemas.measure,
            },
          },
        ],
      },
      {
        topic: "129",
        chartType: "columnChart",
        isVisible: true,
        isEditable: true,
        dataRoles: [
          {
            dataRole: "Axis",
            field: { column: "Region", table: "Geo", schema: schemas.column },
          },
          {
            dataRole: "Values",
            field: {
              measure: "Total Units",
              table: "SalesFact",
              schema: schemas.measure,
            },
          },
        ],
      },
      {
        topic: "129",
        chartType: "columnChart",
        isVisible: true,
        isEditable: false,
        dataRoles: [
          {
            dataRole: "Axis",
            field: { column: "Region", table: "Geo", schema: schemas.column },
          },
          {
            dataRole: "Values",
            field: {
              measure: "Total Units",
              table: "SalesFact",
              schema: schemas.measure,
            },
          },
        ],
      },
      {
        topic: "129",
        chartType: "columnChart",
        isVisible: true,
        isEditable: false,
        dataRoles: [
          {
            dataRole: "Axis",
            field: { column: "Region", table: "Geo", schema: schemas.column },
          },
          {
            dataRole: "Values",
            field: {
              measure: "Total Units",
              table: "SalesFact",
              schema: schemas.measure,
            },
          },
        ],
      },
    ]);
  });
}

const schemas = {
  column: "http://powerbi.com/product/schema#column",
  measure: "http://powerbi.com/product/schema#measure",
  property: "http://powerbi.com/product/schema#property",
  hierarchy: "http://powerbi.com/product/schema#hierarchy",
};
