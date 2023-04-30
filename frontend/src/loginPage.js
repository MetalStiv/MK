import React from 'react';
import Header from './common/header';
import Users from './usersPage/users'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import * as yup from 'yup'
import { Formik } from 'formik';
import history from './common/history';
import './css/styles.css'

const schema = yup.object({
  name: yup.string().required('Введите имя пользователя!'),
  password: yup.string().required('Введите пароль!')
});

class LoginPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {error: false,}
    this.login = this.login.bind(this);
  }

  login(values) {
    fetch("/signIn",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(values)
      })
    .then(response => response.json())
    .then(data => {
      if (data['role'] == -1){
        this.setState({error: true});
        this.forceUpdate();
      }
      else{
        var onGetRole = this.props.onGetRole;
        onGetRole(data['role'])
        history.push('/mk/')
      }
    })
    .catch(error => console.error(error))
  }

  render() {
    return (
      <div>
        <Header />
        <Row>
          <Col></Col>
            <Col md={5}>
            <Formik
              validationSchema={schema}
              onSubmit={(values) => this.login(values)}
              initialValues={{name: '', password: ''}}
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
                      />
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
                      />
                    </Col>
                  </Form.Group>
                  {this.state.error ?
                    <Col sm={{ span: 10, offset: 3 }}>
                      <div class="text-danger">Неверное имя пользователя или пароль!</div>
                    </Col> : ''}

                  <Form.Group as={Row}>
                      <Col sm={{ span: 10, offset: 5 }}>
                        <Button size="lg" type="submit">Войти</Button>
                      </Col>
                  </Form.Group>

                </Form>
              )}
              </Formik>
            </Col>
          <Col></Col>
        </Row>
      </div>
    )
  }
}

export default LoginPage;
