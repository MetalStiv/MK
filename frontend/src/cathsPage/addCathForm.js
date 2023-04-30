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

const schema = yup.object({
  index: yup.string().required('Индекс кафедры обязательное поле!'),
  name: yup.string().required('Название кафедры обязательное поле!'),
});

class AddCathForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      cathIndexError: false
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
    var handleToUpdate  =   this.props.handleToUpdate;
    fetch("/addCath",
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
        alert('Не получилось добавить кафедру!');
      })
  }

  render() {
    return (
      <div>
        <Button variant='outline-primary' style={{ paddingLeft: 4, paddingRight: 4 }}
          onClick={ () => this.show() }>
        Новая кафедра</Button>
        <Modal size="lg" show={this.state.show} onHide={() => this.close()}>
          <Modal.Header closeButton>
            <Modal.Title>Создание новой кафедры</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Formik
              validationSchema={schema}
              onSubmit={(values) => {
                  this.onSubmit(values);
                }
              }

              initialValues={{index: '', name: ''}}
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
                    <Form.Group as={Row} controlId="cathIndex">
                      <Form.Label column md={4}>Индекс кафедры</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="text"
                          placeholder="Индекс"
                          name="index"
                          value={values.index}
                          onChange={handleChange}
                          isInvalid={!!(errors.index && touched.index)}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.name}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="cathName">
                      <Form.Label column md={4}>Название кафедры</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="text"
                          placeholder="Название"
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

export default AddCathForm;
