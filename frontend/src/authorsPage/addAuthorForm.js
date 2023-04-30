import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import * as yup from 'yup'
import { Formik } from 'formik';
import '../css/bootstrap-4-3-1.css'
import '../css/styles.css'

var schema;

class AddAuthorForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false
    }
    this.show = this.show.bind(this);
  }

  show() {
    this.setState({
      show: true,
      userNameError: false
    });
  }

  close() {
    this.setState({show: false});
  }

  onSubmit(values){
    var handleToUpdate = this.props.handleToUpdate;
    fetch("/addAuthor",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(values)
      })
      .then(data => {
        this.close();
        handleToUpdate();
      })
      .catch(error => {
        console.error(error);
        alert('Не получилось добавить автора!');
      })
  }

  render() {
    schema = yup.object({
      family: yup.string().required('Фамилия автора обязательное поле!'),
      name: yup.string().required('Имя автора обязательное поле!'),
      cath: yup.string()
        .oneOf(Object.keys(this.props.caths).map((key, index) => (
          this.props.caths[key].Id.toString(10))), 'Укажите кафедру!'),
      degree: yup.string()
        .oneOf(Object.keys(this.props.degrees).map((key, index) => (
          this.props.degrees[key].Id.toString(10))), 'Укажите ученую степень!'),
    });

    return (
      <div>
        <Button variant='outline-primary' block
          onClick={ () => this.show() }>
        Новый автор</Button>
        <Modal size="lg" show={this.state.show} onHide={() => this.close()}>
          <Modal.Header closeButton>
            <Modal.Title>Создание нового автора</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Formik
              validationSchema={schema}
              onSubmit={(values) => {
                  this.onSubmit(values);
                }
              }

              initialValues={{family: '', name: '', patronymic: '',cath: '-1', degree: '-1'}}
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
                  <Form.Group as={Row} controlId="authorFamily">
                    <Form.Label column md={4}>Фамилия</Form.Label>
                    <Col md={8}>
                      <Form.Control
                        type="text"
                        placeholder="Фамилия"
                        name="family"
                        value={values.family}
                        onChange={handleChange}
                        isInvalid={!!(errors.family && touched.family)}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.family}
                      </Form.Control.Feedback>
                    </Col>
                  </Form.Group>

                    <Form.Group as={Row} controlId="authorName">
                      <Form.Label column md={4}>Имя</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="text"
                          placeholder="Имя"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          isInvalid={!!(errors.name && touched.name)}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.name}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="authorPatronymic">
                      <Form.Label column md={4}>Отчество</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="text"
                          placeholder="Отчество"
                          name="patronymic"
                          value={values.patronymic}
                          onChange={handleChange}
                        />
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="authorCath">
                      <Form.Label column md={4}>Кафедра</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          as="select"
                          name="cath"
                          value={values.cath}
                          onChange={handleChange}
                          isInvalid={!!(errors.cath && touched.cath)}
                        >
                          <option>Выберите кафедру</option>
                          {
                            Object.keys(this.props.caths).map((key, index) => (
                                <option value={this.props.caths[key].Id}>{this.props.caths[key].Index}</option>
                            ))
                          }
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                          {errors.cath}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="authorDegree">
                      <Form.Label column md={4}>Уч. степень</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          as="select"
                          name="degree"
                          value={values.degree}
                          onChange={handleChange}
                          isInvalid={!!(errors.degree && touched.degree)}
                        >
                          <option>Укажите ученую степень</option>
                          {
                            Object.keys(this.props.degrees).map((key, index) => (
                                <option value={this.props.degrees[key].Id}>{this.props.degrees[key].Name}</option>
                            ))
                          }
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                          {errors.degree}
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

export default AddAuthorForm;
