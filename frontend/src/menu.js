import React from 'react';
import history from './common/history';
import ListGroup from 'react-bootstrap/ListGroup';
import './css/bootstrap-4-3-1.css'

class Menu extends React.Component {
  logout() {
    fetch("/signOut",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST'
      })
    .then(response => {
      localStorage.removeItem("role");
      history.push('/')
    })
    .catch(error => console.error(error))
  }

  render() {
    return (
        <ListGroup>
          {this.props.items.filter( (item) => item.roles.indexOf(this.props.role) != -1)
            .map(item =>
              <ListGroup.Item action href={item.link}>
                {item.name}
              </ListGroup.Item>
          )}
          <ListGroup.Item action onClick={() => this.logout()}>Выход</ListGroup.Item>
        </ListGroup>
    )
  }
}

export default Menu;
