import React from "react";
import { Formik, Form, useField } from "formik";
import * as Yup from "yup";
import "./App.css";

const APIURL =
  "https://32f2jzoot4.execute-api.us-east-1.amazonaws.com/default/fe-takehome-api";

// Why does e still work?
// https://stackoverflow.com/questions/31706611/why-does-the-html-input-with-type-number-allow-the-letter-e-to-be-entered-in

const weightValidation = Yup.number()
  .min(3, "Minimum weight is 3lbs")
  .max(180, "Maximum weight is 180lbs")
  .required("Required");

const schema = Yup.object({
  email: Yup.string().email("Invalid Email Address").required("Required"),
  password: Yup.string()
    .min(8)
    // https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a
    // Not Ideal -- double checking 8 character
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
      "Password is Missing a Special Character, Number or A-Z Letter"
    )
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
  petName: Yup.string().required("Required"),
  petWeight: weightValidation,
  petIdealWeight: weightValidation,
});

const initialValues = {
  email: "",
  password: "",
  confirmPassword: "",
  petName: "",
  petWeight: "",
  petIdealWeight: "",
};

function TextInput({ label, ...props }) {
  const [field, meta] = useField(props);
  return (
    <div>
      <label htmlFor={props.id || props.name}>{label}</label>
      <input className="input" {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </div>
  );
}

function App() {
  let [loading, setLoading] = React.useState(null);
  let [error, setError] = React.useState(null);
  let [response, setResponse] = React.useState(null);

  return (
    <main>
      <div>
        <div>
          <img src="https://via.placeholder.com/600" alt="placeholder" />
        </div>
        <div>
          <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={async (values) => {
              setLoading(true);
              setError(false);
              setResponse(false);

              let res;
              try {
                res = await fetch(APIURL, {
                  method: "post",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },

                  //serialize JSON body
                  body: JSON.stringify({
                    ...values,
                  }),
                });
                let json = await res.json();
                setLoading(false);
                setResponse(json);
              } catch (e) {
                setError(`Error`);
                setLoading(false);
                console.error(`Error ${e}`);
              }
            }}
          >
            <Form>
              <TextInput
                label="Email"
                name="email"
                type="email"
                placeholder="dog@gooddog.org"
              />
              <TextInput
                label="Password"
                name="password"
                type="password"
                placeholder="Enter Password"
              />
              <TextInput
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
              />
              <TextInput
                label="Pet Name"
                name="petName"
                type="text"
                placeholder="Your Pet's Name"
              />
              <TextInput
                label="Pet Weight"
                name="petWeight"
                type="number"
                placeholder="Your Pet's Weight"
              />
              <TextInput
                label="Pet Ideal Weight"
                name="petIdealWeight"
                type="number"
                placeholder="Your Ideal Pet's Weight"
              />
              <button type="submit">Submit</button>
            </Form>
          </Formik>
        </div>
      </div>
      {loading && <h3>Loading...</h3>}
      {!loading && error && <h3>{error}</h3>}
      {!loading && response && (
        <h3>
          {response.malformed || !response.success
            ? response.message
            : "Success"}
        </h3>
      )}
    </main>
  );
}

export default App;
