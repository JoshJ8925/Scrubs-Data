import React from "react";
import localeInfo from "rc-pagination/lib/locale/en_US";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import SysAdminProviders from "./SysAdminProviders";
import SysAdminPractices from "./SysAdminPractices";
import SysAdminProvidersList from "./SysAdminProvidersList";
import SysAdminPracticesList from "./SysAdminPracticesList";
import SysAdminProfilesList from "./SysAdminProfilesList";
import PropTypes from "prop-types";
import SysAdminUsers from "./SysAdminUsers";
import * as providersService from "../../services/providersService";
import * as practiceService from "../../services/practiceService";
import * as userProfilesService from "../../services/userProfilesService";
import * as sysAdminService from "../../services/sysAdminService";
import * as locationServices from "../../services/locationServices";
import DataVisualization from "../../components/DataVisualization/DataVisualization";
import DoughnutGraph from "../surveyQuestions/DoughnutGraph";
import BarGraph from "../surveyQuestions/BarGraph";
import logger from "sabio-debug";
const _logger = logger.extend("SysAdminDashboard");

export default class SysAdminDashboard extends React.Component {
  state = {
    pageIndex: 0,
    pageSize: 12,
    currentProvPage: 1,
    currentPracPage: 1,
    currentSysAdminPage: 1,
    providers: {
      compliant: 0,
      nonCompliant: 0,
      totalCount: 0
    },

    stateOptions: [],
    stateId: 0,
    providers01: "",
    graphs: [<DoughnutGraph key="dougnutGraph" />, <BarGraph key="barGraph" />],
    currentGraph: 1
  };

  componentDidMount() {
    this.getCompliant();
    this.getStates();
    this.getSysProviders(this.state.pageIndex, this.state.pageSize);
    this.getSysPractices(this.state.pageIndex, this.state.pageSize);
    this.getSysAdminProfiles(this.state.pageIndex, this.state.pageSize);
  }

  getSysProviders = (pageIndex, pageSize) => {
    providersService
      .getSysProviders(pageIndex, pageSize)
      .then(this.getSysProvidersSuccess)
      .catch(this.onError);
  };

  getSysProvidersSuccess = response => {
    let provCompInfo = response.item.pagedItems;
    this.setState({
      providerList: provCompInfo.map(this.provCompMapper),
      totalProv: response.item.totalCount - 6
    });
  };

  provCompMapper = data => (
    <SysAdminProvidersList providerList={data} key={`pl-${data.id}`} />
  );

  getSysPractices = (pageIndex, pageSize) => {
    practiceService
      .getAll(pageIndex, pageSize)
      .then(this.getSysPracticesSuccess)
      .catch(this.onError);
  };

  getSysPracticesSuccess = response => {
    let pracCompInfo = response.pagedItems;
    this.setState({
      practiceList: pracCompInfo.map(this.pracCompMapper),
      totalPrac: response.totalCount - 6
    });
  };

  pracCompMapper = data => (
    <SysAdminPracticesList practiceList={data} key={`prl-${data.id}`} />
  );

  getSysAdminProfiles = (pageIndex, pageSize) => {
    userProfilesService
      .getAllRoles(pageIndex, pageSize, 1)
      .then(this.getSysAdminProfilesSuccess)
      .catch(this.onError);
  };

  getSysAdminProfilesSuccess = response => {
    let sysAdminComp = response.pagedItems;
    const sysAdminList = sysAdminComp.map(this.sysAdminCompMapper);
    this.setState({
      sysAdminList,
      totalSysAdmin: response.totalCount
    });
  };

  sysAdminCompMapper = data => <SysAdminProfilesList sysAdminList={data} />;

  pushUsers = () => {
    this.props.history.push("/users");
  };

  pushPractices = () => {
    this.props.history.push("/practices");
  };

  handleProviderChange = page => {
    this.setState(
      {
        currentProvPage: page
      },
      this.getSysProviders(page - 1, this.state.pageSize)
    );
  };

  handlePracticeChange = page => {
    this.setState(
      {
        currentPracPage: page
      },
      this.getSysPractices(page - 1, this.state.pageSize)
    );
  };

  handleSysAdminChange = page => {
    this.setState(
      {
        currentSysAdminPage: page
      },
      this.getSysAdminProfiles(page - 1, this.state.pageSize)
    );
  };

  getCompliant = () => {
    sysAdminService
      .getCompliantProviders()
      .then(this.getCompliantSuccess)
      .catch(this.onError);
  };

  getCompliantSuccess = ({ item }) => {
    this.setState(prevState => {
      return {
        ...prevState,
        providers: {
          compliant: item.compliant,
          nonCompliant: item.nonCompliant,
          totalCount: item.totalCount
        }
      };
    });
  };

  renderState = state => {
    return (
      <option key={state.id} value={state.id}>
        {state.name}
      </option>
    );
  };

  getStates = () => {
    locationServices
      .getAllStates()
      .then(this.getStatesSuccess)
      .catch(this.onError);
  };
  getStatesSuccess = ({ data }) => {
    this.setState(prevState => {
      return {
        ...prevState,
        stateOptions: data.items.map(this.renderState)
      };
    });
  };

  sortCompliantProvidersByState = id => {
    sysAdminService
      .getCompliantProvidersByState(id)
      .then(this.sortByStateSuccess)
      .catch(this.onError);
  };
  sortByStateSuccess = ({ item }) => {
    _logger("sort by state success", item);
    this.setState(prevState => {
      return {
        ...prevState,
        providers: {
          ...prevState.providers,
          compliant: item.compliant,
          nonCompliant: item.nonCompliant,
          totalCount: item.totalCount
        }
      };
    });
  };
  onHandleStateChange = e => {
    let value = e.target.value;
    let name = e.target.name;
    this.setState(prevState => {
      return {
        ...prevState,
        [name]: value
      };
    });
    if (value > 0) {
      this.sortCompliantProvidersByState(value);
    } else {
      this.getCompliant();
    }
  };

  changeGraph = index => {
    this.setState({ currentGraph: index });
  };

  onError = errResponse => {
    _logger(errResponse);
  };
  render() {
    return (
      <>
        <div className="page-content container-fluid">
          <div>
            <div className="row">
              <div className="col-sm-12 col-lg-4">
                <div className="bg-cyan card card-hover">
                  <div className="card-body">
                    <SysAdminProviders
                      providers={this.state.providers}
                      stateOptions={this.state.stateOptions}
                      stateId={parseInt(this.state.stateId)}
                      stateChange={this.onHandleStateChange}
                    />
                  </div>
                </div>
              </div>
              <div className="col-sm-12 col-lg-4" onClick={this.pushUsers}>
                <div className="bg-orange card card-hover">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="mr-2">
                        <h1 className="mb-0">
                          <i className="fas fa-users text-white" />
                        </h1>
                      </div>
                      <div>
                        <h6 className="font-20 text-white mb-1 op-7">Users</h6>
                        <h6 className="font-10 text-white font-medium mb-0">
                          Click to view more.
                        </h6>
                      </div>
                    </div>
                    <div className="text-center text-white mt-4 row">
                      <SysAdminUsers />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-sm-12 col-lg-4" onClick={this.pushPractices}>
                <div className="bg-info card card-hover">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="mr-2">
                        <h1 className="mb-0">
                          <i className="mdi mdi-contacts text-white" />
                        </h1>
                      </div>
                      <div>
                        <h6 className="font-20 text-white mb-1 op-7">
                          Practices
                        </h6>
                        <h6 className="font-10 text-white font-medium mb-0">
                          Click to view more.
                        </h6>
                      </div>
                    </div>
                    <div className="text-center text-white mt-4 row">
                      <SysAdminPractices />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="card card-hover">
                  <div className="card-body">
                    <div className="d-md-flex align-items-center justify-content-center">
                      <div>
                        <div className="card-title ml-0">Survey</div>
                        <div className="card-subtitle">Overview of Results</div>
                      </div>
                    </div>
                    <div>
                      <button
                        className="btn"
                        onClick={() => {
                          this.changeGraph(1);
                        }}
                      >
                        Bar Graph
                      </button>
                      <button
                        className="btn"
                        onClick={() => {
                          this.changeGraph(0);
                        }}
                      >
                        Donut Graph
                      </button>
                    </div>
                    {this.state.graphs[this.state.currentGraph]}
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12 col-lg-6">
                <div className="card card-hover" style={{ height: "96.60%" }}>
                  <div className="card-body">
                    <div className="d-md-flex align-items-center">
                      <div>
                        <div className="card-title ml-0">Medical Providers</div>
                        <div className="card-subtitle">List of Providers</div>
                      </div>
                    </div>
                    <div className="tab-content mt-3">
                      <div className="tab-pane active">
                        <div className="row">
                          <div className="col-sm-12">
                            <div>
                              <div className="table-responsive">
                                <table className="v-middle table">
                                  <thead>
                                    <tr>
                                      <th className="border-top-0">Title</th>
                                      <th className="border-top-0">Name</th>
                                      <th className="border-top-0">Gender</th>
                                      <th className="border-top-0">Email</th>
                                    </tr>
                                  </thead>
                                  <tbody>{this.state.providerList}</tbody>
                                </table>
                              </div>
                            </div>
                            <div className="row justify-content-center">
                              <Pagination
                                defaultCurrent={this.state.currentProvPage}
                                total={this.state.totalProv}
                                onChange={this.handleProviderChange}
                                locale={localeInfo}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-sm-12 col-lg-6">
                <div className="card card-hover" style={{ height: "96.60%" }}>
                  <div className="card-body">
                    <div className="d-md-flex align-items-center">
                      <div>
                        <div className="card-title ml-0">Practices</div>
                        <div className="card-subtitle">List of Practices</div>
                      </div>
                    </div>
                    <div className="tab-content mt-3">
                      <div className="tab-pane active">
                        <div className="row">
                          <div className="col-sm-12">
                            <div>
                              <div className="table-responsive">
                                <table className="v-middle table">
                                  <thead>
                                    <tr>
                                      <th className="border-top-0">Name</th>
                                      <th className="border-top-0">Email</th>
                                      <th className="border-top-0">State</th>
                                    </tr>
                                  </thead>
                                  <tbody>{this.state.practiceList}</tbody>
                                </table>
                              </div>
                            </div>
                            <div className="row justify-content-center">
                              <Pagination
                                defaultCurrent={this.state.currentPracPage}
                                total={this.state.totalPrac}
                                onChange={this.handlePracticeChange}
                                locale={localeInfo}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12 col-lg-6">
                <div className="card card-hover " style={{ height: "96.60%" }}>
                  <div className="card-body ">
                    <div className="d-md-flex align-items-center">
                      <div>
                        <div className="card-title ml-0 ">
                          System Admin Users
                        </div>
                        <div className="card-subtitle ">
                          List of System Admin Users
                        </div>
                      </div>
                    </div>
                    <div className="tab-content mt-3">
                      <div className="tab-pane active">
                        <div className="row">
                          <div className="col-sm-12">
                            <div>
                              <div className="table-responsive ">
                                <table className="v-middle table">
                                  <thead>
                                    <tr>
                                      <th className="border-top-0">Title</th>
                                      <th className="border-top-0">Name</th>
                                      <th className="border-top-0">Gender</th>
                                      <th className="border-top-0">Email</th>
                                    </tr>
                                  </thead>
                                  <tbody>{this.state.sysAdminList}</tbody>
                                </table>
                              </div>
                            </div>
                            <div className="row justify-content-center ">
                              <Pagination
                                defaultCurrent={this.state.currentSysAdminPage}
                                total={this.state.totalSysAdmin}
                                onChange={this.handleSysAdminChange}
                                locale={localeInfo}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DataVisualization />
        </div>
      </>
    );
  }
}
SysAdminDashboard.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func
  })
};
