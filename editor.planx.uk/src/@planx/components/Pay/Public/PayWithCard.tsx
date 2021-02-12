export default Component;

import { makeStyles } from "@material-ui/core/styles";
import Card from "@planx/components/shared/Preview/Card";
import { useFormik } from "formik";
import { validate as validateCreditCard } from "luhn";
import { isValid as isValidPostcode } from "postcode";
import React from "react";
import ErrorWrapper from "ui/ErrorWrapper";
import { object, string } from "yup";

import { validateEmail } from "../../shared/utils";
import Button from "./Button";

const useStyles = makeStyles({
  root: {
    "& *": {
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
    },
    "& > * + *": {
      marginTop: 30,
    },
  },
  h1: {
    fontSize: "25px",
    fontWeight: 700,
    lineHeight: "30px",
  },
  h2: {
    fontWeight: 700,
    fontSize: "20px",
    marginTop: "20px",
  },
  label: {
    fontSize: "15px",
    fontWeight: 700,
    lineHeight: "18px",
    color: "#000B",
    display: "block",
    marginTop: "12px",
    marginBottom: "8px",
  },
  input: {
    fontSize: "15px",
    border: "2px solid black",
    padding: "10px",
    marginTop: 0,
    width: "400px",
  },
  example: {
    fontSize: "15px",
    color: "#0008",
    margin: 0,
    padding: 0,
    marginBottom: "8px",
  },
  expiry: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
    gridColumnGap: "5px",
    gridRowGap: "0px",
    width: "137px",
    height: "60px",
    "& input": { width: "52px" },
    "& span": { color: "#000B", fontSize: "15px" },
    "& :nth-child(1)": { gridArea: "1 / 1 / 2 / 2" },
    "& :nth-child(2)": { gridArea: "2 / 1 / 3 / 2" },
    "& :nth-child(3)": {
      gridArea: "2 / 2 / 3 / 3",
      textAlign: "center",
      lineHeight: "52px",
    },
    "& :nth-child(4)": { gridArea: "1 / 3 / 2 / 4" },
    "& :nth-child(5)": { gridArea: "2 / 3 / 3 / 4" },
  },
  cancel: {
    fontSize: "15px",
    color: "#0008",
  },
});

function Component(props: any) {
  const c = useStyles();
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      // Card
      cardNumber: "",
      cardSecurityCode: "",
      expirationMonth: "",
      expirationYear: "",
      // Address
      number: "",
      street: "",
      city: "",
      postcode: "",
      country: "United Kingdom",
    },
    onSubmit: () => {
      props.goToSummary();
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: object({
      name: string().required(),
      email: string()
        .required()
        .test({
          name: "validEmail",
          message: "Must be a valid email",
          test: (email: string | undefined) => {
            return Boolean(email && validateEmail(email));
          },
        }),
      // Card
      cardNumber: string()
        .required()
        .test({
          name: "validCreditCard",
          message: "Must be a valid credit card number",
          test: (creditCardNumber: string | undefined) => {
            return Boolean(
              creditCardNumber && validateCreditCard(creditCardNumber)
            );
          },
        }),
      cardSecurityCode: string()
        .required()
        .test({
          name: "validSecurityCode",
          message: "Must be a valid security code",
          test: (securityCode: string | undefined) => {
            return Boolean(securityCode && securityCode.length >= 3);
          },
        }),
      expirationYear: string().required(),
      expirationMonth: string().required(),
      // Address
      number: string().required(),
      street: string().required(),
      city: string().required(),
      postcode: string()
        .required()
        .test({
          name: "validPostCode",
          message: "Must be a valid postal code",
          test: (postcode: string | undefined) => {
            return Boolean(postcode && isValidPostcode(postcode.trim()));
          },
        }),
      country: string()
        .required()
        .test({
          name: "validCountry",
          message: "Must be a valid country",
          test: (country: string | undefined) => {
            return Boolean(country && country.length > 1);
          },
        }),
    }),
  });
  return (
    <Card>
      <div className={c.root}>
        <h1 className={c.h1}>Enter card details</h1>
        <ErrorWrapper error={formik.errors.cardNumber}>
          <div>
            <label htmlFor="pay-card-number" className={c.label}>
              Card number
            </label>
            <input
              className={c.input}
              id="pay-card-number"
              name="cardNumber"
              type="text"
              value={formik.values.cardNumber}
              onInput={formik.handleChange}
              placeholder="enter the long number on your card"
              style={{ width: 400 }}
            />
            <p style={{ marginTop: "8px" }}>
              <CardsImage />
            </p>
          </div>
        </ErrorWrapper>
        <ErrorWrapper
          error={formik.errors.expirationMonth || formik.errors.expirationYear}
        >
          <div>
            <label htmlFor="pay-expiry-month" className={c.label}>
              Expiry date
            </label>
            <p className={c.example}>For example, 10/20</p>
            <div className={c.expiry}>
              <span>Month</span>
              <div>
                <input
                  id="pay-expiry-month"
                  className={c.input}
                  type="text"
                  placeholder="10"
                />
              </div>
              <div>/</div>
              <span>Year</span>
              <div>
                <input className={c.input} type="text" placeholder="20" />
              </div>
            </div>
          </div>
        </ErrorWrapper>
        <ErrorWrapper error={formik.errors.name}>
          <div>
            <label htmlFor="pay-name" className={c.label}>
              Name on card
            </label>
            <input
              id="pay-name"
              className={c.input}
              placeholder="Name"
              name="name"
              value={formik.values.name}
              onInput={formik.handleChange}
            />
          </div>
        </ErrorWrapper>
        <ErrorWrapper error={formik.errors.cardSecurityCode}>
          <div>
            <label className={c.label} htmlFor="pay-security-code">
              Card security code
            </label>
            <p className={c.example}>The last 3 digits on the back</p>
            <div>
              <input
                className={c.input}
                id="pay-security-code"
                type="text"
                placeholder="000"
                name="cardSecurityCode"
                value={formik.values.cardSecurityCode}
                onInput={formik.handleChange}
                style={{ width: "83px" }}
              />
              <SecurityCodeImage style={{ marginLeft: "16px" }} />
            </div>
          </div>
        </ErrorWrapper>
        <h2 className={c.h2}>Billing address</h2>
        <ErrorWrapper error={formik.errors.country}>
          <div>
            <label className={c.label}>Country or territory</label>
            <input
              className={c.input}
              placeholder="United Kingdom"
              name="country"
              value={formik.values.country}
              onInput={formik.handleChange}
            />
          </div>
        </ErrorWrapper>
        <ErrorWrapper error={formik.errors.number || formik.errors.street}>
          <div>
            <label className={c.label}>
              Building number or name and street
            </label>
            <p style={{ marginBottom: "8px" }}>
              <input className={c.input} placeholder="" />
            </p>
            <p>
              <input className={c.input} placeholder="" />
            </p>
          </div>
        </ErrorWrapper>
        <ErrorWrapper error={formik.errors.city}>
          <div>
            <label className={c.label}>Town or city</label>
            <input
              name="city"
              value={formik.values.city}
              onInput={formik.handleChange}
              className={c.input}
              placeholder=""
            />
          </div>
        </ErrorWrapper>
        <ErrorWrapper error={formik.errors.postcode}>
          <div>
            <label className={c.label}>Postcode</label>
            <input
              className={c.input}
              placeholder=""
              style={{ width: "100px" }}
              name="postcode"
              value={formik.values.postcode}
              onInput={formik.handleChange}
            />
          </div>
        </ErrorWrapper>
        <ErrorWrapper error={formik.errors.email}>
          <div>
            <label htmlFor="pay-email" className={c.label}>
              Email
            </label>
            <p className={c.example}>
              We'll send your payment confirmation here
            </p>
            <input
              id="pay-email"
              name="email"
              value={formik.values.email}
              onInput={formik.handleChange}
              className={c.input}
              placeholder=""
            />
          </div>
        </ErrorWrapper>
        <div>
          <Button onClick={formik.handleSubmit}>Continue</Button>
        </div>
        <div>
          <a href="#" className={c.cancel} onClick={props.goBack}>
            Cancel payment
          </a>
        </div>
      </div>
    </Card>
  );
}

function CardsImage() {
  // XXX: Temporary, once integrated with Gov Pay UK this will
  //      become a dynamic component which highlights the current type of cards you have
  return (
    <img src="data:image/png;base64,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" />
  );
}

function SecurityCodeImage(props: any = {}) {
  return (
    <img
      {...props}
      src="data:image/png;base64,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"
    />
  );
}
