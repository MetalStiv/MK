import React from 'react';
import Button from 'react-bootstrap/Button';
import AddUserForm from './addUserForm'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import RemoveDialog from '../common/removeDialog'
import UpdateUserForm from './updateUserForm'
import Constants from '../common/constants'
import '../css/bootstrap-4-3-1.css'
import '../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

function roleFormatter(cell, row, enumObject) {
  return enumObject[cell];
};

class Users extends React.Component {
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
    this.handleToUpdate = this.handleToUpdate.bind(this);
    this.updateData = this.updateData.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  onSortChange(sortName, sortOrder) {
    this.setState({
      sortName,
      sortOrder
    });
  }

  onComponentWillMount() {
    this.updateData()
  }

  updateData(){
    fetch("/getUsers")
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

  deleteUser(user_id){
    fetch("/removeUserById",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({"user_id": user_id})
      })
      .then(data => {
        //this.close();
        this.handleToUpdate();
      })
      .catch(error => console.error(error))
  }

  actionFormatter(cell, row, enumObject) {
    var onDelete = this.deleteUser;
    var onUpdate = this.updateData;
    return(
      <div class='row'>
        <UpdateUserForm
          id={row.Id}
          name={row.Name}
          role={row.Role}
          mail={row.Mail}
          roles={Constants.roles}
          onUpdate={onUpdate}
        />
        <RemoveDialog
          elementId={cell}
          title='Удаление пользователя'
          propose={'Вы уверены что хотите удалить пользователя '  + row.Name + '?'}
          onDelete={onDelete}
        />
      </div>
    )
  }

  componentDidMount() {
    this.updateData();
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
        <BootstrapTable data={this.state.data} options={options} pagination striped hover>
          <TableHeaderColumn isKey dataField='Id' width='90' dataAlign ='center'
            isKey dataSort headerAlign='center'>ID
          </TableHeaderColumn>
          <TableHeaderColumn dataField='Name' dataSort headerAlign='center'
            filter={ { type: 'TextFilter', delay: 1000 , placeholder: 'Введите имя'} }>
            Имя пользователя
          </TableHeaderColumn>
          <TableHeaderColumn dataField='Role' dataSort headerAlign='center'
            dataFormat={ roleFormatter } formatExtraData={ Constants.roles }
            filter={ { type: 'SelectFilter', options: Constants.roles, placeholder: 'Выберите роль' } }>
            Роль
          </TableHeaderColumn>
          <TableHeaderColumn dataField='Mail' headerAlign='center'
            filter={ { type: 'TextFilter', delay: 1000, placeholder: 'Введите почту' } }>
            Почта</TableHeaderColumn>
          <TableHeaderColumn dataField='Id' dataFormat={ this.actionFormatter }>
              <AddUserForm handleToUpdate = {this.handleToUpdate}></AddUserForm>
            </TableHeaderColumn>
        </BootstrapTable>
      </div>
    )
  }
}

export default Users;
