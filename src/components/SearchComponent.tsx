import { ChangeEvent, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { passengerOptions } from "@/constants/passenger";
import { AirportOption } from "@/model/airportmodel";
import { timeOptions } from "@/constants/timeOptions";
import { FlightData, Details } from "@/model/submitPayload";
import { FlightLeg } from "@/model/FlightLeg";
import { SendMailPayload } from "@/model/sendMailPayload";

const SearchComponent = () => {
  const [searchToText, setSearchToText] = useState("");
  const [searchFromText, setSearchFromText] = useState("");
  const [searchResultsFrom, setSearchResultsFrom] = useState<AirportOption[]>(
    []
  );
  const [searchResultsTo, setSearchResultsTo] = useState<AirportOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPassengers, setSelectedPassengers] = useState("");
  const [selectedToOption, setSelectedToOption] = useState<AirportOption | null>(null);
  const [selectedFromOption, setSelectedFromOption] = useState<AirportOption | null>(null);
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [mailData, setMailData] = useState<FlightData | null>(null);

  

  useEffect(() => {
    if (selectedFromOption) {
      setSearchResultsFrom([]);
    }
  }, [selectedFromOption]);

  useEffect(() => {
    if (selectedToOption) {
      setSearchResultsTo([]);
    }
  }, [selectedToOption]);

  const handleSearch = async (searchText: string, target: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/getFlightName?text=${searchText}`);
      const data = await response.json();
      const results = data.airports;
      if (target === "from") {
        setSearchResultsFrom((prevResults) => {
          return results;
        });
      } else if (target === "to") {
        setSearchResultsTo((prevResults) => {
          return results;
        });
      }
    } catch (error) {
      setError("Error fetching data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    target: string
  ) => {
    const searchText = e.target.value;
    if (target === "from") {
      setSearchFromText(searchText);
      if (searchText) {
        handleSearch(searchText, target);
      } else {
        setSearchResultsFrom([]);
      }
    } else if (target === "to") {
      setSearchToText(searchText);
      if (searchText) {
        handleSearch(searchText, target);
      } else {
        setSearchResultsTo([]);
      }
    }
  };

  let opId: string = "";
  let aircraftTypes: string[] = [];

  const generateRequestPayload = (): FlightData | null => {
    if (
      !selectedFromOption ||
      !selectedToOption ||
      !selectedDate ||
      !selectedTime ||
      !selectedPassengers
    ) {
      return null; // Return null if any required field is missing
    }

    const formattedDate = `${(selectedDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${selectedDate
      .getDate()
      .toString()
      .padStart(2, "0")}/${selectedDate.getFullYear()}`;

    const leg: FlightLeg = {
      fromAirport: selectedFromOption,
      toAirport: selectedToOption,
      fromDate: formattedDate,
      returnDate: null,
      depTime: selectedTime,
      returnDepTime: null,
      searchTextOne: selectedFromOption.title,
      searchTextTwo: selectedToOption.title,
      fromAirportValid: true,
      toAirportValid: true,
      departureTime: selectedTime,
      dateOpened: false,
      returnDateOpened: false,
      from: selectedFromOption.title,
      to: selectedToOption.title,
      fromId: selectedFromOption._id,
      toId: selectedToOption._id,
      fromLat: selectedFromOption.lat,
      fromLng: selectedFromOption.lng,
      toLat: selectedToOption.lat,
      toLng: selectedToOption.lng,
      ts: Date.now(),
    };

    const details: Details = {
      type: "Quote", // Replace with the appropriate type
      inquireType: "One Way", // Replace with the appropriate inquireType
      pax: parseInt(selectedPassengers),
      categories: ["lightJet", "mediumJet", "superMidSizeJet"], // Replace with the appropriate categories array
      maxFuelStops: "0",
      paxOption: {
        title: parseInt(selectedPassengers),
        value: parseInt(selectedPassengers),
      },
      safetyRating: { isWyvernRatedFilter: false, isArgusRatedFilter: false }, // Replace with the appropriate safetyRating values
      selectedAircraftIds: [], // Replace with the appropriate selectedAircraftIds array
      summaryByCategory: null,
      homeBaseRadNM: 400, // Replace with the appropriate homeBaseRadNM value
      checkRunways: false, // Replace with the appropriate checkRunways value
    };

    const payload: FlightData = {
      opIds: [null],
      from: selectedFromOption.title,
      to: selectedToOption.title,
      fromId: selectedFromOption._id,
      toId: selectedToOption._id,
      ts: Date.now(),
      fromDate: formattedDate,
      returnDate: null,
      trip: "oneWay",
      legs: [leg],
      details,
      source: "fy",
      worker: 1,
    };
    console.log(payload);
    return payload;
  };

  const generateRequestResponse = async (payload: FlightData) => {
    setLoading(true);
    try {
      const response = await fetch("https://openpoint.co/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      setFlightData(data);
      console.log(flightData);

      // set opid
      const opsId = Object.keys(data.flights.ops)[0]; // Extracting the first key from ops
      opId = data.flights.ops[opsId]._id;
      console.log("OpId:", opId);

      //set type
      const departingFlights = data.flights.departing;
      aircraftTypes = [];
      for (const flight of departingFlights) {
        let aircraftType: string = flight.ac.type;
        if (!aircraftTypes.includes(aircraftType)) {
          aircraftTypes.push(aircraftType);
        }
      }
    } catch (error) {
      setError("Error sending payload");
      console.error("Error sending payload:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMailPayload = (): SendMailPayload | null => {
    if (
      !selectedFromOption ||
      !selectedToOption ||
      !selectedDate ||
      !selectedTime ||
      !selectedPassengers
    ) {
      return null; // Return null if any required field is missing
    }

    const formattedDate = `${(selectedDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${selectedDate
      .getDate()
      .toString()
      .padStart(2, "0")}/${selectedDate.getFullYear()}`;

    const message = {
      subject: `Need: ${formattedDate} ${selectedFromOption.title}-${selectedToOption.title} Pax ${selectedPassengers}`,
      text: `- WHOLESALE TRIP REQUESTED -\r\n\r\nLeg 1: ${formattedDate} ${selectedTime}L ${selectedFromOption.title}-${selectedToOption.title}\r\n\r\nPassengers: ${selectedPassengers}\r\n\r\nCategories: Super Mid Size`,
    };

    const payload: SendMailPayload = {
      opIds: opId ? [opId] : [], // Use opId if it's not null, otherwise use an empty array
      sender: {
        status: "Professional",
        email: "shreyadr09@gmail.com",
        phone: "5126269167",
        name: "Age of AI, LLC",
        airEmail: "shreyadr09@gmail.com",
        sendToAirMail: false,
      },
      message,
      comment: "",
      messageByOps: {},
      tripType: "One Way",
      pax: parseInt(selectedPassengers),
      categories: aircraftTypes,
      specificAircraft: [],
      legs: [
        {
          fromAirport: selectedFromOption,
          toAirport: selectedToOption,
          fromDate: formattedDate,
          returnDate: null,
          depTime: selectedTime,
          returnDepTime: null,
          searchTextOne: selectedFromOption.title,
          searchTextTwo: selectedToOption.title,
          fromAirportValid: true,
          toAirportValid: true,
          departureTime: selectedTime,
          dateOpened: false,
          returnDateOpened: false,
          from: selectedFromOption.title,
          to: selectedToOption.title,
          fromId: selectedFromOption._id,
          toId: selectedToOption._id,
          fromLat: selectedFromOption.lat,
          fromLng: selectedFromOption.lng,
          toLat: selectedToOption.lat,
          toLng: selectedToOption.lng,
          ts: Date.now(),
        },
      ],
      opDetails: opId
        ? { [opId]: { fleetSize: 1, priceRange: [], priceRangeStr: "N/A" } }
        : {},
    };

    console.log(payload);
    return payload;
  };

  const generateMailResponse = async (payload: SendMailPayload) => {
    setLoading(true);
    try {
      const response = await fetch("https://openpoint.co/api/inquiry/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      setMailData(data);
      console.log(mailData);

    } catch (error) {
      setError("Error sending payload");
      console.error("Error sending payload:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    const payload = generateRequestPayload();
    if (payload) {
      setLoading(true); // Set loading state to true before sending the request
      setError(""); // Clear any previous error
      generateRequestResponse(payload)
        .then(() => {
          setLoading(false); // Set loading state to false after the request completes
          const mailPayload = generateMailPayload(); // Call generateMailPayload after generateRequestResponse completes
          if (mailPayload) {
            console.log("Mail payload:", mailPayload);
            generateMailResponse(mailPayload)
              .then(() => {
                toast.success("Mail sent successfully");
                console.log("Mail sent successfully");
                setSuccess("Mail sent")
              })
              .catch((error) => {
                toast.error("Error sending mail");
                setError("Error sending mail");
                console.error("Error sending mail:", error);
              });
          }
        })
        .catch((error) => {
          setError("Error sending payload");
          toast.error("Error sending payload");
          console.error("Error sending payload:", error);
          setLoading(false); // Set loading state to false if an error occurs
        });
    } else {
      setError("Please fill in all required fields");
      toast.error("Please fill in all required fields");
    }
  };

  const handleSelectChange = (
    e: ChangeEvent<HTMLSelectElement>,
    target: string
  ) => {
    const selectedValue = e.target.value;
    if (target === "from") {
      setSearchFromText(selectedValue);
    } else if (target === "to") {
      setSearchToText(selectedValue);
    }
  };

  useEffect(() => {
    if (selectedFromOption === null && searchResultsFrom.length > 0) {
      const selectedOption = searchResultsFrom.find(
        (option) => option.title === searchFromText
      );
      setSelectedFromOption(selectedOption || null);
      console.log(selectedOption);
    }
  }, [searchFromText, searchResultsFrom, selectedFromOption]);

  useEffect(() => {
    if (selectedToOption === null && searchResultsTo.length > 0) {
      const selectedOption = searchResultsTo.find(
        (option) => option.title === searchToText
      );
      setSelectedToOption(selectedOption || null);
      console.log(selectedOption);
    }
  }, [searchToText, searchResultsTo, selectedToOption]);

  return (
    
    <div
      className="bg-red-100 w-screen h-screen p-8 space-y-8 flex flex-col items-center"
      style={{
        background: "url(/bg-image.png)",
        backgroundSize: "cover",
      }}>
      <h1 className="text-4xl font-bold text-blue-950">Charter.ai</h1>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-10 w-full">
        <div className="h-max flex flex-col sm:w-1/2 w-full bg-blue-100 p-2 rounded-lg shadow-md">
          <input
            className="text-black bg-white px-4 py-2 rounded-md mb-4 w-full outline-none border-none"
            type="text"
            value={searchFromText}
            onChange={(e) => handleInputChange(e, "from")}
            placeholder="From"
          />
          {searchResultsFrom.length > 0 && (
            <select
              className="text-black bg-white px-4 py-2 rounded-md w-full"
              multiple
              value={searchFromText}
              onChange={(e) => handleSelectChange(e, "from")}>
              {searchResultsFrom.map((result, index) => (
                <option key={index} value={result.title}>
                  {result.title}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-col bg-blue-100 h-max p-2 rounded-lg shadow-md w-full sm:w-1/2">
          <input
            className="text-black bg-white px-4 py-2 rounded-md mb-4 w-full outline-none border-none"
            type="text"
            value={searchToText}
            onChange={(e) => handleInputChange(e, "to")}
            placeholder="To"
          />
          {searchResultsTo.length > 0 && (
            <select
              className="text-black bg-white px-4 py-2 rounded-md w-full"
              multiple
              value={searchToText}
              onChange={(e) => handleSelectChange(e, "to")}>
              {searchResultsTo.map((result, index) => (
                <option key={index} value={result.title}>
                  {result.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-10 space-y-6 md:flex-row items-end justify-center h-100 w-full">
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          dateFormat="MM/dd/yyyy"
          className="text-black px-4 py-2 w-full md:w-[200px] h-[40px]  border-none outline-none"
          placeholderText="Date"
        />

        <Dropdown
          options={timeOptions}
          onChange={(option) => setSelectedTime(option.value)}
          value={selectedTime}
          placeholder="Departure Time"
          className="text-black bg-red-100 h-[40px] w-full sm:w-auto "
          placeholderClassName="w-full md:w-[200px] border-none outline-none"
        />

        <Dropdown
          options={passengerOptions.map((option) => ({
            value: option.value.toString(),
            label: option.label,
          }))}
          onChange={(option) => setSelectedPassengers(option.value)}
          value={selectedPassengers}
          placeholder="Passengers"
          className="text-black bg-white h-[40px] w-full sm:w-auto"
          placeholderClassName="w-full md:w-[200px]"
        />
      </div>

      <div className="bg-transparent p-4 space-x-4 flex flex-row items-center">
        <button
          onClick={handleButtonClick}
          className="bg-blue-950 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Submit
        </button>
      </div>
      {success && <p>{success}</p>}
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
    </div>
  );
};

export default SearchComponent;
