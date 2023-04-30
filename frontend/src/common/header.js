import React from 'react';
import header from '../images/header.png'
import '../css/bootstrap-4-3-1.css'

class Header extends React.Component {
  render() {
    return (
      <img src={header} width="100%"></img>
    )
  }
}

export default Header;
