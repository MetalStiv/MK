import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Formik } from 'formik';
import * as yup from 'yup'
import Form from 'react-bootstrap/Form';
import Constants from '../common/constants'
import '../css/bootstrap-4-3-1.css'

const schema = yup.object({
  pass: yup.string().required('Придумайте пароль!')
    .max(20, 'Пароль не должен превышать 20 символов!')
    .min(6, 'Пароль должен быть не менее 6 символов!'),
  mail: yup.string().email('Введен невалидный почтовый адрес!'),
});

class UpdateUserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {show: false}
    this.show = this.show.bind(this);
  }

  show() {
    this.setState({show: true});
  }

  close() {
    this.setState({show: false});
  }

  updateRole(values) {
    var onUpdate = this.props.onUpdate;
    fetch("/updateUserRole",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({"user_id": this.props.id, "user_role": parseInt(values.role, 10)})
      })
      .then(data => {
        onUpdate()
      })
      .catch(error => console.error(error))
  }

  updateMail(values) {
    var onUpdate = this.props.onUpdate;
    fetch("/updateUserMail",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({"user_id": this.props.id, "user_mail": values.mail})
      })
      .then(data => {
        onUpdate()
      })
      .catch(error => console.error(error))
  }

  updatePassword(values) {
    var onUpdate = this.props.onUpdate;
    fetch("/updateUserPass",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({"user_id": this.props.id, "user_pass": values.pass})
      })
      .catch(error => console.error(error))
  }

  render() {
    return (
      <div>
        <Button  variant='primary' style={{ margin: 2 }} onClick={ () => this.show() }>
        Изменить</Button>
        <Modal size="lg" show={this.state.show} onHide={() => this.close()}>
          <Modal.Header closeButton>
            <Modal.Title>Изменение пользователя {this.props.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>

          <Formik
            onSubmit={(values) => {
                this.updateRole(values);
              }
            }
            initialValues={{role: this.props.role}}
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
                <Form.Group as={Row} controlId="userRole">
                  <Form.Label column md={3}>Роль</Form.Label>
                  <Col md={6}>
                    <Form.Control
                      as="select"
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                    >
                      {
                        Object.keys(Constants.roles).map((key, index) => (
                            <option value={key} selected={key==this.props.role ? 'selected':''}>
                              {Constants.roles[key]}
                            </option>
                        ))
                      }
                      </Form.Control>
                  </Col>
                  <Col md={3}>
                    <Button  variant='primary' style={{ margin: 2 }} type="submit">
                    Изменить</Button>
                  </Col>
                </Form.Group>
              </Form>
            )}
          </Formik>

          <Formik
            onSubmit={(values) => {
                this.updateMail(values);
              }
            }
            initialValues={{mail: this.props.mail}}
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
              <Form.Group as={Row} controlId="userMail">
                <Form.Label column md={3}>E-mail</Form.Label>
                <Col md={6}>
                  <Form.Control
                    type="text"
                    name="mail"
                    value={values.mail}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={3}>
                  <Button  variant='primary' style={{ margin: 2 }} type="submit">
                  Изменить</Button>
                </Col>
              </Form.Group>
            </Form>
            )}
          </Formik>

          <Formik
            validationSchema={schema}
            initialValues={{password: ''}}
            onSubmit={(values) => {
                this.updatePassword(values);
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
              <Form onSubmit={handleSubmit}>
                <Form.Group as={Row} controlId="userPassword">
                  <Form.Label column md={3}>Пароль</Form.Label>
                  <Col md={6}>
                    <Form.Control
                      type="password"
                      placeholder="Введите новый пароль"
                      name="pass"
                      value={values.pass}
                      onChange={handleChange}
                      isInvalid={!!(errors.pass && touched.pass)}
                    />

                    <Form.Control.Feedback type="invalid">
                      {errors.pass}
                    </Form.Control.Feedback>
                  </Col>
                  <Col md={3}>
                    <Button  variant='primary' type='submit'>
                    Изменить</Button>
                  </Col>
                </Form.Group>
              </Form>
            )}
            </Formik>

          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default UpdateUserForm;
