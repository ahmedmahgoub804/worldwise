// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";

import styles from "./Form.module.css";
import Button from "./Button";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Spinner from "./Spinner";
import Message from "./Message";
import { useCities } from "../context/CitiesContext";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  console.log(String.fromCodePoint(...codePoints));
  return String.fromCodePoint(...codePoints);
}

let BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client?";
function Form() {
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [emoji, setEmoji] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isLoadingReverse, setIsLoadingReverse] = useState(false);
  const [locationError, setLocationError] = useState("");
  const navigate = useNavigate();
  const [mapLat, mapLng] = useUrlPosition();
  const { createCity, isLoading } = useCities();

  useEffect(
    function () {
      async function fetchCity() {
        try {
          setIsLoadingReverse(true);
          setLocationError("");

          let res = await fetch(
            `${BASE_URL}latitude=${mapLat}&longitude=${mapLng}`
          );
          let data = await res.json();

          if (!data.countryName) {
            throw new Error("Please Click Inside A Country");
          }

          setCityName(data.city || data.locality || "");
          setCountry(data.countryName);
          setEmoji(data.countryCode);
        } catch (error) {
          setLocationError(error.message);
        } finally {
          setIsLoadingReverse(false);
        }
      }
      fetchCity();
    },
    [mapLat, mapLng]
  );

  async function handleSubmit(e) {
    e.preventDefault();

    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat: mapLat, lng: mapLng },
    };

    await createCity(newCity);
    navigate("/app/cities");
  }

  if (isLoadingReverse) return <Spinner />;
  if (locationError) return <Message message={locationError} />;
  if (mapLat === null && mapLng === null) {
    return <Message message="Start By Clicking On The Map" />;
  }

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        {/* <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        /> */}
        <DatePicker
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat={"dd/MM/yyyy"}
          id="date"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary"> Add</Button>
      </div>
    </form>
  );
}

export default Form;
