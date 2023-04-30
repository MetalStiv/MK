import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Picky from 'react-picky';
import 'react-picky/dist/picky.css';
import * as yup from 'yup'
import { Formik } from 'formik';
import Constants from '../common/constants'
import '../css/bootstrap-4-3-1.css'
import '../../node_modules/react-bootstrap-multiselect/css/bootstrap-multiselect.css'
import '../css/styles.css'

var schema;

class UpdateDevelopmentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      userNameError: false,
      authors: [],
      developmentName: null,
      developmentPages: 0,
      developmentReviewer: null,
      developmentCommittee: 0,
      developmentReview: null,
      developmentReview2: null,
      developmentCathResolution: null,
      developmentDeanaryResolution: null,
      degrees: [],
      records: [],
      file: null,
      availableCommittees: [],
      fileLoad: false,
      fileLoadError: false,
      loadComplite: false,
      selectedAuthors: []
    };
    this.selectAuthor = this.selectAuthor.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onReviewerChange = this.onReviewerChange.bind(this);
    this.onPagesChange = this.onPagesChange.bind(this);
    this.onCommitteeChange = this.onCommitteeChange.bind(this);
    this.getDegrees = this.getDegrees.bind(this);
    this.update = this.update.bind(this);
    this.getAuthorList = this.getAuthorList.bind(this);
    this.pagesHandleChange = this.pagesHandleChange.bind(this);
    this.getDevelopmentInfo = this.getDevelopmentInfo.bind(this);
    this.getDevelopmentRecords = this.getDevelopmentRecords.bind(this);
    this.getAvailableCommittees = this.getAvailableCommittees.bind(this);
    this.close = this.close.bind(this);
  }

  componentDidMount() {
    Promise.all([
      this.getDegrees(),
      this.getDevelopmentInfo()
    ])
      .then(res => this.getAuthorList())
      .then(res => this.getDevelopmentRecords())
      .then(res => this.getAvailableCommittees())
  }

  onNameChange(e){
    this.setState({developmentName: e.target.value})
  }

  onReviewerChange(e){
    this.setState({developmentReviewer: e.target.value})
  }

  onPagesChange(e){
    this.setState({developmentPages: e.target.value})
  }

  onCommitteeChange(e){
    this.setState({developmentCommitee: e.target.value})
  }

  update(){
    var handleToUpdate = this.props.handleToUpdate
    handleToUpdate()

    Promise.all([
      this.getDegrees()
    ])
      .then(this.getAuthorList())
      .then(this.getDevelopmentInfo())
      .then(this.getDevelopmentRecords())
      .then(this.getAvailableCommittees())
  }

  selectAuthor(value){
    this.setState({selectedAuthors: value})
  }

  getDegrees(){
    return fetch("/getDegrees")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            degrees: result
          });
          return true
        },
        (error) => {
          alert(error);
          return false;
        }
      )
  }

  getAvailableCommittees(){
    let url = "/getAvailableCommittees?development_id=" + this.state.developmentCommittee.toString()
    return fetch(url)
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

  getAuthorList() {
    return fetch("/getAuthors",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'GET'
      })
      .then(res => res.json())
      .then(data => {
        this.setState({authors: data})
      })
      .catch(error => console.error(error))
  }

  getDevelopmentInfo() {
    let url = "/getDevelopmentById?development_id=" + this.props.developmentId.toString()
    return fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          var authors = []

          result.Authors.map(item =>
            {
              var authorString = this.props.caths
                .filter(value => value.Id == item.CathId)
                .map(value => value.Index) + ": " +
                item.FullName;
              if (item.DegreeId > 0){
                authorString += " (" +
                  this.state.degrees
                    .filter(value => value.Id == item.DegreeId)
                    .map(value => value.Name)
                  + ")"
                }
              authors.push({id: item.Id, author: authorString})
            }
          );

          this.setState({
            isLoaded: true,
            developmentName: result.Name,
            developmentPages: result.Pages,
            developmentReviewer: result.Reviewer,
            developmentCommittee: result.Committee.Id,
            developmentReview: result.Review,
            developmentCathResolution: result.CathResolution,
            developmentDeanaryResolution: result.DeanaryResolution,
            developmentReview2: result.Review2,
            selectedAuthors: authors
          });

          console.log(Constants.fileStoragePath)
          console.log(Constants.fileStoragePath + result.CathResolution)
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
      .then(() => this.forceUpdate())
      .catch(error => console.error(error))
  }

  getDevelopmentRecords() {
    let url = "/getDevelopmentRecordsById?development_id=" + this.props.developmentId.toString()
    return fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            records: result
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
      .then(() => this.forceUpdate())
      .catch(error => console.error(error))
  }

  pagesHandleChange(e, baseHandleChange){
    const re = /^[0-9\b]+$/;
    if (parseInt(e.target.value) > 0 || e.target.value === ''){
      if (e.target.value === '' || re.test(e.target.value)) {
         baseHandleChange(e)
      }
    }
  }

  onComment(values){
    this.setState({fileLoad: false, fileLoadError: false, isLoaded: false})
    let formData = new FormData();
    formData.append("development_id", this.props.developmentId);
    formData.append("comment", values.values.comment);
    formData.append("fileName", values.values.file);
    formData.append("file", this.state.file);
    if (this.state.file){
      if (this.state.file.size > 1024*1024*30){
        this.setState({fileLoad: true, fileLoadError: true, loadComplite: false})
      }
      else{
        this.setState({fileLoad: true, fileLoadError: false, loadComplite: false})
      }
    }
    fetch("/addRecord",
      {
        method: 'POST',
        body: formData
      })
      .then(data => {
        //this.setState({fileLoad: false, fileLoadError: false})
        this.setState({loadComplite: true, fileLoadError: false, isLoaded: true})
        this.update();
      })
      .catch(error => console.log(error))
  }

  onSubmit(values){
    values.authors = Object.keys(this.state.selectedAuthors)
      .map((key, index) => this.state.selectedAuthors[key].id);
    let formData = new FormData();
    formData.append("id", this.props.developmentId);
    formData.append("name", values.name);
    formData.append("authors", values.authors);
    formData.append("reviewer", values.reviewer);
    formData.append("pages", values.pages);
    formData.append("committee", values.committee);

    fetch("/updateDevelopment",
      {
        method: 'POST',
        body: formData
      })
      .then(
        function(response) {
          if (response.status == 200) {
            alert('Данные были обновлены!')
          }
          else{
            alert('Невозможно обновить данные!')
          }
        }
      )
      .catch(error =>
        {
          console.error(error)
          alert('Невозможно обновить данные!')
        }
      )
  }

  onAccept(values){
    this.setState({fileLoad: false, fileLoadError: false, isLoaded: false})
    let formData = new FormData();
    formData.append("development_id", this.props.developmentId);
    formData.append("comment", values.values.comment);
    formData.append("fileName", values.values.file);
    formData.append("file", this.state.file);
    if (this.state.file){
      if (this.state.file.size > 1024*1024*30){
        this.setState({fileLoad: true, fileLoadError: true})
      }
      else{
        this.setState({fileLoad: true, fileLoadError: false})
      }
    }

    fetch("/acceptDevelopment",
      {
        method: 'POST',
        body: formData
      })
      .then(data => {
        this.setState({fileLoad: false, fileLoadError: false, isLoaded: true})
        this.update();
      })
      .catch(error => console.error(error))
  }

  onDecline(values){
    this.setState({fileLoad: false, fileLoadError: false, isLoaded: false})
    let formData = new FormData();
    formData.append("development_id", this.props.developmentId);
    formData.append("comment", values.values.comment);
    formData.append("fileName", values.values.file);
    formData.append("file", this.state.file);
    if (this.state.file){
      if (this.state.file.size > 1024*1024*30){
        this.setState({fileLoad: true, fileLoadError: true})
      }
      else{
        this.setState({fileLoad: true, fileLoadError: false})
      }
    }

    fetch("/declineDevelopment",
      {
        method: 'POST',
        body: formData
      })
      .then(data => {
        this.setState({fileLoad: false, fileLoadError: false, isLoaded: true})
        this.update();
      })
      .catch(error => console.error(error))
  }

  importReviewFile(e) {
    this.setState({fileLoad: true, fileLoadError: false})
    let formData = new FormData();
    formData.append("id", this.props.developmentId);
    formData.append("review", e.currentTarget.files[0]);
    formData.append("fileName", e.target.value);
    if (e.currentTarget.files[0].size > 1024*1024*30){
      this.setState({fileLoad: true, fileLoadError: true})
    }
    else{
      fetch("/addReview",
        {
          method: 'POST',
          body: formData
        })
        .then(data => {
          this.setState({loadComplite: true, fileLoadError: false})
          this.update();
        })
        .catch(error =>  console.log(error))
      }
  }

  importReview2File(e) {
    this.setState({fileLoad: true, fileLoadError: false})
    let formData = new FormData();
    formData.append("id", this.props.developmentId);
    formData.append("review2", e.currentTarget.files[0]);
    formData.append("fileName", e.target.value);
    if (e.currentTarget.files[0].size > 1024*1024*30){
      this.setState({fileLoad: true, fileLoadError: true})
    }
    else{
      fetch("/addReview2",
        {
          method: 'POST',
          body: formData
        })
        .then(data => {
          this.setState({loadComplite: true, fileLoadError: false})
          this.getDevelopmentInfo()
        })
        .catch(error => console.log(error))
      }
  }

  importCathResolutionFile(e) {
    this.setState({fileLoad: true, fileLoadError: false})
    let formData = new FormData();
    formData.append("id", this.props.developmentId);
    formData.append("cathResolution", e.currentTarget.files[0]);
    formData.append("fileName", e.target.value);
    if (e.currentTarget.files[0].size > 1024*1024*30){
      this.setState({fileLoad: true, fileLoadError: true})
    }
    else{
      fetch("/addCathResolution",
        {
          method: 'POST',
          body: formData
        })
        .then(data => {
          this.setState({loadComplite: true, fileLoadError: false})
          this.getDevelopmentInfo()
        })
        .catch(error => console.log(error))
      }
  }

  importDeanaryResolutionFile(e) {
    this.setState({fileLoad: true, fileLoadError: false})
    let formData = new FormData();
    formData.append("id", this.props.developmentId);
    formData.append("deanaryResolution", e.currentTarget.files[0]);
    formData.append("fileName", e.target.value);
    if (e.currentTarget.files[0].size > 1024*1024*30){
      this.setState({fileLoad: true, fileLoadError: true})
    }
    else{
      fetch("/addDeanaryResolution",
        {
          method: 'POST',
          body: formData
        })
        .then(data => {
          this.setState({loadComplite: true, fileLoadError: false})
          this.getDevelopmentInfo()
        })
        .catch(error =>  console.log(error))
      }
  }

  close() {
    this.setState({fileLoadError: false, fileLoad: false, isLoaded: true});
  }

  render() {
    schema = yup.object({
      name: yup.string().required('Название МР обязательное поле!'),
      reviewer: yup.string().required('Рецензент обязательное поле!'),
      //authors: yup.string().required('Укажите авторов!'),
      pages: yup.number().required('Кол-во страниц обязательное поле!'),
      committee: yup.string().oneOf(Object.keys(this.state.availableCommittees).map((key, index) => (
        this.state.availableCommittees[key].Id.toString(10))), 'Укажите МК!'),
    });

    let body = ''
    if (this.state.loadComplite == true){
      body = (<div>Сообщение было отправлено!
          <div class="d-flex flex-row-reverse">
            <Button onClick={() => this.setState({fileLoad: false})}>Закрыть</Button>
          </div>
        </div>)
    }
    else{
      body = this.state.fileLoadError == false ? 'Подождите, ваш файл загружается на сервер...'
        : 'Во время загрузки произошла ошибка, возможно ваш файл слишком большого размера'
    }
    return (
      <div>
        <Modal size="lg" show={this.state.fileLoad} onHide={() => this.close()}>
          <Modal.Body>
              {body}
          </Modal.Body>
        </Modal>

        <Modal size="lg" show={!this.state.isLoaded} onHide={() => this.close()}>
          <Modal.Body>
              Загрузка...
          </Modal.Body>
        </Modal>

        <div className="border rounded form-filter">
          <Formik
            enableReinitialize
            onSubmit={(values) => {
                this.onSubmit(values);
              }
            }
            validationSchema={schema}
            initialValues={{
              name: this.state.developmentName,
              pages: this.state.developmentPages,
              reviewer: this.state.developmentReviewer,
              committee: this.state.developmentCommittee,
              authors: this.state.selectedAuthors
            }}
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
                  <Form.Group as={Row} controlId="developmentName">
                    <Form.Label column md={3}>Название</Form.Label>
                    <Col md={9}>
                      <Form.Control
                        type="text"
                        placeholder="Название"
                        name="name"
                        value={values.name}
                        onChange={e => {this.onNameChange(e); handleChange(e)}}
                        isInvalid={!!(errors.name && touched.name)}
                        disabled={this.props.mode == 'user' ? true : false}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} controlId="developmentAuthors">
                    <Form.Label column md={3}>Авторы</Form.Label>
                    <Col md={9}>
                      <Picky
                        value={values.authors}
                        multiple={true}
                        options={
                          Object.keys(this.state.authors).map((key, index) =>
                          {
                            var dict = {};
                            dict.id = this.state.authors[key].Id;
                            var authorString = this.props.caths
                              .filter(value => value.Id == this.state.authors[key].CathId)
                              .map(item => item.Index) + ": " +
                              this.state.authors[key].FullName;
                            if (this.state.authors[key].DegreeId > 0){
                              authorString += " (" +
                                this.state.degrees
                                  .filter(value => value.Id == this.state.authors[key].DegreeId)
                                  .map(item => item.Name)
                                + ")"
                            }
                            dict.author = authorString;
                            return dict;
                          })
                        }
                        valueKey="id"
                        labelKey="author"
                        includeSelectAll={false}
                        includeFilter={true}
                        onChange={this.selectAuthor}
                        dropdownHeight={600}
                        disabled={this.props.mode == 'user' ? true : false}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.reviewer}
                      </Form.Control.Feedback>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} controlId="developmentReviewer">
                    <Form.Label column md={3}>Рецензент(ы)</Form.Label>
                    <Col md={9}>
                      <Form.Control
                        type="text"
                        placeholder="ФИО"
                        name="reviewer"
                        value={values.reviewer}
                        onChange={e => {this.onReviewerChange(e); handleChange(e)}}
                        isInvalid={!!(errors.reviewer && touched.reviewer)}
                        disabled={this.props.mode == 'user' ? true : false}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.reviewer}
                      </Form.Control.Feedback>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} controlId="developmentPages">
                    <Form.Label column md={3}>Кол-во страниц</Form.Label>
                    <Col md={9}>
                      <Form.Control
                        type="text"
                        placeholder="страниц"
                        name="pages"
                        value={values.pages}
                        onChange={e => {this.onPagesChange(e); handleChange(e)}}
                        isInvalid={!!(errors.pages && touched.pages)}
                        disabled={this.props.mode == 'user' ? true : false}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.pages}
                      </Form.Control.Feedback>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} controlId="developmentCommittee">
                    <Form.Label column md={3}>Методическая комиссия</Form.Label>
                    <Col md={9}>
                      <Form.Control
                        as="select"
                        name="committee"
                        onChange={e => {this.onCommitteeChange(e); handleChange(e)}}
                        value={values.committee}
                        isInvalid={!!(errors.committee && touched.committee)}
                        disabled={this.props.mode == 'user' ? true : false}
                      >
                        <option>Выберите МК</option>
                        {
                          Object.keys(this.state.availableCommittees).map((key, index) => (
                              <option value={this.state.availableCommittees[key].Id}>
                                {this.state.availableCommittees[key].Date}</option>
                          ))
                        }
                      </Form.Control>
                      <Form.Control.Feedback type="invalid">
                        {errors.committee}
                      </Form.Control.Feedback>
                    </Col>
                  </Form.Group>

                  {this.props.mode != 'user'
                    ?<div class="d-flex flex-row-reverse">
                      <Button type="submit">Сохранить</Button>
                    </div>
                    :''
                  }
              </Form>
            )}
          </Formik>
        </div>

        <div class="row">
          <Col md={3}>
            Рецензия (внут.):
            { this.state.developmentReview ?
              <a href={Constants.fileStoragePath + this.state.developmentReview} target="_blank">
                <div class="file-div file btn btn-lg btn-success">
      						Скачать
                </div>
              </a>
              :
              <div class="file-div file btn btn-lg btn-primary">
    						Загрузить
    						<input type="file" name="review" id="review" class="file-input" accept=".pdf"
                  onChange={this.importReviewFile.bind(this)} />
              </div> }
          </Col>

          <Col md={3}>
            Рецензия (внешн.):
            { this.state.developmentReview2 ?
              <a href={Constants.fileStoragePath + this.state.developmentReview2} target="_blank">
                <div class="file-div file btn btn-lg btn-success">
                  Скачать
                </div>
              </a>
              :
              <div class="file-div file btn btn-lg btn-primary">
                Загрузить
                <input type="file" name="review2" id="review" class="file-input" accept=".pdf"
                  onChange={this.importReview2File.bind(this)} />
              </div> }
          </Col>

          <Col md={3}>
            Каф. выписка:
            { this.state.developmentCathResolution ?
              <a href={Constants.fileStoragePath + this.state.developmentCathResolution} target="_blank">
                <div class="file-div file btn btn-lg btn-success">
                  Скачать
                </div>
              </a>
              :
              <div class="file-div file btn btn-lg btn-primary">
                Загрузить
                <input type="file" name="cath" id="cath" class="file-input" accept=".pdf"
                  onChange={this.importCathResolutionFile.bind(this)} />
              </div>}
          </Col>

          <Col md={3}>
            Фак. выписка:
            { this.state.developmentDeanaryResolution ?
              <a href={Constants.fileStoragePath + this.state.developmentDeanaryResolution} target="_blank">
                <div class="file-div file btn btn-lg btn-success">
                  Скачать
                </div>
              </a>
              :
              <div class="file-div file btn btn-lg btn-primary">
                Загрузить
                <input type="file" name="deanary" id="deanary" class="file-input" accept=".pdf"
                  onChange={this.importDeanaryResolutionFile.bind(this)} />
              </div>}
          </Col>
        </div>

        <Card>
          <Card.Body>
            <Card.Title>История обработки:</Card.Title>
          </Card.Body>
        </Card>

        {this.state.records.map(record => {
          let res;
          if (record.Type == 1){
            res = <Card bg="warning" text="white">
              <Card.Header>{record.Date} пользователь {record.User.Name} {Constants.recordType[record.Type]}
              </Card.Header>
              <Card.Body>
                <Card.Text>Комментарий: {record.Comment} </Card.Text>
                {record.File.length > 0 &&
                <Card.Text>Файл: <a href={Constants.fileStoragePath + record.File} target="_blank">
                  Скачать</a></Card.Text>}
              </Card.Body>
            </Card>
          }
          else{
            if (record.Type == 3){
              res = <Card bg="success" text="white">
                <Card.Header>{record.Date} пользователь {record.User.Name} {Constants.recordType[record.Type]}
                </Card.Header>
                <Card.Body>
                  <Card.Text>Комментарий: {record.Comment} </Card.Text>
                  {record.File.length > 0 &&
                  <Card.Text>Файл: <a href={Constants.fileStoragePath + record.File} target="_blank">
                    Скачать</a></Card.Text>}
                </Card.Body>
              </Card>
            }
            else {
              res = <Card>
                <Card.Header>{record.Date} пользователь {record.User.Name} {Constants.recordType[record.Type]}
                </Card.Header>
                <Card.Body>
                  <Card.Text>Комментарий: {record.Comment} </Card.Text>
                  {record.File.length > 0 &&
                  <Card.Text>Файл: <a href={Constants.fileStoragePath + record.File} target="_blank">
                    Скачать</a></Card.Text>}
                </Card.Body>
              </Card>
            }
          }
          return (
            <div>{res}</div>
          )
        })}

        <div className="border rounded form-filter">
          <Formik
            onSubmit={(values) => {
                this.onAccept(values);
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
              <Form noValidate onSubmit={handleSubmit}>
                  <Form.Group as={Row} controlId="developmentComment">
                    <Form.Label column md={3}>Комментарий</Form.Label>
                    <Col md={9}>
                      <Form.Control
                        as="textarea"
                        type="text"
                        placeholder="Введите текст"
                        name="comment"
                        value={values.comment}
                        onChange={handleChange}
                        isInvalid={!!errors.comment}
                      />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} controlId="developmentFile">
                    <Form.Label column md={4}>Прикрепите файл</Form.Label>
                    <Col md={8}>
                      <Form.Control
                        type="file"
                        name="file"
                        accept=".docx,.pdf"
                        value={values.file}
                        onChange={(event) => {
                          this.setState({file: event.currentTarget.files[0]});
                          handleChange(event);
                        }}
                      />
                      <i>*файлы должны быть в форматах pdf или docx, не более 30Мб</i>
                    </Col>
                  </Form.Group>

                  <div class="d-flex flex-row-reverse">
                    {this.props.mode != 'user'
                      ? <Button variant="success" onClick={() => this.onAccept({values})}>Принять</Button>
                      : ''
                    }
                    {this.props.mode != 'user'
                      ? <Button variant="warning" onClick={() => this.onDecline({values})}>На доработку</Button>
                      : ''
                    }
                    <Button variant="primary" onClick={() => this.onComment({values})}>Отправить</Button>
                    <Button variant="secondary" onClick={() => this.props.exit()}>Назад</Button>
                  </div>
              </Form>
            )}
          </Formik>
        </div>

      </div>
    )
  }
}

export default UpdateDevelopmentForm;
