import React from 'react';
import Header from './common/header';
import Menu from './menu';
import Users from './usersPage/users'
import Caths from './cathsPage/caths'
import Authors from './authorsPage/authors'
import Developments from './developmentsPage/developments'
import MyDevelopments from './myDevelopmentsPage/myDevelopments'
import Reports from './reportsPage/reports'
import Committees from './committeesPage/committees'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import './css/styles.css'

var items = [
  {
    "name": "Мои разработки",
    "link": "#link_my_developments",
    "roles": [0, 1, 2]
  },
  {
    "name": "Методич. разработки",
    "link": "#link_developments",
    "roles": [0, 1]
  },
  {
    "name": "Список МР",
    "link": "#link_report",
    "roles": [0, 1, 2]
  },
  {
    "name": "Метод. комиссии",
    "link": "#link_committees",
    "roles": [0, 1]
  },
  {
    "name": "Авторы",
    "link": "#link_authors",
    "roles": [0, 1]
  },
  {
    "name": "Кафедры",
    "link": "#link_caths",
    "roles": [0]
  },
  {
    "name": "Пользователи",
    "link": "#link_users",
    "roles": [0]
  }
]

class MainComponent extends React.Component {
  constructor(props){
    super(props);
    this.state={role: this.props.getRole()}
    if (this.state.role >= 0){
      localStorage.setItem("role", this.props.getRole());
    }
  }

  componentDidMount(){
    this.setState({role: parseInt(localStorage.getItem("role"), 10)})
  }

  render() {
    return (
      <div>
        <Header />
        <Row>
          <Tab.Container id="menu" defaultActiveKey="#link_my_developments">
            <Row>
              <Col md={2}>
                <Menu items={items} role={this.state.role}/>
              </Col>

              <Col sm={10}>
                <Tab.Content>
                  <Tab.Pane eventKey="#link_developments" unmountOnExit='true' mountOnEnter='true'>
                    <Developments />
                  </Tab.Pane>

                  <Tab.Pane eventKey="#link_my_developments" unmountOnExit='true' mountOnEnter='true'>
                    <MyDevelopments />
                  </Tab.Pane>

                  <Tab.Pane eventKey="#link_report" unmountOnExit='true' mountOnEnter='true'>
                    <Reports />
                  </Tab.Pane>

                  <Tab.Pane eventKey="#link_committees" unmountOnExit='true' mountOnEnter='true'>
                    <Committees />
                  </Tab.Pane>

                  <Tab.Pane eventKey="#link_authors" unmountOnExit='true' mountOnEnter='true'>
                    <Authors />
                  </Tab.Pane>

                  <Tab.Pane eventKey="#link_caths" unmountOnExit='true' mountOnEnter='true'>
                    <Caths />
                  </Tab.Pane>

                  <Tab.Pane eventKey="#link_users" unmountOnExit='true' mountOnEnter='true'>
                    <Users />
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Row>
      </div>
    )
  }
}

export default MainComponent;
