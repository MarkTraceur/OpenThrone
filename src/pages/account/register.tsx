import { useState } from 'react';

import Form from '@/components/form';

const Register = (props) => {
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <div className="container">
      <div className="row">
        <div className="mainArea pb-10">
          <h2 className="page-title">Register</h2>
        </div>
        <div className="xs:w-96 md:w-3/4 py-2 md:col-span-9">
          <div className="advisor my-3 rounded-lg px-4 py-2 shadow-md">
            {errorMessage && (
              <div className="alert alert-error">{errorMessage}</div>
            )}
            <div className="flex justify-center">
              <div className="xs:w-96 md:w-5/12">
                <Form type="register" setErrorMessage={setErrorMessage} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
