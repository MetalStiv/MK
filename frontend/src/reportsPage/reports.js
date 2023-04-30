import React from 'react';
import Constants from '../common/constants'
import Button from 'react-bootstrap/Button';
import Datetime from 'react-datetime';
import Col from 'react-bootstrap/Col';
import Picky from 'react-picky';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import '../css/bootstrap-4-3-1.css';
import '../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'react-datetime/css/react-datetime.css';

var moment = require('moment');
require('moment/locale/ru');

function multilineCell(cell, row) {
    return "<textarea class='form-control cell' rows='2'>" + cell +"</textarea>";
}

class Reports extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      data:[],
      sortName: undefined,
      sortOrder: undefined,
      caths: [],
      selectedCaths: [],
      startDate: moment().startOf('day').format("DD.MM.YYYY"),
      endDate: moment().endOf('day').format("DD.MM.YYYY"),
    };
    this.selectCath = this.selectCath.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleEndDateChange = this.handleEndDateChange.bind(this);
    this.updateCathData = this.updateCathData.bind(this);
    this.updateData = this.updateData.bind(this);
    this.cathFormatter = this.cathFormatter.bind(this);
  }

  componentDidMount() {
    Promise.all([
      this.updateCathData()
    ])
      .then(() => this.updateData());
  }

  updateData(){
    return fetch("/getReportDevelopments",
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: moment(this.state.startDate, "DD.MM.YYYY", true).format("YYYY-MM-DD"),
          endDate: moment(this.state.endDate, "DD.MM.YYYY", true).format("YYYY-MM-DD"),
          caths: this.state.selectedCaths.map(item => item.id)
        })
      })
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            data: result
          })
        },
        (error) => {
            alert('Не получилось загрузить список МУ!');
        }
      );
  }

  selectCath(value) {
    Promise.all([
      this.setState({ selectedCaths: value })
    ])
    .then(() => this.updateData())
  }

  handleStartDateChange(value){
    var d = moment(value, "DD.MM.YYYY", true);
    var y = isNaN(d.year());
    if (y == 'true'){
      return
    }
    this.setState({startDate: d}, () => this.updateData());
  }

  handleEndDateChange(value){
    var d = moment(value, "DD.MM.YYYY", true);
    var y = isNaN(d.year());
    if (y == 'true'){
      return
    }
    this.setState({endDate: d}, () => this.updateData());
  }

  updateCathData(){
    return fetch("/getValidCaths")
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

  stateFormatter(cell, row, enumObject) {
    if (cell == 10){
      return(
        <Button variant="danger" block disabled>{Constants.developmentState[cell]}</Button>
      )
    }
    if (cell == 0){
      return(
        <Button variant="secondary" block disabled>{Constants.developmentState[cell]}</Button>
      )
    }
    if (cell == 1){
      return(
        <Button variant="danger" block disabled>{Constants.developmentState[cell]}</Button>
      )
    }
    if (cell == 2){
      return(
        <Button variant="warning" block disabled>{Constants.developmentState[cell]}</Button>
      )
    }
    if (cell == 3){
      return(
        <Button variant="primary" block disabled>{Constants.developmentState[cell]}</Button>
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

  committeeFormatter(cell, row, enumObject){
    return (
      cell.Date
    )
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

  cathFormatter(cell, row, enumObject) {
    try{
      let res = this.state.caths
        .filter(item => item.Id == cell[0].CathId)
        .map(item => item.Index)
      for (var i = 1; i < cell.length; i++) {
        let val = this.state.caths
          .filter(item => item.Id == cell[i].CathId)
          .map(item => item.Index)
        if (res.indexOf(val) > -1){
          res += '<br \/>' + val
        }
      }
      return(
        res
      )
    }
    catch{
      return ''
    }
  }

  nameFormatter(cell, row, enumObject){
    return (
      multilineCell(cell, row)
    )
  }

  render() {
    const options = {
      sortName: this.state.sortName,
      sortOrder: this.state.sortOrder,
      onSortChange: this.onSortChange,
      noDataText: 'Данные не найдены'
    };

    return (
      <div>
        <div class='row'>
          <div class="col-md-3 row">
            <Col md={6}>Приняты с</Col>
            <Col md={6}>
              <Datetime
                locale="ru"
                dateFormat="DD.MM.YYYY"
                defaultHour={14}
                timeFormat={ false }
                value={this.state.startDate}
                onChange={this.handleStartDateChange}
              />
            </Col>
          </div>

          <div class="col-md-3 row">
            <Col md={6}>Приняты по</Col>
            <Col md={6}>
              <Datetime
                locale="ru"
                dateFormat="DD.MM.YYYY"
                defaultHour={14}
                timeFormat={ false }
                value={this.state.endDate}
                onChange={this.handleEndDateChange}
              />
            </Col>
          </div>

          <div class="col-md-4 row">
            <Col md={6}>Кафедра:</Col>
            <Col md={6}>
              <Picky
                value={this.state.selectedCaths}
                multiple={true}
                options={
                  Object.keys(this.state.caths).map((key, index) =>
                  {
                    var dict = {};
                    dict.id = this.state.caths[key].Id;
                    dict.index = this.state.caths[key].Index;
                    return dict;
                  })
                }
                valueKey="id"
                labelKey="index"
                includeSelectAll={true}
                includeFilter={true}
                onChange={this.selectCath}
                dropdownHeight={600}
                id="caths"
                name="caths"
              />
            </Col>
          </div>

        </div>

        <BootstrapTable data={this.state.data} options={options}
          striped hover>
          <TableHeaderColumn isKey dataField='Id' width='90' dataAlign ='center'
            isKey dataSort headerAlign='center'>ID
          </TableHeaderColumn>
          <TableHeaderColumn dataField='Authors' dataSort headerAlign='center' width='180'
            dataFormat={ this.authorFormatter }>
            Авторы
          </TableHeaderColumn>
          <TableHeaderColumn dataField='Authors' dataSort headerAlign='center' width='120'
            dataFormat={ this.cathFormatter }>
            Кафедра
          </TableHeaderColumn>
          <TableHeaderColumn dataField='Name' headerAlign='center' width='450' dataFormat={ this.nameFormatter }
            filter={ { type: 'TextFilter', delay: 1000, placeholder: 'Введите название' } }>
            Название</TableHeaderColumn>
          <TableHeaderColumn dataField='Committee' headerAlign='center' dataFormat={ this.committeeFormatter }
            filter={ { type: 'TextFilter', delay: 1000, placeholder: 'Введите' } }>Метод. комиссия
          </TableHeaderColumn>
          <TableHeaderColumn dataField='State' headerAlign='center'
            dataFormat={ this.stateFormatter } dataAlign='center' width='180'
            filter={ { type: 'SelectFilter', options: {3: 'Принятое', 4: 'Проведенное'},
             placeholder: 'Выберите' } }>Состояние
          </TableHeaderColumn>
        </BootstrapTable>

      </div>
    )
  }
}

export default Reports;
