import React from 'react';
import { FormGroup, Form, Row, Col, Input, Button } from 'reactstrap';
import img2 from '../../assets/images/everest.png';
import * as authService from '../../services/authService';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import logger from 'sabio-debug';
import './Lockscreen.css';

const _logger = logger.extend('Lockscreen');

const sidebarBackground = {
  backgroundImage: 'url(' + img2 + ')',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center'
};
class Lockscreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      password: '',
      isLoggedIn: true
    };
  }

  static getDerivedStateFromProps(props, state) {
    return { ...state, name: props.currentUser.name };
  }

  loginChangeHandler = (e) => {
    e.preventDefault();
    this.setState({
      password: e.target.value
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const userLogin = {
      ...this.state
    };

    authService.logInUser(userLogin).then(this.handleLogInSuccess).catch((err) => {
      this.handleLogInFailure(err);
    });
  };

  handleLogInSuccess = () => {
    Swal.fire({
      type: 'success',
      title: 'Login Success',
      text: 'Welcome back',
      timer: 1000
    });

    this.props.history.goBack();
  };

  onUserConfirmed = ({ item }) => {
    if (item.roles.includes('Office Manager')) {
      authService
        .getFirstLogin(item.id)
        .then((res) => this.getFirstLoginSuccess(res, item))
        .catch(this.getFirstLoginError);
    } else {
      this.props.history.push('/', {
        currentUser: { ...item, isLoggedIn: true },
        type: 'LOGIN'
      });
      if (item.roles.includes('SysAdmin')) {
        this.props.history.push('/sysAdminDashboard');
      } else if (item.roles.includes('Office Assistant')) {
        this.props.history.push('/dashboard');
      } else if (item.roles.includes('Provider')) {
        authService.getProviderId().then(this.getProviderSuccess).catch(this.getProviderFail);
      }
    }
  };

  onUserNotConfirmed = (err) => {
    _logger(err);
  };

  getProviderSuccess = ({ item }) => {
    this.props.history.push(`/providers/${item}/details`);
  };

  getProviderFail = (err) => {
    _logger(err);
    this.props.history.push('/providers');
  };

  getFirstLoginSuccess = (res, item) => {
    if (res.item.firstLogin) {
      _logger(res);
      authService
        .updateFirstLogin(res.item.officeManagerId)
        .then((res) => this.updateFirstLoginSuccess(res, item))
        .catch(this.updateFirstLoginError);
    } else {
      _logger(item);
      this.props.history.push('/', {
        currentUser: { ...item, isLoggedIn: true },
        type: 'LOGIN'
      });
      this.props.history.push('/dashboard');
    }
  };

  getFirstLoginError = (err) => {
    _logger(err);
  };

  updateFirstLoginSuccess = (item) => {
    this.props.history.push('/', {
      currentUser: { ...item, isLoggedIn: true },
      type: 'LOGIN'
    });
    this.props.history.push('/userprofiles');
  };

  updateFirstLoginError = (err) => {
    _logger(err);
  };

  handleLogInFailure = (err) => {
    _logger(err);
    Swal.fire({
      type: 'error',
      title: 'Invalid login credentials',
      text: 'Please try again.',
      timer: 2000
    });
  };

  goBackHandler = () => {
    this.props.history.goBack();
  };

  render() {
    return (
      <div>
        <div
          className="auth-wrapper d-flex no-block justify-content-center align-items-center"
          style={sidebarBackground}
        >
          <div className="auth-box opacity borders">
            <div id="lockscreen borders">
              <div className="logo ">
                <span className="db">
                  <img
                    src={this.props.location.state}
                    alt="logo"
                    className="rounded-circle bordersss"
                    width="100"
                  />
                </span>
              </div>

              <div className="textAlign">
                <p>WELCOME BACK : {this.props.currentUser.name}</p>
              </div>
              <Row>
                <Col xs="12">
                  <Form className="mt-3 textAlign " id="lockscreen" action="">
                    <FormGroup>
                      <div className="border">
                        <Input
                          className="border"
                          onChange={this.loginChangeHandler}
                          type="password"
                          name="password"
                          bsSize="lg"
                          id="password"
                          placeholder="Password"
                          required
                        />
                      </div>
                    </FormGroup>
                    <Row className="mb-4">
                      <Col xs="12">
                        <Button
                          onClick={this.handleSubmit}
                          color="buttonStyle"
                          size="lg"
                          type="submit"
                          className="text-uppercase textAlign buttonStyle"
                          block
                        >Log In
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
Lockscreen.propTypes = {
  currentUser: PropTypes.shape({
    name: PropTypes.string
  }),
  location: PropTypes.shape({
    state: PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string
    })
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
    goBack: PropTypes.func,
    action: PropTypes.func
  })
};
export default Lockscreen;
