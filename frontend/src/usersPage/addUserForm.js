import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import * as yup from 'yup'
import { Formik } from 'formik';
import Constants from '../common/constants'
import '../css/bootstrap-4-3-1.css'
import '../css/styles.css'

const schema = yup.object({
  name: yup.string().required('Имя пользователя обязательное поле!')
    .max(20, 'Имя не должно превышать 20 символов!'),
  mail: yup.string().email('Введен невалидный почтовый адрес!')
    .required('Почтовый адрес обязательное поле!'),
  role: yup.string()
    .oneOf(Object.keys(Constants.roles), 'Выберите роль!'),
  password: yup.string().required('Придумайте пароль!')
    .max(20, 'Пароль не должен превышать 20 символов!')
    .min(6, 'Пароль должен быть не менее 6 символов!'),
});

class AddUserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      userNameError: false
    }
    this.show = this.show.bind(this);
  }

  show() {
	 console.log(Object.keys(Constants.roles));
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
    fetch("/checkUserName",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({name: values.name})
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.count == '0'){
          fetch("/addUser",
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
            .catch(error => console.error(error))
        }
        else{
          this.setState({userNameError: true});
        }
      })
      .catch(error => console.error(error))
  }

  render() {
    return (
      <div>
        <Button variant='outline-primary' onClick={ () => this.show() }>
        Новый пользователь</Button>
        <Modal size="lg" show={this.state.show} onHide={() => this.close()}>
          <Modal.Header closeButton>
            <Modal.Title>Создание нового пользователя</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Formik
              validationSchema={schema}
              onSubmit={(values) => {
                  this.onSubmit(values);
                }
              }

              initialValues={{mail: '', role: '-1', name: '', password: ''}}
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
                    <Form.Group as={Row} controlId="userName">
                      <Form.Label column md={4}>Имя пользователя</Form.Label>
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

                    <Form.Group as={Row} controlId="userMail">
                      <Form.Label column md={4}>E-mail</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="email"
                          placeholder="Почта"
                          name="mail"
                          value={values.mail}
                          onChange={handleChange}
                          isInvalid={!!(errors.mail && touched.mail)}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.mail}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="userRole">
                      <Form.Label column md={4}>Роль</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          as="select"
                          name="role"
                          value={values.role}
                          onChange={handleChange}
                          isInvalid={!!(errors.role && touched.role)}
                        >
                          <option>Выберите роль пользователя</option>
                          {
                            Object.keys(Constants.roles).map((key, index) => (
                                <option value={key}>{Constants.roles[key]}</option>
                            ))
                          }
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                          {errors.role}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="userPassword">
                      <Form.Label column md={4}>Пароль</Form.Label>
                      <Col md={8}>
                        <Form.Control
                          type="password"
                          placeholder="Пароль"
                          name="password"
                          value={values.password}
                          onChange={handleChange}
                          isInvalid={!!(errors.password && touched.password)}
                        />

                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                        {this.state.userNameError ? <div class="text-danger">Пользователь с таким именем уже существует!</div> : ''}
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

export default AddUserForm;
