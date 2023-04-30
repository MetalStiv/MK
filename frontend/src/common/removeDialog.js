import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Formik } from 'formik';
import Form from 'react-bootstrap/Form';
import '../css/bootstrap-4-3-1.css'

class RemoveDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {show: false}
    this.show = this.show.bind(this);
    this.close = this.close.bind(this);
  }

  show() {
    this.setState({show: true});
  }

  close() {
    this.setState({show: false});
  }

  onSubmit(){
    var onDelete  =   this.props.onDelete;
    onDelete(this.props.elementId);
    this.close();
  }

  render() {
    return (
      <div>
        <Button  variant='danger' style={{ margin: 2 }} onClick={ () => this.show() }>
        Удалить</Button>
        <Modal show={this.state.show} onHide={() => this.close()}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <p>{this.props.propose}</p>
            <Formik
              onSubmit={() => {this.onSubmit();}}
            >
            {({
              handleSubmit,
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <div class="d-flex flex-row-reverse">
                  <Button type="submit">Удалить</Button>
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

export default RemoveDialog;
