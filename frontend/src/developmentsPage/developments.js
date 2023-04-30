import React from 'react';
import Button from 'react-bootstrap/Button';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import RemoveDialog from '../common/removeDialog'
import Constants from '../common/constants'
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import AddDevelopmentForm from './addDevelopmentForm'
import UpdateDevelopmentForm from './updateDevelopmentForm'
import { Formik } from 'formik';
import '../css/bootstrap-4-3-1.css'
import '../css/styles.css'
import '../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

const cellEditProp = {
  mode: 'click',
  blurToSave: true
};

function multilineCell(cell, row) {
    return "<textarea class='form-control cell' rows='2'>" + cell +"</textarea>";
}

class Developments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoaded: false,
        committeeFilter: 0,
        cathFilter: 0,
        data:[],
        authors: [],
        sortName: undefined,
        sortOrder: undefined,
        caths: [],
        committees: [],
        availableCommittees: [],
        development_id: 0
    };
    this.onSortChange = this.onSortChange.bind(this);
    this.actionFormatter = this.actionFormatter.bind(this);
    this.handleToUpdate = this.handleToUpdate.bind(this);
    this.updateData = this.updateData.bind(this);
    this.resetFilter = this.resetFilter.bind(this);
    this.setDevelopment = this.setDevelopment.bind(this);
  }

  nameFormatter(cell, row, enumObject){
    return (
      multilineCell(cell, row)
    )
  }

  onSortChange(sortName, sortOrder) {
    this.setState({
      sortName,
      sortOrder
    });
  }

  componentDidMount() {
    Promise.all([
        this.getCurrentCommittee()
      ])
      .then(result => this.updateData())
  }

  updateData(){
    let url = "/getDevelopments?committee=" + this.state.committeeFilter.toString() +
      "&cath=" + this.state.cathFilter.toString();
    Promise.all([
        this.updateCathData(),
        this.updateCommitteeData(),
        this.updateAuthors(),
        this.getAvailableCommittees()
      ])
      .then(result => {
        fetch(url)
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({
                isLoaded: true,
                data: result
              });
            },
            (error) => {
              this.setState({
                isLoaded: true,
                error
              });
            }
          )
        }
      )
  }

  updateCathData(){
    return fetch("/getCaths")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            caths: result
          })
        },
        (error) => {
            alert('Не получилось загрузить список кафедр!');
        }
      );
  }

  updateAuthors(){
    return fetch("/getAuthors")
      .then(res => res.json())
      .then(
        (result) => {
          var authorsRes = []
          Object.keys(this.state.caths).map((key, index) => (
            authorsRes.push({label: this.state.caths[key].Index,
              children: result
                .filter(value => value.CathId == this.state.caths[key].Id)
                .map(item => ({value: item.FullName}))})
          ))

          this.setState({
            authors: authorsRes
          })
        },
        (error) => {
            alert('Не получилось загрузить список авторов!');
        }
      );
  }

  updateCommitteeData(){
    return fetch("/getCommittees")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            committees: result
          });
        },
        (error) => {
            alert('Не получилось загрузить список МК!');
        }
      );
  }

  getAvailableCommittees(){
    return fetch("/getAvailableCommittees")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            availableCommittees: result
          });
        },
        (error) => {
            alert('Не получилось загрузить список МК!');
        }
      );
  }

  getCurrentCommittee(){
    return fetch("/getCurrentCommitteeId")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            committeeFilter: result
          })
        },
        (error) => {
            alert('Не получилось загрузить текущую МК!');
        }
      );
  }

  authorFormatter(cell, row, enumObject) {
    try{
      let res = cell[0].ShortName
      for (var i = 1; i < cell.length; i++) {
        res += '<br \/>' + cell[i].ShortName
      }

      return(
        res
      )
    }
    catch{
      return ''
    }
  }

  stateFormatter(cell, row, enumObject) {
    let docLoaded = <Button variant="success" block disabled>Загружено</Button>;
    if (!row.Review){
      docLoaded = <Button variant="danger" block disabled>Нет сопр. док.</Button>;
    }
    if (!row.Review2){
      docLoaded = <Button variant="danger" block disabled>Нет сопр. док.</Button>;
    }
    if (!row.CathResolution){
      docLoaded = <Button variant="danger" block disabled>Нет сопр. док.</Button>;
    }
    if (!row.DeanaryResolution){
      docLoaded = <Button variant="danger" block disabled>Нет сопр. док.</Button>;
    }

    if (cell == 10){
      return(
        <div>
          <Button variant="danger" block disabled>{Constants.developmentState[cell]}</Button>
          {docLoaded}
        </div>
      )
    }
    if (cell == 0){
      return(
        <div>
          <Button variant="secondary" block disabled>{Constants.developmentState[cell]}</Button>
          {docLoaded}
        </div>
      )
    }
    if (cell == 1){
      return(
        <div>
          <Button variant="danger" block disabled>{Constants.developmentState[cell]}</Button>
          {docLoaded}
        </div>
      )
    }
    if (cell == 2){
      return(
        <div>
          <Button variant="warning" block disabled>{Constants.developmentState[cell]}</Button>
          {docLoaded}
        </div>
      )
    }
    if (cell == 3){
      return(
        <div>
          <Button variant="primary" block disabled>{Constants.developmentState[cell]}</Button>
          {docLoaded}
        </div>
      )
    }
    if (cell == 4){
      return(
        <div>
          <Button variant="success" block disabled>{Constants.developmentState[cell]}</Button>
          Рег. номер: <br/> {row.Number}
        </div>
      )
    }
  }

  resetFilter(){
    this.setState({committeeFilter: 0, cathFilter: 0},
      () => this.updateData());
  }

  find(){
    this.updateData();
  }

  setDevelopment(dev_id){
    this.setState({development_id: dev_id});
  }

  actionFormatter(cell, row, enumObject) {
    return(
      <Button variant='primary' block onClick={ () => {
          Promise.all([
            this.setState({development_id: cell})
          ])
        }
      }>
      Рецензирование</Button>
    )
  }

  handleToUpdate(){
    this.updateData();
    this.forceUpdate()
  }

  render() {
    const options = {
      sortName: this.state.sortName,
      sortOrder: this.state.sortOrder,
      onSortChange: this.onSortChange,
      noDataText: 'Данные не найдены'
    };

    if (this.state.development_id == 0){
      return (
        <div>
          <div className="border rounded form-filter">
            <Formik
              onSubmit={() => {
                  this.find();
                }
              }
            >
              {({
                handleSubmit,
                handleChange,
                handleBlur,
                values,
                touched,
                isValid,
                errors,
              }) => (
                <Form onSubmit={handleSubmit}>
                  <Form.Row>
                    <Form.Group as={Col} controlId="committeeFilter">
                      <Form.Label>Метод. комиссия</Form.Label>
                      <Form.Control as="select"
                        name="committeeFilter"
                        value={values.committeeFilter}
                        onChange={(e) => {this.setState({committeeFilter: e.target.value})}}
                        >
                        <option value='0' selected={'0' == this.state.committeeFilter.toString()?'selected':''}>
                          Не выбрана</option>
                        {
                          Object.keys(this.state.committees).map((key, index) => (
                              <option value={this.state.committees[key].Id}
                                selected={this.state.committees[key].Id == this.state.committeeFilter?'selected':''}>
                                {this.state.committees[key].Date}</option>
                          ))
                        }
                      </Form.Control>
                    </Form.Group>

                    <Form.Group as={Col} controlId="cathFilter">
                      <Form.Label>Кафедра</Form.Label>
                      <Form.Control as="select"
                        name="cathFilter"
                        value={values.cathFilter}
                        onChange={(e) => {this.setState({cathFilter: e.target.value})}}
                        >
                        <option value='0' selected={'0' == this.state.cathFilter.toString()?'selected':''}>
                          Не выбрана</option>
                        {
                          Object.keys(this.state.caths).map((key, index) => (
                              <option value={this.state.caths[key].Id}
                                selected={this.state.caths[key].Id == this.state.cathFilter?'selected':''}>
                                {this.state.caths[key].Index}</option>
                          ))
                        }
                      </Form.Control>
                    </Form.Group>
                  </Form.Row>

                  <div class="d-flex flex-row-reverse">
                    <Button type="submit">Найти</Button>
                    <Button variant="secondary" onClick={() => this.resetFilter()}>Сбросить</Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <BootstrapTable data={this.state.data} options={options}
            pagination striped hover>
            <TableHeaderColumn isKey dataField='Id' width='90' dataAlign ='center'
              dataSort headerAlign='center'>ID
            </TableHeaderColumn>
            <TableHeaderColumn dataField='Authors' dataSort headerAlign='center' width='180'
              dataFormat={ this.authorFormatter }>
              Авторы
            </TableHeaderColumn>
            <TableHeaderColumn dataField='Name' headerAlign='center' width='450'
              dataFormat={ this.nameFormatter }
              filter={ { type: 'TextFilter', delay: 1000, placeholder: 'Введите название' } }>
              Название</TableHeaderColumn>
            <TableHeaderColumn dataField='Reviewer' headerAlign='center'
              filter={ { type: 'TextFilter', delay: 1000, placeholder: 'Введите' } }>Рецензент
            </TableHeaderColumn>
            <TableHeaderColumn dataField='State' headerAlign='center'
              dataFormat={ this.stateFormatter } dataAlign='center' width='180'
              filter={ { type: 'SelectFilter', options: Constants.developmentState,
               placeholder: 'Выберите' } }>Состояние
            </TableHeaderColumn>
            <TableHeaderColumn dataField='Id' dataFormat={ this.actionFormatter } width='200'>
              <AddDevelopmentForm
                committees={this.state.availableCommittees}
                handleToUpdate={this.handleToUpdate}
                caths={this.state.caths}/>
            </TableHeaderColumn>
            <TableHeaderColumn dataField='Number' hidden></TableHeaderColumn>
          </BootstrapTable>
        </div>
      )
    }
    else{
      return (
        <UpdateDevelopmentForm
          mode='moderator'
          developmentId={this.state.development_id}
          caths={this.state.caths}
          handleToUpdate={this.handleToUpdate}
          exit={() => { this.setDevelopment(0); this.handleToUpdate(); }}/>
      )
    }
  }
}

export default Developments;
