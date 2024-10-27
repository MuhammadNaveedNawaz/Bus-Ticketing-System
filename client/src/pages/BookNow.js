import React, { useEffect, useState } from "react";
import { Col, message, Row } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance } from "../helpers/axiosInstance";
import { HideLoading, ShowLoading } from "../redux/alertsSlice";
import { useNavigate, useParams } from "react-router-dom";
import SeatSelection from "../components/SeatSelection";
import StripeCheckout from "react-stripe-checkout";

function BookNow() {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [bus, setBus] = useState(null);

  const getBus = async () => {
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.post("/api/buses/get-bus-by-id", {
        _id: params.id,
      });
      dispatch(HideLoading());
      if (response.data.success) {
        setBus(response.data.data);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error("Failed to fetch bus details.");
    }
  };

  const bookNow = async (transactionId = null) => {
    if (selectedSeats.length === 0) {
      message.warning("Please select at least one seat.");
      return;
    }

    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.post("/api/bookings/book-seat", {
        bus: bus._id,
        seats: selectedSeats,
        transactionId,
      });
      dispatch(HideLoading());
      if (response.data.success) {
        message.success("Booking successful!");
        navigate("/bookings");
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error("Booking failed. Please try again.");
    }
  };

  const onToken = async (token) => {
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.post("/api/bookings/make-payment", {
        token,
        amount: selectedSeats.length * bus.fare * 100,
      });
      dispatch(HideLoading());
      if (response.data.success) {
        message.success(response.data.message);
        bookNow(response.data.data.transactionId);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getBus();
  }, []);

  return (
    <div>
      {bus && (
        <Row className="mt-3" gutter={[30,30]}>
          <Col lg={12} xs={24} sm={24}>
            <p className="text-2xl primary-text">{bus.name}</p>
            <hr />
            <p className="text-md">
              {bus.from} - {bus.to}
            </p>
            <hr />
            <div className="flex flex-col gap-2">
              <p className="text-md">
                <b>Journey date</b>: {bus.journeyDate}
              </p>
              <p className="text-md">
                <b>Fare</b> : $ {bus.fare}/-
              </p>
              <p className="text-md">
                <b>Departure</b> : {bus.departure}
              </p>
              <p className="text-md">
                <b>Arrival Time</b> : {bus.arrival}
              </p>
              <p className="text-md">
                <b>Capacity</b> : {bus.capacity}
              </p>

              <p className="text-md">
                <b>seat Left</b> : {bus.capacity - bus.seatsBooked.length}
              </p>
            </div>
            <hr />
            <div className="flex flex-col gap-2">
              <p className="text-2xl">
                Selected Seats :{selectedSeats.join(", ")}
              </p>
              <p className="text-2xl mt-2">
                Fare : {bus.fare * selectedSeats.length}/-
              </p>
              <hr />

              <StripeCheckout
                billingAddress
                token={onToken}
                amount={bus.fare * selectedSeats.length * 100}
                currency="INR"
                stripeKey="pk_test_51QED2yRsdyyMWDcwRKkgIFtP2Gy4aRosXRvyV5xtIHj4Kw2nAEdu9JFNLEtLN9zYQHx7AzXmUsU4Gh7saq5zRQGl00aRjF1lGd"
              >
                <button
                  className={`btn primary-btn ${
                    selectedSeats.length === 0 && "disabled-btn"
                  }}`}
                  disabled={selectedSeats.length === 0}
                >
                  Book Now
                </button>
              </StripeCheckout>
            </div>
          </Col>

          <Col lg={12} xs={24} sm={24}>
            <SeatSelection
              selectedSeats={selectedSeats}
              setSelectedSeats={setSelectedSeats}
              bus={bus}
            />
          </Col>
        </Row>
      )}
    </div>
  );
}

export default BookNow;
