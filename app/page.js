"use client";
import { useState, useEffect, useRef } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import LoadingIndicator from "./components/loading-indicator";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
  const [exchangeRate, setExchangeRate] = useState("");
  const [storedRates, setStoredRates] = useState([]);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [makeRecurring, setMakeRecurring] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [minutes, setMinutes] = useState("0");
  const [hours, setHours] = useState("0");
  const [days, setDays] = useState("0");
  const [thresholdValue, setThresholdValue] = useState("");
  const [thresholdValueError, setThresholdValueError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const intervalRef = useRef(null);

  const emailCheck = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const thresholdCheck =
    /^(0\.(0[1-9]|[1-9][0-9]?)|[1-4](\.\d{1,2})?|5(\.00?)?)$/;

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
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      });
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
          console.log(data);
        });
    }
  };

  const handleTrend = (data, threshold) => {
    if (data > threshold) {
      return "Exchange Rate Above Minimum Threshold";
    } else if (data > storedRates[storedRates.length - 5] + 0.05) {
      return "Exchange Rate Trending Up";
    } else {
      return false;
    }
  };
  // const handleGetRate = (recipientEmail, thresholdValue) => {
  //   fetch(`/api/scraper`, {
  //     method: "GET",
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log(data);
  //       setExchangeRate(data);
  //       if (!storedRates.length) {
  //         setStoredRates([data]);
  //       } else if (storedRates.length >= 96) {
  //       } else {
  //         setStoredRates([...storedRates, data]);
  //       }
  //       const trend = handleTrend(data, thresholdValue);
  //       if (trend) {
  //         fetch(`/api/send-email`, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({
  //             email: recipientEmail,
  //             trend: trend,
  //             exchangeRate: data,
  //           }),
  //         })
  //           .then((response) => response.json())
  //           .then((data) => {
  //             console.log(data);
  //           })
  //           .catch((error) => {
  //             console.error("Error:", error);
  //             alert("Failed to Send Email");
  //           });
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //       alert("Failed to Get Exchange Rates");
  //     });
  // };

  const handleExecute = (recipientEmail, thresholdValue) => {
    if (!makeRecurring) {
      const handleGetRateOnce = () => {
        setIsLoading(true);
        fetch(`/api/scraper-cheerio`, {
          method: "GET",
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            setExchangeRate(data);
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("Failed to Get Exchange Rates");
          })
          .finally(() => {
            setIsLoading(false);
          });
      };
      handleGetRateOnce();
    } else {
      if (!emailCheck.test(recipientEmail)) {
        setEmailError("Please Enter a Valid Email");
      }
      if (minutes == "0" && hours == "0" && days == "0") {
        setTimeError("Please Select a Time Range");
      }
      if (!thresholdCheck.test(thresholdValue)) {
        setThresholdValueError(
          "Please Enter a Valid Value Between $0.01 & $5.00"
        );
      }
      if (
        emailCheck.test(recipientEmail) &&
        (minutes != "0" || hours != "0" || days != "0") &&
        thresholdCheck.test(thresholdValue)
      ) {
        const time =
          1000 * 60 * minutes +
          1000 * 60 * 60 * hours +
          1000 * 60 * 60 * 24 * days;
        if (!intervalRef.current) {
          const handleGetRate = () => {
            setIsLoading(true);
            fetch(`/api/scraper-cheerio`, {
              method: "GET",
            })
              .then((response) => response.json())
              .then((data) => {
                console.log(data);
                setExchangeRate(data);
                if (!storedRates.length) {
                  setStoredRates([data]);
                } else if (storedRates.length >= 96) {
                } else {
                  setStoredRates([...storedRates, data]);
                }
                const trend = handleTrend(data, thresholdValue);
                if (trend) {
                  fetch(`/api/send-email`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      email: recipientEmail,
                      trend: trend,
                      exchangeRate: data,
                    }),
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      console.log(data);
                    })
                    .catch((error) => {
                      console.error("Error:", error);
                      alert("Failed to Send Email");
                    });
                }
              })
              .catch((error) => {
                console.error("Error:", error);
                alert("Failed to Get Exchange Rates");
              })
              .finally(() => {
                setIsLoading(false);
              });
          };
          handleGetRate(); // fetch immediately
          intervalRef.current = setInterval(handleGetRate, time); // every 15 min
          setExecuting(true);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="main-div">
      <Form>
        <Row>
          <Form.Group
            className="mb-3 make-recurring-row"
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
                className="mb-3"
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
                className="mb-3"
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
              <Form.Group as={Col}>
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
              <Form.Group as={Col}>
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
              <Form.Group as={Col}>
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
          </Row>
        ) : null}
      </Form>
      <div className="button-div">
        <Button
          variant="primary"
          className="rate-buttons"
          onClick={() => {
            //handleExecute(email, Number(thresholdValue));
            handleRecurringEmailRequest();
          }}
        >
          Get Exchange Rate
        </Button>

        <Button
          variant="danger"
          className="rate-buttons"
          onClick={() => {
            // if (intervalRef.current) {
            //   clearInterval(intervalRef.current);
            //   intervalRef.current = null;
            //   setExecuting(false);
            // }
            handleDeleteRecurringEmailRequests();
          }}
        >
          Stop Getting Rates
        </Button>
      </div>
      {isLoading ? (
        <LoadingIndicator />
      ) : typeof exchangeRate === "number" ? (
        <h3 className="exchange-rate">{`1€ = $${exchangeRate}`}</h3>
      ) : (
        <h3>Click Get Exchange Rate</h3>
      )}
    </div>
  );
}
