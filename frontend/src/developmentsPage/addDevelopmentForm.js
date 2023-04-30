import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Picky from 'react-picky';
import 'react-picky/dist/picky.css';
import * as yup from 'yup'
import { Formik } from 'formik';
import Constants from '../common/constants'
import '../css/bootstrap-4-3-1.css'
import '../../node_modules/react-bootstrap-multiselect/css/bootstrap-multiselect.css'
import '../css/styles.css'

var schema;

class AddDevelopmentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      userNameError: false,
      authorError: false,
      authors: [],
      degrees: [],
      selectedAuthors: [],
      fileError: false,
      file: null,
      loading: false
    }
    this.show = this.show.bind(this);
    this.selectAuthor = this.selectAuthor.bind(this);
    this.getAuthorList = this.getAuthorList.bind(this);
    this.pagesHandleChange = this.pagesHandleChange.bind(this);
  }

  componentDidMount() {
    Promise.all([
      this.getDegrees()
    ])
      .then(this.getAuthorList())
  }

  show() {
    this.setState({
      show: true,
      userNameError: false,
      selectedAuthors: [],
      file: null,
      fileError: false
    });
  }

  close() {
    this.setState({show: false});
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

  getAuthorList() {
    fetch("/getAuthors",
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

  selectAuthor(value) {
    this.setState({ selectedAuthors: value });
  }

  pagesHandleChange(e, baseHandleChange){
    const re = /^[0-9\b]+$/;
    if (parseInt(e.target.value) > 0 || e.target.value === ''){
      if (e.target.value === '' || re.test(e.target.value)) {
         baseHandleChange(e)
      }
    }
  }

  onSubmit(values){
    var handleToUpdate = this.props.handleToUpdate;
    this.setState({fileError: false})
    values.authors = Object.keys(this.state.selectedAuthors)
      .map((key, index) => this.state.selectedAuthors[key].id);
    let formData = new FormData();
    formData.append("name", values.name);
    formData.append("authors", values.authors);
    formData.append("reviewer", values.reviewer);
    formData.append("pages", values.pages);
    formData.append("committee", values.committee);
    formData.append("fileName", values.file);
    formData.append("file", this.state.file);
    formData.append("comment", values.comment);
    if (this.state.file.size > 1024*1024*30){
      this.setState({fileError: true})
    }
    else{
      this.setState({loading: true})
      fetch("/addDevelopment",
        {
          method: 'POST',
          body: formData
        })
        .then(data => {
          this.setState({loading: false})
          this.close();
          handleToUpdate();
        })
        .catch(error => {
          console.log(error)
          this.setState({loading: false})
        })
      }
  }

  render() {
    schema = yup.object({
      name: yup.string().required('Название МР обязательное поле!'),
      reviewer: yup.string().required('Рецензент обязательное поле!'),
      //authors: yup.string().required('Укажите авторов!'),
      pages: yup.number().required('Кол-во страниц обязательное поле!'),
      committee: yup.string().oneOf(Object.keys(this.props.committees).map((key, index) => (
        this.props.committees[key].Id.toString(10))), 'Укажите МК!'),
      file: yup.string().required('Обязательно выберите файл!'),
    });

    return (
      <div>
        <Button variant='outline-primary' block onClick={ () => this.show() }>
        Новая МР</Button>
        <Modal size="lg" show={this.state.show} onHide={() => this.close()}>
          <Modal.Header closeButton>
            <Modal.Title>Информация о новой МР</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Formik
              validationSchema={schema}
              onSubmit={(values) => {
                  this.onSubmit(values);
                }
              }

              initialValues={{committee: '-1', name: '', reviewer: '', pages: ''}}
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
                    <Form.Group as={Row} controlId="developmentName">
                      <Form.Label column md={4}>Название</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="text"
                          placeholder="Название"
                          name="name"
                          id="name"
                          value={values.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={!!(errors.name && touched.name)}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.name}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="developmentAuthors">
                      <Form.Label column md={4}>Авторы</Form.Label>
                      <Col md={8}>
                        <Picky
                          value={this.state.selectedAuthors}
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
                          onBlur={handleBlur}
                          dropdownHeight={600}
                          id="authors"
                          name="authors"
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.authors}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="developmentReviewer">
                      <Form.Label column md={4}>Рецензент(ы)</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="text"
                          placeholder="ФИО"
                          id="reviewer"
                          name="reviewer"
                          value={values.reviewer}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          isInvalid={!!(errors.reviewer && touched.reviewer)}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.reviewer}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="developmentPages">
                      <Form.Label column md={4}>Кол-во страниц</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="text"
                          id="pages"
                          placeholder="страниц"
                          name="pages"
                          value={values.pages}
                          onBlur={handleBlur}
                          onChange={e => this.pagesHandleChange(e, handleChange)}
                          isInvalid={!!(errors.pages && touched.pages)}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.pages}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="developmentCommittee">
                      <Form.Label column md={4}>Методическая комиссия</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          as="select"
                          name="committee"
                          id="committee"
                          value={values.committee}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={!!(errors.committee && touched.committee)}
                        >
                          <option>Выберите дату МК</option>
                          {
                            Object.keys(this.props.committees).map((key, index) => (
                                <option value={this.props.committees[key].Id}>
                                  {this.props.committees[key].Date}</option>
                            ))
                          }
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                          {errors.committee}
                        </Form.Control.Feedback>
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
                          isInvalid={!!(this.state.file === null && touched.file)}
                        />
                        <i>*файлы должны быть в форматах pdf или docx, не более 30Мб</i>
                        {
                          this.state.file === null ?
                            <div class="text-danger">
                              Приложите документ!
                            </div>
                          : ''
                        } 
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="developmentComment">
                      <Form.Label column md={4}>Комментарий</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          as="textarea"
                          type="text"
                          placeholder="Введите текст"
                          name="comment"
                          value={values.comment}
                          onChange={handleChange}
                          isInvalid={!!(errors.comment && touched.comment)}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.comment}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    {
                      this.state.fileError == true ?
                        <div class="text-danger">
                          Во время загрузки произошла ошибка, возможно Ваш файл слишком большого размера
                        </div> : ''
                    }

                    {
                      this.state.loading == true ?
                        <div class="text-success">
                          Подождите, Ваш файл загружается на сервер...
                        </div> : ''
                    }

                    <div class="d-flex flex-row-reverse">
                      <Button type="submit">Создать</Button>
                      <Button variant="secondary" onClick={() => this.close()}>Отмена</Button>
                    </div>
                </Form>
              )}
            </Formik>

          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default AddDevelopmentForm;
