import React from 'react';
import Button from 'react-bootstrap/Button';
import ToggleButton from 'react-bootstrap/ToggleButton'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import Constants from '../common/constants'
import AddCommitteeForm from './addCommitteeForm'
import '../css/bootstrap-4-3-1.css'
import '../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

const cellEditProp = {
  mode: 'click',
  blurToSave: true
};

class Committees extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoaded: false,
        data:[],
        sortName: undefined,
        sortOrder: undefined,
    };
    this.onSortChange = this.onSortChange.bind(this);
    this.stateFormatter = this.stateFormatter.bind(this);
    this.actionFormatter = this.actionFormatter.bind(this);
    this.handleToUpdate = this.handleToUpdate.bind(this);
    this.updateData = this.updateData.bind(this);
  }

  onSortChange(sortName, sortOrder) {
    this.setState({
      sortName,
      sortOrder
    });
  }

  componentDidMount() {
    this.updateData();
  }

  updateData(){
    fetch("/getCommittees")
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

  onStateUpdate(id, state){
    fetch("/setCommitteeState",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({'id': id, 'state': state})
      })
      .then(data => {
        this.updateData();
      })
      .catch(error => {
        console.error(error);
        alert('Не получилось обновить МК!');
      })
  }

  actionFormatter(cell, row, enumObject) {
    if (row.State == 0){
      return(
        <Button variant="danger" block onClick={() => this.onStateUpdate(row.Id, row.State+1)}>
          Заблокировать</Button>
      )
    }
    if (row.State == 1){
      return(
        <Button variant="warning" block onClick={() => this.onStateUpdate(row.Id, row.State+1)}>
          Подготовить</Button>
      )
    }
    if (row.State == 2){
      return(
        <Button variant="primary" block onClick={() => this.onStateUpdate(row.Id, row.State+1)}>
          Провести</Button>
      )
    }
    if (row.State == 3){
      return(
        <Button variant="success" disabled block
          onClick={() => this.onStateUpdate(row.Id, row.State+1)}>
          Проведена</Button>
      )
    }

    return(
      <div></div>
    )
  }

  stateFormatter(cell, row, enumObject) {
    if (cell == 0){
      return(
        <Button variant="primary" block disabled>{Constants.committeeState[cell]}</Button>
      )
    }
    if (cell == 1){
      return(
        <Button variant="warning" block disabled>{Constants.committeeState[cell]}</Button>
      )
    }
    if (cell == 2){
      return(
        <Button variant="success" block disabled>{Constants.committeeState[cell]}</Button>
      )
    }
    if (cell == 3){
      return(
        <Button variant="success" block disabled>{Constants.committeeState[cell]}</Button>
      )
    }

    return(
      <div></div>
    )
  }

  developmentsFormatter(cell, row, enumObject){
    if (row.State < 2){
      return (
        <div>Количество МР: {cell}</div>
      )
    }
    else{
      return(
        <div>
          <a href={Constants.fileStoragePath+"prot/"+row.Id+".docx"}>
            <Button variant="primary">Форма 1</Button></a>
          <a href={Constants.fileStoragePath+"prot/"+row.Id+".xls"}>
            <Button variant="primary">Форма 2</Button></a>
        </div>
      )
    }
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

    return (
      <div>
        <BootstrapTable data={this.state.data} options={options}
          pagination striped hover>
          <TableHeaderColumn isKey dataField='Id' width='90' dataAlign ='center'
            isKey dataSort headerAlign='center'>ID
          </TableHeaderColumn>
          <TableHeaderColumn dataField='Date' dataSort headerAlign='center' width='300'>
            Дата
          </TableHeaderColumn>
          <TableHeaderColumn dataField='Number' dataSort headerAlign='center' width='150'>
            Номер
          </TableHeaderColumn>
          <TableHeaderColumn dataField='DevQuantity' dataFormat={ this.developmentsFormatter }
            headerAlign='center' dataAlign ='left'>
            Метод. разработки
          </TableHeaderColumn>
          <TableHeaderColumn dataField='State' headerAlign='center' dataAlign ='center'
             dataFormat={ this.stateFormatter } width='200'>
            Статус
          </TableHeaderColumn>
          <TableHeaderColumn dataField='Id' dataFormat={ this.actionFormatter }
            dataAlign ='center' headerAlign='center' width='200'>
            <AddCommitteeForm handleToUpdate = {this.handleToUpdate} />
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    )
  }
}

export default Committees;
