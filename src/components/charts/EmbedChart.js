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
let REPORT_ID = "43522fc4-19b1-4ff4-b6b3-8bb22e1ad757";
let EMBED_TOKEN =
  "H4sIAAAAAAAEACXSta7EVgBF0X95rSOZxhQphZnGzO7MeA1jnij_nhelPTrV0v77x86ecc7Knz9_wC2n5ro2_TIXN13YD42XJMZlmog3r4de6kyQEOWYjHaDd8SRjtD3Rm4rQ3Zgv8JNf8YmfT-zYTscHJFF0UmYuWhKfeNfLwzw1ZN1hR8w1yN3NMttfn93yZEfghtl066O1eaGTSsNV2hye-ulmtcNTK8BpgrJc43n_pAsWo8y06FWJgmkclrvVVRhQlaTKRD90QIMrnq4HpaDGStrR1OAbkWVKb6irvIcZm_13OKnS46d1fJJB3X3R8y30rDthPOteBsmqhyw4nepDADfnhBCa4wKhlVgrBip9XwErYk0sj9MrgX7TSVN9XRFXFkYYU-CYshJH0hi3Gdii-a1XcGC6179dmHEWaMUy-kA0w52N9s5TlPh7L-lYBgilOJOo8an_PVE9u1VV3o01SAvA6B8wGlZY9axKZiKE1BsQziY3LcedhbWGNIlb8XUu9YMl6wa5_Ys-rPBDbhN3wBPMFQeKEo2JYZqx25-UmNecAphavgPfZprN8ODMoxhLbpCNr5cRb9ep069SbkgAdrwXAnqw0uKcLSaluYZoUAYacP7wydtpRvtrfWhdUMlOJKH27neDfOSSr4UI3hM-HJcBm_J99yCvLG0YJtA0NhcVX-PwqPccPexOJ8oZ_io0DC-E4ng0oPgD0FGmMjdYN2PpfCbgsOwv2Tq9H0BP4qugMqiHrXj4A5wgYYk4EMoL2fSoOaxfv744T_Pss969fzmXNOQ5MbITkGaWGLBoUPCneKZRSJ4sFPtSEJTIsjnksW5g2Rw5cJU_Da3dOveVS5UiuFlGX9mK7YysCkWlGiJSGSRlnIFjyqW5PX6WrRr0rrRhulC9f4gRop6HbZ9cs9a0N-CRB24xM_l4gxJkT3FxMczPxtht36Laga580KRU89dKN0hgVd5XRyisc-22ApY-TWSB4J-LALDKnAhvq3dgyIec9WPByvTD6DId34n4W9EI11KFZJ-Gm2G0sU8_JxgG5KTCmxHBRuXc4BOs2ZTlRq1dcp7izegcyy-TpaPwdL1PlteCXApTe-kYkDV_MHp2GOqhKRJQtP60FiNoG3ZmGH_-us_5mdpq48a_ip7YFlJ44Y3yeHLfG8vcYSS_19e10zZfnyq39ueLBFrixPPC5fm1N_8lSliZkOxU7Vr_erx295TDRoUzbsZtSmW_frWsXH5UKADlcDpQAGw-x5sN6DHmrgeVWhrie8rVzm7V2LA-9B7lc8cESiUpeCk9o7XZDDMHXVpZt6duFxf1tqkE4ufq5o2wNLnQmULEJCCvHEOD334OD4-gjvKT-ROKNiHsIVZObYGSnPjKoRS8ntCnqnoFborE7iEL-E0X_n-rGFg3MVUiVsyMarHoqYyVgSNKtrAYEwDuXBx2wiGZIc6M-zaxsoz4lmzXbHuSLJ3zE5fmSEXXAhn8tMSMS14b5FAb7pimiBpzJIB9fsgWa94R8USzDiHfa1maH6Z__kX3kyoE8IFAAA=.eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVdFU1QtVVMtcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJlbWJlZEZlYXR1cmVzIjp7Im1vZGVybkVtYmVkIjpmYWxzZX19";
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
      renderVisualsResize: bindActionCreators(
        chartsActions.renderVisualsResize,
        dispatch
      ),
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EmbedChart);
