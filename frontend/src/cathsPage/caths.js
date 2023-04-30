import React from 'react';
import Button from 'react-bootstrap/Button';
import ToggleButton from 'react-bootstrap/ToggleButton'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import RemoveDialog from '../common/removeDialog'
import Constants from '../common/constants'
import AddCathForm from './addCathForm'
import '../css/bootstrap-4-3-1.css'
import '../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

const cellEditProp = {
  mode: 'click',
  blurToSave: true
};

const validType = {
  true: 'Да',
  false: 'Нет'
}

class Caths extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        isLoaded: false,
        data:[],
        sortName: undefined,
        sortOrder: undefined,
    };
    this.onSortChange = this.onSortChange.bind(this);
    this.actionFormatter = this.actionFormatter.bind(this);
    this.validFormatter = this.validFormatter.bind(this);
    this.handleToUpdate = this.handleToUpdate.bind(this);
    this.switchCathValid = this.switchCathValid.bind(this);
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
    fetch("/getCaths")
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

  switchCathValid(idInput, validInput) {
    fetch("/setCathValid",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({id: idInput, valid: validInput})
      })
      .then(
        (result) => {
          this.updateData()
        },
        (error) => {
          alert('Не получилось изменить состояние кафедры!')
        }
      );
  }

  actionFormatter(cell, row, enumObject) {
    return(
      <div>
        <Button  variant={row.Valid ? 'danger':'success'}
          style={{ paddingLeft: 25, paddingRight: 25 }}
          onClick={ () => {this.switchCathValid(row.Id, !row.Valid)} }>
        Вкл/Выкл</Button>
      </div>
    )
  }

  validFormatter(cell, row) {
    if (cell){
      return 'Да'
    }
    return 'Нет'
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
            dataSort headerAlign='center'>ID
          </TableHeaderColumn>
          <TableHeaderColumn dataField='Index' dataSort headerAlign='center' width='180'
            filter={ { type: 'TextFilter', delay: 1000 , placeholder: 'Введите индекс'} }>
            Индекс кафедры
          </TableHeaderColumn>
          <TableHeaderColumn dataField='Name' headerAlign='center' width='580'
            filter={ { type: 'TextFilter', delay: 1000, placeholder: 'Введите название' } }>
            Название кафедры</TableHeaderColumn>
          <TableHeaderColumn dataField='Valid' dataFormat={ this.validFormatter }
            filter={ { type: 'SelectFilter', options: validType, placeholder: 'Выберите' } }
            headerAlign='center' width='150'>Действующая
          </TableHeaderColumn>
          <TableHeaderColumn dataField='Id' dataFormat={ this.actionFormatter }>
            <AddCathForm handleToUpdate = {this.handleToUpdate}></AddCathForm>
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    )
  }
}

export default Caths;
