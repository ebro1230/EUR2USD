"use client";
import { useState, useEffect } from "react";
import { Button, Form, Row, Col, Toast, ToastContainer } from "react-bootstrap";
import LoadingIndicator from "./components/loading-indicator";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Home() {
  const [exchangeRate, setExchangeRate] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [makeRecurring, setMakeRecurring] = useState(false);
  const [minutes, setMinutes] = useState("0");
  const [hours, setHours] = useState("0");
  const [days, setDays] = useState("0");
  const [thresholdValue, setThresholdValue] = useState("");
  const [thresholdValueError, setThresholdValueError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [toastIcon, setToastIcon] = useState("");
  const [emailTrend, setEmailTrend] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  const emailCheck = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const thresholdCheck =
    /^(?:0\.(?!0{5})\d{1,5}|[1-4](?:\.\d{1,5})?|5(?:\.0{1,5})?)$/;

  const daysRange = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  ];
  const hoursRange = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23,
  ];
  const minutesRange = [0, 15, 30, 45];

  const handleRecurringEmailRequest = () => {
    if (minutes == "0" && hours == "0" && days == "0") {
      setTimeError(
        "Please Enter a Valid Time Interval to Check the Exchange Rate"
      );
    }
    if (!emailCheck.test(email)) {
      setEmailError("Please Enter a Valid Email");
    }
    if (!thresholdCheck.test(thresholdValue)) {
      setThresholdValueError(
        "Please enter a Threshold Value for Receiving Emails Between $0.00001 & $5.00000"
      );
    }
    if (
      !timeError &&
      !emailError &&
      !thresholdValueError &&
      emailCheck.test(email) &&
      thresholdCheck.test(thresholdValue) &&
      (minutes != "0" || hours != "0" || days != "0")
    ) {
      fetch(`/api/email-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          interval: Number(
            1000 * 60 * Number(minutes) +
              1000 * 60 * 60 * Number(hours) +
              1000 * 60 * 60 * 24 * Number(days)
          ),
          lastCheck: new Date(),
          days: Number(days),
          hours: Number(hours),
          minutes: Number(minutes),
          thresholdValue: Number(thresholdValue),
          trendNotifications: emailTrend,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setToastMessage(data.message);
            setRequestStatus("Request Successful");
            setToastIcon(
              <i
                className="bi bi-check-square"
                style={{ color: "green", marginRight: "1rem" }}
              ></i>
            );
          } else {
            setToastMessage(data.error);
            setRequestStatus("Request Error");
            setToastIcon(
              <i
                className="bi bi-x-square-fill"
                style={{ color: "red", marginRight: "1rem" }}
              ></i>
            );
          }
          setShowToast(true);
        });
    }
  };

  const handleDeleteRecurringEmailRequests = () => {
    if (!emailCheck.test(email)) {
      setEmailError("Please Enter a Valid Email");
    } else {
      fetch(`/api/email-requests`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setToastMessage(data.message);
            setRequestStatus("Request Successful");
            setToastIcon(
              <i
                className="bi bi-check-square"
                style={{ color: "green", marginRight: "1rem" }}
              ></i>
            );
          } else {
            setToastMessage(data.error);
            setRequestStatus("Request Error");
            setToastIcon(
              <i
                className="bi bi-x-square-fill"
                style={{ color: "red", marginRight: "1rem" }}
              ></i>
            );
          }
          setShowToast(true);
        });
    }
  };

  const handleGetRateOnce = () => {
    setIsLoading(true);
    fetch(`/api/scraper-cheerio`, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setExchangeRate(Number(data.replace(/,/g, "")) / 1000);
      })
      .catch((error) => {
        console.error("Error:", error);
        setToastMessage("Failed to Get Exchange Rates");
        setRequestStatus("Request Error");
        setToastIcon(
          <i
            className="bi bi-x-square-fill"
            style={{ color: "red", marginRight: "1rem" }}
          ></i>
        );

        setShowToast(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!exchangeRate) {
      handleGetRateOnce();
    }

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="main-div">
      {isLoading ? (
        <LoadingIndicator />
      ) : typeof exchangeRate === "number" ? (
        <div className="exchange-rate-display-div">
          <h2 className="exchange-rate">EUR to USD Exchange Rate: </h2>
          <h4 className="exchange-rate">{`1€ = $${exchangeRate.toFixed(
            5
          )}`}</h4>
        </div>
      ) : null}
      <div className="button-div">
        <Button
          variant="primary"
          className="rate-buttons"
          onClick={() => {
            handleGetRateOnce();
          }}
        >
          Get Exchange Rate
        </Button>
      </div>
      <Form
        style={{
          width:
            screenWidth <= 576
              ? "95%"
              : screenWidth <= 1000
              ? "75%"
              : screenWidth <= 729
              ? "85%"
              : "50%",
        }}
      >
        <Row>
          <Form.Group
            className="make-recurring-row"
            controlId="formTimeFrame"
            style={{ display: "flex" }}
          >
            <Form.Check // prettier-ignore
              type="checkbox"
              id={`Set Recurring Email Notifications`}
              label={`Set Recurring Email Notifications`}
              onChange={(e) => {
                setMakeRecurring(e.target.checked);
                setTimeError("");
                setThresholdValueError("");
                setEmailError("");
                setEmail("");
                setThresholdValue("");
                setDays("0");
                setHours("0");
                setMinutes("0");
              }}
            />
          </Form.Group>
        </Row>

        {makeRecurring ? (
          <Row>
            <Row>
              <Form.Group
                as={Col}
                className="form-group"
                controlId="formBasicEmail"
                style={{ display: "flex", flexDirection: "column" }}
              >
                <Form.Label>Email address:</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="JohnDoe@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleExecute(email, Number(thresholdValue));
                    }
                  }}
                />
                {emailError ? (
                  <Form.Label className="error-message">
                    {emailError}
                  </Form.Label>
                ) : null}
              </Form.Group>
              <Form.Group
                as={Col}
                className="form-group"
                controlId="formBasicEmail"
                style={{ display: "flex", flexDirection: "column" }}
              >
                <Form.Label>Threshold Value:</Form.Label>
                <Form.Control
                  type="input"
                  placeholder="$1.21"
                  value={thresholdValue ? `$${thresholdValue}` : "$"}
                  onChange={(e) => {
                    setThresholdValue(e.target.value.slice(1));
                    setThresholdValueError("");
                  }}
                />
                {thresholdValueError ? (
                  <Form.Label className="error-message">
                    {thresholdValueError}
                  </Form.Label>
                ) : null}
              </Form.Group>
            </Row>
            <Row>
              <Form.Label>Check Rates Every:</Form.Label>
            </Row>
            <Row>
              <Form.Group as={Col} className="form-group">
                <Form.Label>{`Day(s):`}</Form.Label>
                <Form.Select
                  name="days"
                  onChange={(e) => {
                    setDays(e.target.value);
                    setTimeError("");
                  }}
                  value={days.length ? days : "days"}
                >
                  {daysRange.map((day) => {
                    return (
                      <option key={`day+${day}`} value={day}>
                        {day}
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} className="form-group">
                <Form.Label>{`Hour(s):`}</Form.Label>
                <Form.Select
                  name="hours"
                  onChange={(e) => {
                    setHours(e.target.value);
                    setTimeError("");
                  }}
                  value={hours.length ? hours : "hours"}
                >
                  {hoursRange.map((hour) => {
                    return (
                      <option key={`hour+${hour}`} value={hour}>
                        {hour}
                      </option>
                    );
                  })}
                </Form.Select>
                {timeError ? (
                  <Form.Label className="error-message">{timeError}</Form.Label>
                ) : null}
              </Form.Group>
              <Form.Group as={Col} className="form-group">
                <Form.Label>{`Minute(s):`}</Form.Label>
                <Form.Select
                  name="minutes"
                  onChange={(e) => {
                    setMinutes(e.target.value);
                    setTimeError("");
                  }}
                  value={minutes.length ? minutes : "minutes"}
                >
                  {minutesRange.map((minute) => {
                    return (
                      <option key={`minute+${minute}`} value={minute}>
                        {minute}
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
            </Row>
            <Row style={{ marginTop: "1rem" }}>
              <Form.Group
                className="make-recurring-row"
                controlId="formTimeFrame"
                style={{ display: "flex" }}
              >
                <Form.Check // prettier-ignore
                  type="checkbox"
                  id={`Also Send Exchange Rate Trend Notifications`}
                  label={`Also Send Exchange Rate Trend Notifications`}
                  onChange={(e) => {
                    setEmailTrend(e.target.checked);
                  }}
                />
              </Form.Group>
            </Row>
          </Row>
        ) : null}
      </Form>
      {makeRecurring ? (
        <div className="button-div">
          <Button
            variant="success"
            className="rate-buttons"
            style={{ fontSize: screenWidth <= 405 ? "1rem" : null }}
            onClick={() => {
              handleRecurringEmailRequest();
            }}
          >
            Set Recurring Emails
          </Button>

          <Button
            variant="danger"
            className="rate-buttons"
            onClick={() => {
              handleDeleteRecurringEmailRequests();
            }}
            style={{ fontSize: screenWidth <= 405 ? "1rem" : null }}
          >
            Remove Recurring Emails
          </Button>
        </div>
      ) : null}
      <ToastContainer position="middle-center" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={5000}
          autohide
        >
          <Toast.Header>
            {toastIcon}
            <strong className="me-auto">{requestStatus}</strong>
          </Toast.Header>
          <Toast.Body style={{ textAlign: "center" }}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
