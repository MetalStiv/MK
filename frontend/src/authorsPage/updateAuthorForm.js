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
  family: yup.string().required('Фамилия автора обязательное поле!'),
  name: yup.string().required('Имя автора обязательное поле!'),
});

class UpdateAuthorForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        show: false,
    };
  }

  show() {
    this.setState({show: true});
  }

  close() {
    this.setState({show: false});
  }

  update(values) {
    var onUpdate = this.props.onUpdate;
    values.id = this.props.id.toString();

    fetch("/updateAuthor",
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(values)
      })
      .then(data => {
        onUpdate()
      })
      .catch(error => console.error(error))
  }

  render() {
    return (
      <div>
        <Button block variant='primary' style={{ margin: 2 }} onClick={ () => this.show() }>
        Изменить</Button>
        <Modal size="lg" show={this.state.show} onHide={() => this.close()}>
          <Modal.Header closeButton>
            <Modal.Title>Изменение автора {this.props.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Formik
              validationSchema={schema}
              onSubmit={(values) => {
                  this.update(values);
                }
              }
              initialValues={{family: this.props.family, name: this.props.name, patronymic: this.props.patronymic,
                cath: this.props.cath, degree: this.props.degree}}
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
                  <Form.Group as={Row} controlId="authorFamily">
                    <Form.Label column md={3}>Фамилия</Form.Label>
                    <Col md={9}>
                      <Form.Control
                        type="text"
                        name="family"
                        value={values.family}
                        onChange={handleChange}
                        isInvalid={!!(errors.family && touched.family)}
                      />
                    </Col>
                    <Form.Control.Feedback type="invalid">
                      {errors.family}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Row} controlId="authorName">
                    <Form.Label column md={3}>Имя</Form.Label>
                    <Col md={9}>
                      <Form.Control
                        type="text"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        isInvalid={!!(errors.name && touched.name)}
                      />
                    </Col>
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group as={Row} controlId="authorPatronymic">
                    <Form.Label column md={3}>Отчество</Form.Label>
                    <Col md={9}>
                      <Form.Control
                        type="text"
                        name="patronymic"
                        value={values.patronymic}
                        onChange={handleChange}
                      />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} controlId="authorCath">
                    <Form.Label column md={3}>Кафедра</Form.Label>
                    <Col md={9}>
                      <Form.Control
                        as="select"
                        name="cath"
                        value={values.cath}
                        onChange={handleChange}
                      >
                        {
                          this.props.caths.map(function(item) {
                            return <option value={item.Id.toString()} selected={item.Id==this.props.cath ? 'selected':''}>
                                {item.Index}
                            </option>
                          }, this)
                       }

                        </Form.Control>
                    </Col>
                  </Form.Group>

                  <Form.Group as={Row} controlId="authorDegree">
                    <Form.Label column md={3}>Уч. степень</Form.Label>
                    <Col md={9}>
                      <Form.Control
                        as="select"
                        name="degree"
                        value={values.degree}
                        onChange={handleChange}
                      >
                      {
                        this.props.degrees.map(function(item) {
                          return <option value={item.Id.toString()} selected={item.Id==this.props.degree ? 'selected':''}>
                            {item.Name}
                          </option>
                        }, this)
                     }
                        </Form.Control>
                    </Col>
                  </Form.Group>

                  <div class="d-flex flex-row-reverse">
                    <Button type="submit">Изменить</Button>
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

export default UpdateAuthorForm;
