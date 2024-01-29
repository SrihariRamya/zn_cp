import React from 'react';
import { Button } from 'antd';
import Logo from '../../assets/logos/zupain-help-logo.png';

function HelpHeader() {
  return (
    <div className="help-header flex-bwn">
      <img src={Logo} alt="zupain-help-logo" />
      <a target="_blank" href="/simulation-phase" rel="noreferrer">
        <Button className="virtual-demo-btn">Try our virtual demo</Button>
      </a>
    </div>
  );
}

export default HelpHeader;
