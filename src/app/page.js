"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from 'next/image';

export default function Home() {
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState(["Hospital Visit", "Online Consult"]);
  const [experience, setExperience] = useState([]);
  const [fees, setFees] = useState([]);
  const [language, setLanguage] = useState([]);
  const [facility, setFacility] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 10,
  });
  const [hasMore, setHasMore] = useState(true); // Track if there are more doctors to load
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const doctorListRef = useRef(null);

  const fetchDoctors = async (page = 0, append = false) => {
    if (isFetchingMore) return;
  
    setLoading(!append);
    setIsFetchingMore(true);
    setError(null);
  
    try {
      const params = new URLSearchParams({
        specialization: searchQuery || "",
        location: location || "",
        page: page.toString(),
        size: pagination.pageSize.toString(),
      });
  
      if (mode.length > 0) params.append("mode", mode.join(","));
      if (experience.length > 0) params.append("experience", experience.join(","));
      if (fees.length > 0) params.append("fee", fees.join(",")); // Updated to 'fee' per new API
      if (language.length > 0) params.append("language", language.join(","));
      if (facility.length > 0) params.append("facility", facility.join(","));
  
      const response = await fetch(`https://apollo-backend-0ktt.onrender.com/doctors/filterDoctors?${params.toString()}`, {
        method: "GET",
        headers: {
          "Accept": "*/*",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }
  
      const data = await response.json();
  
      const mappedDoctors = data.doctors.map(doctor => ({
        name: doctor.name,
        profileImageUrl: doctor.profileImageUrl,
        specialization: doctor.specialization,
        experience: doctor.experience,
        qualification: doctor.qualification,
        clinicName: doctor.clinicName,
        location: doctor.location,
        fee: doctor.fees.toString(), // Keep as 'fees' from backend
        cashback: doctor.doctorOfTheHour ? `${Math.round(doctor.fees * 0.15)} Cashback` : "",
        availability: doctor.availableTime,
      }));
  
      setDoctors(prev => (append ? [...prev, ...mappedDoctors] : mappedDoctors));
  
      setHasMore(mappedDoctors.length === pagination.pageSize);
  
      setPagination(prev => ({
        ...prev,
        currentPage: page,
      }));
    } catch (err) {
      setError(err.message);
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };
  

  useEffect(() => {
    setDoctors([]);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
    setHasMore(true); // Reset hasMore when filters change
    fetchDoctors(0, false);
  }, [searchQuery, location, mode, experience, fees, language, facility]);

  const clearFilters = () => {
    setSearchQuery("");
    setLocation("");
    setMode(["Hospital Visit", "Online Consult"]);
    setExperience([]);
    setFees([]);
    setLanguage([]);
    setFacility([]);
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
    setHasMore(true);
  };

  const handleScroll = useCallback(() => {
    const doctorList = doctorListRef.current;
    if (!doctorList) return;

    const { scrollTop, scrollHeight, clientHeight } = doctorList;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !isFetchingMore && hasMore) {
      const nextPage = pagination.currentPage + 1;
      fetchDoctors(nextPage, true);
    }
  }, [pagination.currentPage, hasMore, isFetchingMore]);

  useEffect(() => {
    const doctorList = doctorListRef.current;
    if (doctorList) {
      doctorList.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (doctorList) {
        doctorList.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  return (
    <div className="container bg-white mx-auto p-1.5 px-4 sm:px-6 md:px-[8.8vw] text-gray-800 overflow-y-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <Image
            src="/apollo247.svg"
            alt="Apollo 24/7 Logo"
            width={68}
            height={68}
            className="mr-2"
          />
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 ml-3.5">
              <Image
                src="https://images.apollo247.in/images/ic_location_new.svg?tr=q-80,w-50,dpr-2,c-at_max"
                width={25}
                height={25}
                alt="Location Icon"
              />
            </span>
            <div>
              <div className="text-[13px] text-gray-500">Select location</div>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="font-bold text-black bg-transparent focus:outline-none"
              >
                <option value="">Select Address</option>
                <option value="New York">New York</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Chicago">Chicago</option>
                <option value="San Francisco">San Francisco</option>
                <option value="Miami">Miami</option>
                <option value="Boston">Boston</option>
                <option value="Seattle">Seattle</option>
                <option value="Houston">Houston</option>
                <option value="Dallas">Dallas</option>
                <option value="Washington D.C.">Washington D.C.</option>
                <option value="Phoenix">Phoenix</option>
                <option value="San Diego">San Diego</option>
                <option value="Pune">Pune</option> {/* Added Pune to match example */}
              </select>
            </div>
          </div>
          <div className="relative w-full sm:w-[40vw] rounded-[10px] bg-[#f6f6f6] border border-[#71716e] sm:ml-[4.5vw]">
            <img
              src="https://images.apollo247.in/images/ic_search_new.svg?tr=q-80,w-50,dpr-2,c-at_max"
              alt="Search Icon"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Doctors, Specialties, Conditions etc."
              className="pl-10 pr-4 py-2 w-full text-gray-700 bg-transparent text-[14px] font-medium focus:outline-none rounded-[10px]"
            />
          </div>
        </div>
        <button className="border border-green-700 text-sm rounded-md px-4 p-2 text-green-700 font-semibold flex items-center">
          <span className="mr-1">Login</span>
          <span>👤</span>
        </button>
      </div>

      <div className="z-10 w-full -mt-3 flex flex-wrap border-y border-gray-200 space-x-4 sm:space-x-6 mb-4 shadow-[0_4px_4px_-2px_rgba(0,0,0,0.1)] py-4 pb-2 px-4 sm:px-[8vw] font-bold text-[14px] gap-4.5 bg-white">
        <a href="#" className="text-gray-800">Buy Medicines</a>
        <a href="#" className="text-gray-800">Find Doctors</a>
        <a href="#" className="text-gray-800">Lab Tests</a>
        <a href="#" className="text-gray-800">Circle Membership</a>
        <a href="#" className="text-gray-800">Health Records</a>
        <a href="#" className="text-gray-800">Diabetes Reversal</a>
        <a href="#" className="text-gray-800 flex items-center">
          Buy Insurance
          <span className="ml-1 bg-green-100 font-medium text-xs px-2 text-green-800">New</span>
        </a>
      </div>

      <div className="flex flex-col lg:flex-row -mx-5">
        <div className="w-full lg:w-[26%] p-4 border-r space-y-6 -mt-5 h-[88vh] overflow-y-auto">
          <div className="flex justify-between">
            <p className="text-gray-900 font-bold">Filters</p>
            <p className="text-green-700 text-[14px] font-bold cursor-pointer" onClick={clearFilters}>Clear All</p>
          </div>
          <div className="-mt-2 w-full h-0.5 bg-gray-400"></div>
          <div className="-mt-2 w-full border-1 rounded-md text-center p-1 text-green-700 text-sm">
            Show Doctors Near Me
          </div>

          <div className="space-y-2">
            <h3 className="-mt-2 text-gray-800 font-semibold">Mode of Consult</h3>
            {["Hospital Visit", "Online Consult"].map((m) => (
              <label key={m} className="block ml-2">
                <input
                  type="checkbox"
                  name="mode"
                  checked={mode.includes(m)}
                  onChange={() =>
                    setMode((prev) =>
                      prev.includes(m) ? prev.filter((p) => p !== m) : [...prev, m]
                    )
                  }
                />{" "}
                {m}
              </label>
            ))}
          </div>

          <div className="space-y-2 -mt-4">
            <h3 className="font-semibold">Experience (In Years)</h3>
            {["0-5", "6-10", "11-16", "16+"].map((e) => (
              <label key={e} className="block ml-2">
                <input
                  type="checkbox"
                  name="experience"
                  checked={experience.includes(e)}
                  onChange={() =>
                    setExperience((prev) =>
                      prev.includes(e) ? prev.filter((p) => p !== e) : [...prev, e]
                    )
                  }
                />{" "}
                {e}
              </label>
            ))}
          </div>

          <div className="space-y-2 -mt-5">
            <h3 className="font-semibold">Fees (In Rupees)</h3>
            {["100-500", "500-1000", "1000+"].map((f) => (
              <label key={f} className="block ml-2">
                <input
                  type="checkbox"
                  name="fees"
                  checked={fees.includes(f)}
                  onChange={() =>
                    setFees((prev) =>
                      prev.includes(f) ? prev.filter((p) => p !== f) : [...prev, f]
                    )
                  }
                />{" "}
                {f}
              </label>
            ))}
          </div>

          <div className="space-y-2 -mt-5">
            <h3 className="font-semibold">Language</h3>
            {["English", "Hindi", "Telugu", "Punjabi", "Bengali", "Marathi", "Urdu", "Gujarati", "Tamil", "Kannada", "Oriya", "Persian", "Assamese"].map((l) => (
              <label key={l} className="block ml-2">
                <input
                  type="checkbox"
                  name="language"
                  checked={language.includes(l)}
                  onChange={() =>
                    setLanguage((prev) =>
                      prev.includes(l) ? prev.filter((p) => p !== l) : [...prev, l]
                    )
                  }
                />{" "}
                {l}
              </label>
            ))}
          </div>

          <div className="space-y-2 -mt-5">
            <h3 className="font-semibold">Facility</h3>
            {["Apollo Hospital", "Other Clinics"].map((f) => (
              <label key={f} className="block ml-2">
                <input
                  type="checkbox"
                  name="facility"
                  checked={facility.includes(f)}
                  onChange={() =>
                    setFacility((prev) =>
                      prev.includes(f) ? prev.filter((p) => p !== f) : [...prev, f]
                    )
                  }
                />{" "}
                {f}
              </label>
            ))}
          </div>
        </div>

        <div className="flex">
          <div className="w-full lg:w-[100%] px-4 sm:px-8 lg:px-12 py-4 -mt-5">
            <small className="font-semibold text-green-700">Home / Doctors / General physicians</small>
            <div className="flex flex-col sm:flex-row justify-between mt-1.5">
              <div>
                <h2 className="mt-4 text-xl sm:text-2xl font-bold mb-4">
                  Consult General Physicians Online - Internal Medicine Specialists
                </h2>
                <h2 className="-mt-5">({doctors.length} doctors)</h2> {/* Updated to use doctors.length */}
              </div>

              <div className="flex items-center justify-end mb-4 h-12 space-x-2">
                <div className="border p-2 rounded flex px-2 mx-2 sm:mx-8 w-44 h-12 py-3 justify-around">
                  <img
                    src="https://images.apollo247.in/images/hospital-listing/sort.svg?tr=q-80,w-50,dpr-3,c-at_max"
                    alt="Sort Icon"
                  />
                  Availability
                  <select defaultValue="">
                    <option value="" disabled></option>
                  </select>
                </div>
              </div>
            </div>

            <div ref={doctorListRef} className="mt-7 h-[70vh] overflow-y-auto">
              {loading ? (
                <p>Loading doctors...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : doctors.length === 0 ? (
                <p>No doctors found matching your criteria.</p>
              ) : (
                doctors.map((doctor) => (
                  <div
                    key={`${doctor.name}-${doctor.location}-${doctors.indexOf(doctor)}`}
                    className="border p-4 h-36 flex sm:flex-row rounded-[7px] mb-6 border-gray-300"
                  >
                    <div className="mr-4">
                      <img
                        src={doctor.profileImageUrl || "https://via.placeholder.com/72"} // Fallback image
                        alt={doctor.name}
                        className="w-18 h-18 justify-start"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
                      <h3 className="font-semibold text-md flex">
                        {doctor.name}
                        <img src="https://static.vecteezy.com/system/resources/previews/022/141/941/large_2x/information-sign-info-and-faq-icon-symbol-illustration-vector.jpg"
                          alt="Info Icon" className="h-[13px] mt-1.5 ml-2" />
                      </h3>
                      <p className="text-gray-400 text-[14px] font-semibold">{doctor.specialization}</p>
                      <p className="text-purple-900 font-semibold text-[13px]">
                        {doctor.experience} YEARS • {doctor.qualification}
                      </p>
                      <small className="text-gray-400 font-sans font-semibold">
                        <p>{doctor.location}</p>
                        <p>{doctor.clinicName}</p>
                      </small>
                    </div>

                    <div className="text-center sm:text-right">
                      <p className="text-lg font-semibold">
                        ₹{doctor.fee}{" "}
                        {doctor.cashback && (
                          <span className="text-orange-500 bg-orange-100 rounded-full px-2 py-1 text-sm ml-2">
                            {doctor.cashback}
                          </span>
                        )}
                      </p>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
                        Consult Online
                      </button>
                    </div>
                  </div>
                ))
              )}
              {isFetchingMore && (
                <p className="text-center text-gray-500 py-4">Loading more doctors...</p>
              )}
              {!hasMore && doctors.length > 0 && (
                <p className="text-center text-gray-500 py-4">No more doctors to load.</p>
              )}
            </div>
          </div>

          <div className="w-full lg:w-1/4 mt-8 p-4 bg-blue-900 text-white p-4 h-56 rounded-xl">
            <img src="https://images.apollo247.in/images/doctor-listing/consult_doctor.png?tr=q-80,f-webp,w-200,dpr-2,c-at_max" />
            <div className="mt-4">
              <p className="font-semibold">Need help finding the right doctor?</p>
              <u> <small>Call <strong>+91-8040245807</strong> to book instantly</small></u>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}