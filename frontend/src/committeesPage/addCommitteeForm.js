import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Datetime from 'react-datetime';
import * as yup from 'yup'
import { Formik } from 'formik';
import '../css/bootstrap-4-3-1.css'
import "../../node_modules/react-datetime/css/react-datetime.css";
import '../css/styles.css'

var moment = require('moment');
require('moment/locale/ru');

var schema;

class AddCommitteeForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      date: null,
      dateCorrect: false,
      showError: false
    }
    this.show = this.show.bind(this);
  }

  show() {
    this.setState({
      show: true,
      dateCorrect: false,
      showError: false
    });
  }

  close() {
    this.setState({show: false});
  }

  handleDate(date){
    var d = moment(date, "DD.MM.YYYY", true);
    if (d < moment()){
      this.setState({dateCorrect: false});
      return
    }
    if (d === null){
      this.setState({dateCorrect: false});
      return
    }
    this.setState({dateCorrect: true});
    this.setState({date: d});
  };

  onSubmit(values){
    if (!this.state.dateCorrect){
      this.setState({showError: true});
      return
    }
    this.setState({showError: false});

    var handleToUpdate  =   this.props.handleToUpdate;
    fetch("/addCommittee",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({'date': moment(this.state.date, 'HH:mm:ss').add(5, 'hours'),
          'number': values.number})
      })
      .then(data => {
        this.close();
        handleToUpdate();
      })
      .catch(error => {
        console.error(error);
        alert('Не получилось добавить МК!');
      })
  }

  render() {
    var valid = function( current ){
      return current.isAfter(Datetime.moment());
    };

    schema = yup.object({
      number: yup.string().required('Номер МК обязательное поле!'),
    });

    return (
      <div>
        <Button variant='outline-primary' block style={{ paddingLeft: 30, paddingRight: 30 }}
          onClick={ () => this.show() }>
        Новая МК</Button>
        <Modal size="lg" show={this.state.show} onHide={() => this.close()}>
          <Modal.Header closeButton>
            <Modal.Title>Создание новой метод. комиссии</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Formik
              validationSchema={schema}
              onSubmit={(values) => {
                  this.onSubmit(values);
                }
              }
              initialValues={{number: ''}}
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
                    <Form.Group as={Row} controlId="committeeDate">
                      <Form.Label column md={4}>Дата комиссии</Form.Label>
                      <Col md={8}>
                        <Datetime
                          locale="ru"
                          dateFormat="DD/MM/YYYY"
                          defaultHour={14}
                          timeFormat={ false }
                          value={this.state.date}
                          isValidDate={ valid }
                          onChange={(value) => this.handleDate(value)}
                        />
                      {this.state.showError ? <div class="text-danger">Некорректная дата!</div> : ''}
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="committeeNumber">
                      <Form.Label column md={4}>Номер комиссии</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="text"
                          id="number"
                          placeholder="номер"
                          name="number"
                          value={values.number}
                          isInvalid={!!(errors.number && touched.number)}
                          onChange={handleChange}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.number}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

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

export default AddCommitteeForm;
