import React, { Component } from 'react';

export default class FacebookLogin extends Component {
  componentDidMount() {
    document.addEventListener('FBObjectReady', this.initializeFacebookLogin);
  }

  componentWillUnmount() {
    document.removeEventListener('FBObjectReady', this.initializeFacebookLogin);
  }

  /**
   * Init FB object and check Facebook Login status
   */
  initializeFacebookLogin = () => {
    console.log('initial');
    this.FB = window.FB;
    this.checkLoginStatus();
  };

  /**
   * Check login status
   */
  checkLoginStatus = () => {
    this.FB.getLoginStatus(this.facebookLoginHandler);
  };

  /**
   * Check login status and call login api is user is not logged in
   */
  facebookLogin = () => {
    if (!this.FB) return;

    this.FB.getLoginStatus((response) => {
      console.log('response', response);
      if (response.status === 'connected') {
        this.facebookLoginHandler(response);
      } else {
        this.FB.login(this.facebookLoginHandler, {
          scope:
            'public_profile,email,manage_pages,publish_pages,pages_show_list,pages_manage_posts,user_posts,read_insights',
          return_scopes: true,
        });
      }
    });
  };

  /**
   * Handle login response
   */
  facebookLoginHandler = (response) => {
    console.log('login res', response);
    if (response.status === 'connected') {
      this.FB.api('/me', (userData) => {
        const result = {
          ...response,
          user: userData,
        };
        this.props.onLogin(true, result);
      });
    } else {
      this.props.onLogin(false);
    }
  };

  render() {
    const { children } = this.props;
    return <div onClick={this.facebookLogin}>{children}</div>;
  }
}
