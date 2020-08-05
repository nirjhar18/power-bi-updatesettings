import React from "react";
import { connect } from "react-redux";
import * as chartsActions from "../../redux/actions/chartActions";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import "../../App.css";
import { debounce } from "lodash";

let EMBED_URL = "https://app.powerbi.com/reportEmbed";
let REPORT_ID = "";
let EMBED_TOKEN = "";
class EmbedChart extends React.Component {
  componentDidMount() {
    window.addEventListener(
      "resize",
      debounce((e) => {
        this.updateDimensions();
      }, 1000)
    );
  }
  updateDimensions = () => {
    this.props.actions.renderVisualsResize();
  };
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  render() {
    return (
      <>
        <PowerBIEmbed
          embedConfig={{
            type: "report", // Supported types: report, dashboard, tile, visual and qna
            id: REPORT_ID,
            embedUrl: EMBED_URL,
            accessToken: EMBED_TOKEN,
            tokenType: models.TokenType.Embed,
            permissions: models.Permissions.All,
            viewMode: models.ViewMode.viewMode,

            settings: {
              panes: {
                filters: {
                  expanded: false,
                  visible: true,
                },
              },
            },
          }}
          eventHandlers={
            new Map([
              [
                "loaded",
                () => {
                  this.props.actions.loadCharts();
                },
              ],
              ["rendered", () => {}],
              [
                "error",
                function (event) {
                  console.log(event.detail);
                },
              ],
            ])
          }
          cssClassName={
            window.innerWidth > 1000
              ? "report-style-class"
              : "report-style-class-2"
          }
          getEmbeddedComponent={(embedObject) => {
            this.props.actions.getEmbeddedReport(embedObject);
          }}
        />
      </>
    );
  }
}

EmbedChart.propTypes = {
  actions: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    report: state.report,
    numberOfColumns: state.LayoutShowcaseState,
    columns: state.columns,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      handleLoadCharts: bindActionCreators(
        chartsActions.handleLoadCharts,
        dispatch
      ),
      loadCharts: bindActionCreators(chartsActions.loadCharts, dispatch),
      getEmbeddedReport: bindActionCreators(
        chartsActions.getEmbeddedReport,
        dispatch
      ),
      updateLayoutColumns: bindActionCreators(
        chartsActions.updateLayoutColumns,
        dispatch
      ),
      removeVisualsState: bindActionCreators(
        chartsActions.removeVisualsState,
        dispatch
      ),
      renderVisualsResize: bindActionCreators(
        chartsActions.renderVisualsResize,
        dispatch
      ),
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmbedChart);
