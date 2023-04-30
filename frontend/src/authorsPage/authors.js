import React from "react";
import Button from 'react-bootstrap/Button';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import AddAuthorForm from "./addAuthorForm";
import UpdateAuthorForm from "./updateAuthorForm";
import '../css/bootstrap-4-3-1.css'
import '../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      authors: [],
      caths: [],
      degrees: []
    }
    this.updateData = this.updateData.bind(this);
    this.handleToUpdate = this.handleToUpdate.bind(this);
    this.actionFormatter = this.actionFormatter.bind(this);
    this.cathFormatter = this.cathFormatter.bind(this);
    this.remove = this.remove.bind(this);
  }

  updateData(){
    fetch("/getCaths")
    .then(res => res.json())
    .then(res => this.setState({caths: res}))

    .then(
      (fetch("/getDegrees")
      .then(res => res.json())
      .then(res => this.setState({degrees: res}))
    )
    )
    .then(fetch("/getAuthors")
      .then(res => res.json())
      .then(res => this.setState({authors: res}))
    )
  }

  componentDidMount(){
    this.updateData()
  }

  handleToUpdate(){
    this.updateData();
    this.forceUpdate()
  }

  remove(id){
    fetch("/setInvalidAuthor", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({"id": id})
    })
      .then(() => this.updateData())
  }

  cathFormatter(cell, row, enumObject) {
    return this.state.caths.find(c => c.Id === row.CathId).Index;
  }

  actionFormatter(cell, row, enumObject) {
    return(
      <div>
        <Button  variant={'danger'} block
          style={{ paddingLeft: 25, paddingRight: 25 }}
          onClick={ () => this.remove(row.Id) }>
        Удалить</Button>
        <UpdateAuthorForm 
          caths={this.state.caths}
          degrees={this.state.degrees} onUpdate={this.handleToUpdate}
          family={row.Family} name={row.Name} patronymic={row.Patronymic} 
          cath={row.CathId} degree={row.DegreeId} id={row.Id}
        />
      </div>
    )
  }

  render(){
    const options = {
      sortName: this.state.sortName,
      sortOrder: this.state.sortOrder,
      onSortChange: this.onSortChange,
      noDataText: 'Данные не найдены'
    };

    return (
      <div>
        <BootstrapTable data={this.state.authors} options={options}
          pagination striped hover>
          <TableHeaderColumn isKey dataField='Id' width='90' dataAlign ='center'
            dataSort headerAlign='center'>ID
          </TableHeaderColumn>
          <TableHeaderColumn dataField='FullName' dataSort headerAlign='center'
            filter={ { type: 'TextFilter', delay: 1000 , placeholder: 'Введите имя'} }>
            ФИО
          </TableHeaderColumn>
          <TableHeaderColumn dataField='CathId' dataFormat={ this.cathFormatter }
            filter={ { type: 'TextFilter', placeholder: 'Введите кафедру' } }
            headerAlign='center'>Кафедра
          </TableHeaderColumn>
          <TableHeaderColumn dataField='Id' dataFormat={ this.actionFormatter } width='200'>
            <AddAuthorForm handleToUpdate = {this.handleToUpdate} caths={this.state.caths}
              degrees={this.state.degrees}></AddAuthorForm>
          </TableHeaderColumn>
        </BootstrapTable>
      </div>
    )
  };
}

export default App;