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
        fee: doctor.fees.toString(),
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
    setHasMore(true);
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
    <div>
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
                  <option value="Pune">Pune</option>
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
            <span><img src="profile.png" className="h-6 ml-2"/></span>
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
                  <h2 className="-mt-5">({doctors.length} doctors)</h2>
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
                          src={doctor.profileImageUrl || "https://via.placeholder.com/72"}
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

      <div class="w-full bg-white text-gray-900 mx-auto p-6 text-md px-36">
        <h1 class="font-bold text-sm mb-4">Book Consult for General Medicine Online</h1>

        <p class="mb-6">
          Booking an appointment with a top general physician (GP) is now easier than ever with <strong>Apollo 24|7</strong>.
          Our experienced doctors provide comprehensive care for a wide range of medical conditions, including <strong>fever, allergies, and diabetes</strong>.
          You can conveniently schedule an online general physician consultation or visit a trusted hospital/clinic near you.
          Our allergies doctor and diabetes doctor offer flexible appointment slots to suit your needs.
          With transparent general physician fees and genuine general physician reviews, you can make an informed decision when choosing your healthcare provider.
          Take charge of your health today by booking a doctor near your location by searching the phrase <strong>general physician near me</strong>.
        </p>

        <h2 class="font-semibold mt-8 mb-2">What is General Medicine?</h2>
        <p class="mb-6">
          General medicine is a medical specialty that focuses on the prevention, diagnosis, and treatment of internal diseases in adults.
          This specialty encompasses a wide range of acute and chronic conditions affecting various parts of the body, including <strong>fever, asthma, heart disease, liver problems, hypertension, and neurological disorders</strong>.
          General medicine plays a crucial role in healthcare by providing comprehensive medical care, managing complex conditions, and addressing multiple co-morbidities.
          General physicians are essential in preventive healthcare, early diagnosis, and the long-term management of chronic diseases, ultimately improving patient outcomes and quality of life.
        </p>

        <h2 class="font-semibold mt-8 mb-2">Who is a General Physician?</h2>
        <p class="mb-6">
          A general physician is a medical doctor who specializes in the diagnosis, treatment, and prevention of adult diseases.
          To become a general physician in the Indian subcontinent, one must complete an MBBS degree followed by postgraduate training in General Medicine or Internal Medicine.
          General physicians are trained to diagnose and treat a wide range of medical conditions, providing comprehensive care that includes preventive health measures, early detection of diseases, and long-term management of chronic conditions.
          They play a vital role in coordinating care when multiple co-morbidities or complex health issues are present, making them essential in preventive healthcare.
        </p>

        <h2 class="font-semibold mt-8 mb-2">What Do General Physicians Do?</h2>
        <p class="mb-6">
          General physicians (GPs) are the first point of contact for patients seeking medical care. Some of the key responsibilities of doctors include:
        </p>
        <ul class="list-disc pl-6 space-y-2 mb-6">
          <li>Conducting thorough physical examinations and taking detailed medical histories to accurately diagnose health issues</li>
          <li>Ordering and interpreting diagnostic tests, such as blood work, imaging studies, and biopsies, to identify underlying conditions</li>
          <li>Developing personalised treatment plans that may include medications, lifestyle modifications, or referrals to specialists when necessary</li>
          <li>Providing preventive care, such as vaccinations and health screenings, to help patients maintain optimal health and prevent the onset of diseases</li>
          <li>Educating patients about their health conditions, treatment options, and self-care strategies to promote better health outcomes</li>
          <li>Collaborating with other healthcare professionals, such as specialists and nurses, to ensure comprehensive and coordinated patient care</li>
        </ul>

        <h2 class="font-semibold mt-8 mb-2">What are the Other Sub-Specialties of General Medicine?</h2>
        <p class="mb-6">
          General medicine encompasses several sub-specialties that focus on specific areas of adult healthcare. These include:
        </p>
        <ul class="list-disc pl-6 space-y-2 mb-6">
          <li><strong>Geriatric Medicine:</strong> This sub-speciality focuses on the unique healthcare needs of older adults, addressing age-related conditions and promoting healthy ageing.</li>
          <li><strong>Palliative Care:</strong> Palliative care specialists provide compassionate care to patients with serious or life-limiting illnesses, focusing on symptom management and quality of life.</li>
          <li><strong>Sports Medicine:</strong> This sub-speciality deals with the prevention, diagnosis, and treatment of sports-related injuries and conditions, helping athletes maintain optimal performance and recover from injuries.</li>
          <li><strong>Preventive Medicine:</strong> Preventive medicine specialists focus on promoting health and preventing diseases at the individual and population levels through lifestyle interventions, health education, and public health initiatives.</li>
          <li><strong>Paediatric Medicine:</strong> While general medicine primarily focuses on adult care, some general physicians may have additional training in paediatric medicine, allowing them to provide care for children and adolescents.</li>
          <li><strong>Addiction Medicine:</strong> This sub-speciality addresses substance use disorders and related health issues, providing evidence-based treatments and support for individuals struggling with addiction.</li>
          <li><strong>Occupational Medicine:</strong> Occupational medicine specialists focus on the health and safety of workers, preventing and treating work-related injuries and illnesses, and promoting safe work environments.</li>
          <li><strong>Rural Medicine:</strong> General physicians practising in rural areas often have a broad skill set to address the diverse healthcare needs of communities with limited access to specialist care.</li>
        </ul>

        <h2 class="font-semibold mt-8 mb-2">What are the Examinations Conducted Under General Medicine or Tests Performed by a General Physician?</h2>
        <p class="mb-6">
          General physicians perform a variety of diagnostic tests and examinations to accurately diagnose and monitor health conditions. Some of the most common tests and examinations include:
        </p>
        <ul class="list-disc pl-6 space-y-2 mb-6">
          <li><strong>Physical Examination:</strong> A thorough head-to-toe assessment to evaluate overall health and identify any signs of disease or abnormalities.</li>
          <li><strong>Blood Tests:</strong> Various blood tests, such as complete blood count (CBC), metabolic panel, and lipid profile, assess organ function, detect infections, and screen for health issues.</li>
          <li><strong>Urine Analysis:</strong> Examination of urine samples to detect urinary tract infections, kidney problems, or other health conditions.</li>
          <li><strong>Imaging Studies:</strong> X-rays, ultrasounds, CT scans, and MRI scans to visualise internal structures and diagnose conditions such as fractures, tumours, or organ damage.</li>
          <li><strong>Electrocardiogram (ECG):</strong> A test that records the electrical activity of the heart to detect heart rhythm abnormalities or signs of heart disease.</li>
          <li><strong>Pulmonary Function Tests (PFTs):</strong> Breathing tests that measure lung function and capacity, are often used to diagnose and monitor respiratory conditions like asthma or chronic obstructive pulmonary disease (COPD).</li>
          <li><strong>Biopsies:</strong> The removal of small tissue samples for laboratory analysis to diagnose conditions such as cancer or inflammatory diseases.</li>
          <li><strong>Allergy Tests:</strong> Skin prick tests or blood tests to identify specific allergens causing allergic reactions.</li>
          <li><strong>Glucose Tolerance Test:</strong> A test that measures blood sugar levels over time to diagnose diabetes or prediabetes.</li>
        </ul>

        <h2 class="font-semibold mt-8 mb-2">What are the Common Conditions & Diseases that General Physicians Treat?</h2>
        <p class="mb-6">
          General physicians are skilled at managing a wide array of health issues. Here are some of the conditions and diseases most commonly treated by doctors:
        </p>
        <ul class="list-disc pl-6 space-y-2 mb-6">
          <li><strong>Fever:</strong> A doctor for fever can diagnose and treat various infections causing fever, such as viral or bacterial infections.</li>
          <li><strong>Allergies:</strong> As allergies doctor, GP can identify allergens and provide treatment options to manage symptoms like sneezing, runny nose, and itchy eyes.</li>
          <li><strong>Diabetes:</strong> As a diabetes doctor, a GP plays a crucial role in diagnosing and managing diabetes, helping patients maintain healthy blood sugar levels through medication, diet, and lifestyle changes.</li>
          <li><strong>Hypertension:</strong> General physicians regularly monitor blood pressure and prescribe medications to control hypertension, reducing the risk of heart disease and stroke.</li>
          <li><strong>Respiratory infections:</strong> Common colds, flu, bronchitis, and pneumonia are frequently managed by doctors, who provide appropriate treatment to alleviate symptoms and prevent complications.</li>
          <li><strong>Gastrointestinal issues:</strong> General physicians treat digestive problems like acid reflux, irritable bowel syndrome, and constipation, offering dietary advice and medications to relieve symptoms.</li>
          <li><strong>Urinary tract infections (UTIs):</strong> General physicians diagnose and treat UTIs, which can cause painful urination, frequent urges to urinate, and abdominal discomfort.</li>
          <li><strong>Skin conditions:</strong> Rashes, eczema, acne, and other skin problems are addressed by GPs, who may prescribe topical or oral treatments to improve skin health.</li>
          <li><strong>Musculoskeletal pain:</strong> General physicians evaluate and treat muscle and joint pain, including back pain, arthritis, and sports injuries, recommending exercises, physical therapy, or pain medications as needed.</li>
          <li><strong>Mental health concerns:</strong> General physicians can identify and provide initial treatment for mental health issues like anxiety, depression, and stress, referring patients to specialists when necessary.</li>
          <li><strong>Headaches:</strong> General physicians can diagnose and treat various types of headaches, including tension headaches, migraines, and those caused by underlying health conditions.</li>
          <li><strong>Thyroid disorders:</strong> Doctors can detect and manage thyroid disorders like hypothyroidism and hyperthyroidism, which can cause weight changes, fatigue, and mood disturbances.</li>
          <li><strong>Anaemia:</strong> GPs can diagnose anaemia, a condition characterised by low haemoglobin levels, and recommend dietary changes or supplements to improve red blood cell production.</li>
          <li><strong>Sleep disorders:</strong> General physicians can identify sleep disorders like insomnia and sleep apnea, offering lifestyle recommendations or referring patients to sleep specialists for further evaluation and treatment.</li>
          <li><strong>Vaccinations:</strong> General physicians administer vaccinations to protect patients against preventable diseases like influenza, pneumonia, and hepatitis.</li>
        </ul>

        <h2 class="font-semibold mt-8 mb-2">Reasons to See a General Physician</h2>
        <p class="mb-6">
          Regular visits to a general physician are essential for maintaining optimal health and detecting potential health issues early on. Here are some key reasons to book general physician appointments:
        </p>
        <ul class="list-disc pl-6 space-y-2 mb-6">
          <li><strong>Annual check-ups:</strong> Scheduling yearly check-ups with a general physician allows for the monitoring of overall health, including blood pressure, cholesterol levels, and weight, helping to identify any developing health concerns.</li>
          <li><strong>Chronic disease management:</strong> If you have a chronic condition like diabetes, hypertension, or asthma, regular visits to a doctor are crucial for monitoring your condition and adjusting treatment plans as needed.</li>
          <li><strong>Acute illnesses:</strong> When you experience symptoms of acute illnesses like fever, sore throat, or ear pain, a general physician can provide prompt diagnosis and treatment to help you recover quickly and prevent complications.</li>
          <li><strong>Unexplained symptoms:</strong> If you experience persistent or unusual symptoms like fatigue, weight changes, or digestive issues, a GP can perform a thorough evaluation to determine the underlying cause and recommend appropriate treatment.</li>
          <li><strong>Preventive care:</strong> General physicians offer preventive services like vaccinations, cancer screenings, and lifestyle counselling to help you maintain optimal health and reduce your risk of developing chronic diseases.</li>
          <li><strong>Family history of health issues:</strong> If you have a family history of certain health conditions like heart disease, diabetes, or cancer, a general physician can assess your risk factors and provide guidance on preventive measures to lower your risk.</li>
        </ul>

        <h2 class="font-semibold mt-8 mb-2">What Types of Procedures Do General Physicians Perform?</h2>
        <p class="mb-6">
          General physicians perform a variety of therapeutic and minor surgical procedures, including:
        </p>
        <ul class="list-disc pl-6 space-y-2 mb-6">
          <li><strong>Health screenings:</strong> General physicians conduct routine health screenings like physical examinations, well-child visits, and adolescent health checks to assess overall health and identify any potential concerns.</li>
          <li><strong>Vaccination administration:</strong> Doctors administer vaccinations to protect patients against preventable diseases like influenza, pneumonia, and hepatitis.</li>
          <li><strong>Wound care:</strong> General physicians clean, suture, and dress wounds to promote healing and prevent infection.</li>
          <li><strong>Skin lesion removal:</strong> General physicians can perform minor surgical procedures to remove skin lesions like moles, warts, and skin tags for cosmetic or diagnostic purposes.</li>
          <li><strong>Ingrown toenail treatment:</strong> Doctors can remove or partially remove ingrown toenails to relieve pain and prevent infection.</li>
          <li><strong>Abscess drainage:</strong> Doctors can perform incision and drainage procedures to treat abscesses, which are localised infections that cause painful swelling and pus accumulation.</li>
          <li><strong>Joint injections:</strong> General physicians may administer corticosteroid injections into joints to relieve pain and inflammation associated with conditions like arthritis or bursitis.</li>
          <li><strong>Nebulizer treatment:</strong> GPs can provide nebulizer treatments to patients with respiratory conditions like asthma or COPD to deliver medication directly to the lungs and improve breathing.</li>
          <li><strong>Ear wax removal:</strong> Doctors can safely remove excessive ear wax using irrigation, suction, or specialised instruments to improve hearing and prevent ear discomfort.</li>
          <li><strong>Pap smears:</strong> Female general physicians can perform pap smears to screen for cervical cancer and detect any abnormalities in the cervical cells.</li>
          <li><strong>Electrocardiograms (ECGs):</strong> General physicians can perform and interpret ECGs to assess heart rhythm and detect any abnormalities that may indicate underlying heart disease.</li>
          <li><strong>Spirometry:</strong> GPs can conduct spirometry tests to measure lung function and diagnose respiratory conditions like asthma and COPD.</li>
          <li><strong>Urinalysis:</strong> General physicians can perform urine tests to screen for urinary tract infections, kidney problems, and other health issues.</li>
          <li><strong>Blood glucose testing:</strong> GPs can perform blood glucose tests to diagnose and monitor diabetes, ensuring proper management of the condition.</li>
          <li><strong>Minor fracture management:</strong> Doctors can diagnose and treat minor fractures by applying splints or casts and providing pain management until the bone heals.</li>
        </ul>

        <h2 class="font-semibold mt-8 mb-2">Why Choose an Apollo 24|7 General Physician?</h2>
        <p class="mb-6">
          Apollo 24|7 doctors for fever and allergies doctor are highly skilled and experienced in providing comprehensive healthcare services.
          With their expertise and access to advanced facilities, they offer personalised care tailored to each patient's unique needs.
          Apollo 24|7 diabetes doctors stay up-to-date with the latest medical advancements, ensuring that patients receive the most effective and evidence-based treatments available.
        </p>
        <p class="mb-6">
          Patients can easily book general physician appointments through the Apollo 24|7 platform, which offers seamless access to both online and in-clinic consultations.
          The user-friendly interface allows patients to view general physician reviews, compare general physician fees, and find a doctor near their location by searching for the phrase <strong>general physician near me</strong> based on their preferences.
          By choosing an Apollo 24|7 general physician, patients can expect high-quality, patient-centric care that prioritises their health and well-being.
        </p>

        <h2 class="font-semibold mt-8 mb-2">What to Expect When Visiting a General Physician?</h2>
        <p class="mb-6">
          When you visit a general physician, you can expect a comprehensive evaluation of your health concerns and a personalised treatment plan tailored to your needs. Here's what a typical doctor visit may involve:
        </p>
        <ul class="list-disc pl-6 space-y-2 mb-6">
          <li><strong>Medical history review:</strong> Your general physician will ask about your medical history, including any pre-existing conditions, medications, allergies, and family history of health issues.</li>
          <li><strong>Symptom discussion:</strong> You will have the opportunity to discuss your current symptoms, concerns, and any changes in your health status since your last visit.</li>
          <li><strong>Physical examination:</strong> Your general physician will perform a thorough physical examination, checking your vital signs, assessing your overall health, and focusing on any areas of concern.</li>
          <li><strong>Diagnostic tests:</strong> Depending on your symptoms and medical history, your doctor may order diagnostic tests like blood work, urine tests, or imaging studies to gather more information about your health.</li>
          <li><strong>Diagnosis and treatment plan:</strong> Based on the information gathered during your visit, your general physician will provide a diagnosis and develop a treatment plan that may include medications, lifestyle modifications, or referrals to specialists if needed.</li>
        </ul>

        <h2 class="font-semibold mt-8 mb-2">How Can I Get an Appointment With a General Physician?</h2>
        <p class="mb-6">
          Getting an appointment with a general physician is easy and convenient with Apollo 24|7. Here are the steps to book a general physician:
        </p>
        <ul class="list-disc pl-6 space-y-2 mb-6">
          <li><strong>Online booking through the website:</strong> Visit the Apollo 24|7 website and navigate to the "Book Appointment" section. Choose your preferred general physician based on their profile, experience, general physician reviews, and general physician fee. Select a suitable date and time for your appointment and complete booking online general physician consultation.</li>
          <li><strong>Online booking through the mobile app:</strong> Download the Apollo 24|7 mobile app from the App Store or Google Play Store. Log in or create an account, and follow the same steps as mentioned above for booking through the website. The app allows you to easily search for a doctor near your location by searching the phrase <strong>general physician near me</strong>, view available slots, and book your appointment with just a few taps.</li>
          <li><strong>Offline booking:</strong> You can also book an appointment by visiting your nearest Apollo Clinic or Hospital and requesting an appointment with a general physician at the reception. The staff will assist you in scheduling your consultation based on the doctor's availability.</li>
        </ul>
      </div>

      <div class="bg-gray-100 py-8 px-38">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-gray-600 text-sm">
            <div>
              <h6 class="font-semibold text-gray-800 mb-4">Related Health Articles</h6>
              <ul class="list-none space-y-2">
                <li><a href="#" class="hover:text-blue-500">Oncology Diet: What to Eat and What Not to Eat</a></li>
                <li><a href="#" class="hover:text-blue-500">C-Reactive Protein (CRP) Test: What is the Normal Range, Procedure and Results</a></li>
                <li><a href="#" class="hover:text-blue-500">Mounjaro for Weight Loss: Is it Safe and Effective?</a></li>
                <li><a href="#" class="hover:text-blue-500">How To Use Prega News?: A Guide For Early Pregnancy Detection</a></li>
                <li><a href="#" class="hover:text-blue-500">20 Things You Must Have in Your First-Aid Kit</a></li>
              </ul>
            </div>
            <div>
              <h6 class="font-semibold text-gray-800 mb-4">About Apollo 24/7</h6>
              <ul class="list-none space-y-2">
                <li><a href="#" class="hover:text-blue-500">About Us</a></li>
                <li><a href="#" class="hover:text-blue-500">Contact Us</a></li>
                <li><a href="#" class="hover:text-blue-500">FAQs</a></li>
                <li><a href="#" class="hover:text-blue-500">Health Queries</a></li>
                <li><a href="#" class="hover:text-blue-500">Terms and Conditions</a></li>
                <li><a href="#" class="hover:text-blue-500">Returns Policy</a></li>
                <li><a href="#" class="hover:text-blue-500">Refund Policy</a></li>
                <li><a href="#" class="hover:text-blue-500">Privacy Policy</a></li>
                <li><a href="#" class="hover:text-blue-500">Apollo 24/7 Android App</a></li>
                <li><a href="#" class="hover:text-blue-500">Apollo 24/7 iOS App</a></li>
                <li><a href="#" class="hover:text-blue-500">Corporate Disclosures</a></li>
                <li><a href="#" class="hover:text-blue-500">Apollo 24/7 Sitemap</a></li>
                <li><a href="#" class="hover:text-blue-500">Online Doctor App</a></li>
                <li><a href="#" class="hover:text-blue-500">Online Medicine App</a></li>
                <li><a href="#" class="hover:text-blue-500">Apollo Pharmacy</a></li>
                <li><a href="#" class="hover:text-blue-500">Hospitals And Clinics</a></li>
                <li><a href="#" class="hover:text-blue-500">Disease and Conditions</a></li>
                <li><a href="#" class="hover:text-blue-500">Blogs</a></li>
                <li><a href="#" class="hover:text-blue-500">Lab Tests Centers</a></li>
              </ul>
            </div>
            <div>
              <h6 class="font-semibold text-gray-800 mb-4">Services</h6>
              <ul class="list-none space-y-2">
                <li><a href="#" class="hover:text-blue-500">Online Doctor Consultation</a></li>
                <li><a href="#" class="hover:text-blue-500">Apollo Circle Membership</a></li>
                <li><a href="#" class="hover:text-blue-500">Online Medicines</a></li>
                <li><a href="#" class="hover:text-blue-500">Cough Scanner</a></li>
                <li><a href="#" class="hover:text-blue-500">Apollo ProHealth Program</a></li>
                <li><a href="#" class="hover:text-blue-500">Doctors By Specialty</a></li>
                <li><a href="#" class="hover:text-blue-500">Doctors by City</a></li>
                <li><a href="#" class="hover:text-blue-500">All Doctors List</a></li>
                <li><a href="#" class="hover:text-blue-500">Apollo Diabetes Reversal</a></li>
                <li><a href="#" class="hover:text-blue-500">International Patient Login</a></li>
              </ul>
            </div>
            <div>
              <h6 class="font-semibold text-gray-800 mb-4">Top Specialties</h6>
              <ul class="list-none space-y-2">
                <li><a href="#" class="hover:text-blue-500">Consult Physicians</a></li>
                <li><a href="#" class="hover:text-blue-500">Consult Dermatologists</a></li>
                <li><a href="#" class="hover:text-blue-500">Consult Pediatricians</a></li>
                <li><a href="#" class="hover:text-blue-500">Consult Gynaecologists</a></li>
                <li><a href="#" class="hover:text-blue-500">Consult Gastroenterologists</a></li>
                <li><a href="#" class="hover:text-blue-500">Consult Cardiologists</a></li>
                <li><a href="#" class="hover:text-blue-500">Consult Dietitians</a></li>
                <li><a href="#" class="hover:text-blue-500">Consult ENT Specialists</a></li>
                <li><a href="#" class="hover:text-blue-500">Consult Geriatricians</a></li>
                <li><a href="#" class="hover:text-blue-500">Consult Diabetologists</a></li>
              </ul>
            </div>
            <div>
              <h6 class="font-semibold text-gray-800 mb-4">Book Lab Tests at Home</h6>
              <ul class="list-none space-y-2">
                <li><a href="#" class="hover:text-blue-500">RT PCR Test At Home</a></li>
                <li><a href="#" class="hover:text-blue-500">Book Lab Tests at Home</a></li>
                <li><a href="#" class="hover:text-blue-500">Renal Profile (KFT, RFT Test)</a></li>
                <li><a href="#" class="hover:text-blue-500">Hemogram Test</a></li>
                <li><a href="#" class="hover:text-blue-500">Lipid Profile Test</a></li>
                <li><a href="#" class="hover:text-blue-500">Thyroid Profile Test (T3, T4, TSH Test)</a></li>
                <li><a href="#" class="hover:text-blue-500">D Dimer Test</a></li>
                <li><a href="#" class="hover:text-blue-500">Urine Culture Test</a></li>
                <li><a href="#" class="hover:text-blue-500">Complete Blood Count (CBC Test)</a></li>
                <li><a href="#" class="hover:text-blue-500">Widal Test</a></li>
                <li><a href="#" class="hover:text-blue-500">Liver Function Test (LFT Test)</a></li>
              </ul>
            </div>
            <div>
              <h6 class="font-semibold text-gray-800 mb-4">Momverse</h6>
              <ul class="list-none space-y-2">
                <li><a href="#" class="hover:text-blue-500">MomVerse Home</a></li>
                <li><a href="#" class="hover:text-blue-500">Preconception</a></li>
                <li><a href="#" class="hover:text-blue-500">Pregnancy</a></li>
                <li><a href="#" class="hover:text-blue-500">Postpartum</a></li>
                <li><a href="#" class="hover:text-blue-500">Newborn & Infant</a></li>
                <li><a href="#" class="hover:text-blue-500">First Trimester</a></li>
                <li><a href="#" class="hover:text-blue-500">Second Trimester</a></li>
                <li><a href="#" class="hover:text-blue-500">Third Trimester</a></li>
                <li><a href="#" class="hover:text-blue-500">Ovulation</a></li>
                <li><a href="#" class="hover:text-blue-500">Infertility</a></li>
                <li><a href="#" class="hover:text-blue-500">Postpartum Mental Health</a></li>
                <li><a href="#" class="hover:text-blue-500">Pregnancy Articles</a></li>
                <li><a href="#" class="hover:text-blue-500">Postpartum Articles</a></li>
                <li><a href="#" class="hover:text-blue-500">3 months Pregnancy</a></li>
                <li><a href="#" class="hover:text-blue-500">2 months Pregnancy</a></li>
                <li><a href="#" class="hover:text-blue-500">Breastfeeding</a></li>
                <li><a href="#" class="hover:text-blue-500">Baby Food</a></li>
                <li><a href="#" class="hover:text-blue-500">Baby Vaccination</a></li>
                <li><a href="#" class="hover:text-blue-500">6 Month Old Baby</a></li>
                <li><a href="#" class="hover:text-blue-500">Popular Gril Baby Names</a></li>
              </ul>
            </div>
            <div>
              <h6 class="font-semibold text-gray-800 mb-4">Top Hospitals</h6>
              <ul class="list-none space-y-2">
                <li><a href="#" class="hover:text-blue-500">Apollo Hospital Jubilee Hills</a></li>
                <li><a href="#" class="hover:text-blue-500">Apollo Hospitals Greams Road</a></li>
                <li><a href="#" class="hover:text-blue-500">Indraprastha Apollo Hospital</a></li>
                <li><a href="#" class="hover:text-blue-500">Apollo Hospitals Bannerghatta Road</a></li>
                <li><a href="#" class="hover:text-blue-500">Apollo Hopspital - Belapur, Navi Mumbai</a></li>
                <li><a href="#" class="hover:text-blue-500">Apollo Hospitals Canal Circular Road</a></li>
              </ul>
            </div>
            <div class="hidden lg:block">
        <h6 class="font-semibold text-gray-800 mb-4">Product Categories</h6>
        <ul class="list-none space-y-2">
          <li><a href="#" class="hover:text-blue-500">View All Brands</a></li>
          <li><a href="#" class="hover:text-blue-500">Health Care</a></li>
          <li><a href="#" class="hover:text-blue-500">Personal Care</a></li>
          <li><a href="#" class="hover:text-blue-500">Baby Care</a></li>
          <li><a href="#" class="hover:text-blue-500">Nutrition</a></li>
          <li><a href="#" class="hover:text-blue-500">Healthcare Devices</a></li>
          <li><a href="#" class="hover:text-blue-500">Beauty Skin Care</a></li>
          <li><a href="#" class="hover:text-blue-500">Immunity Boosters</a></li>
          <li><a href="#" class="hover:text-blue-500">Coronavirus Prevention</a></li>
          <li><a href="#" class="hover:text-blue-500">Diabetes Care</a></li>
          <li><a href="#" class="hover:text-blue-500">Patanjali Coronil Kit</a></li>
          <li><a href="#" class="hover:text-blue-500">Mamaearth Products</a></li>
        </ul>
      </div>
          </div>
        </div>
      </div>

      <header class="bg-white py-4 px-38">
        <div class="container mx-auto px-4 flex items-center justify-between text-gray-600 text-sm">
          <div class="flex items-center">
            <img src="apollo247.svg" alt="Apollo 247 logo" class="mr-4 h-16" />
          </div>
          <div class="flex items-center">
            <a href="#" aria-label="Download from Google Play" class="mr-2">
              <img src="playstore.png" alt="Google Play store logo" class="h-12" />
            </a>
            <a href="#" aria-label="Download from App Store">
              <img src="appstore.jpeg" alt="Apple App Store logo" class="h-12" />
            </a>
          </div>
          <div class="flex items-center">
            <div class="flex">
              <a href="#" aria-label="Follow us on Facebook" class="mr-2">
                <img src="fb.png" alt="Facebook logo" class="h-10 rounded-full" />
              </a>
              <a href="#" aria-label="Follow us on X" class="mr-2">
                <img src="x.png" alt="X logo" class="h-10 rounded-full" />
              </a>
              <a href="#" aria-label="Connect with us on LinkedIn" class="mr-2">
                <img src="in.png" alt="LinkedIn logo" class="h-10 rounded-full" />
              </a>
              <a href="#" aria-label="Subscribe to our YouTube channel" class="mr-2">
                <img src="youtube.png" alt="YouTube logo" class="h-10 rounded-full" />
              </a>
            </div>
          </div>
        </div>
      </header>
    </div>


  );
}