import React, { useState } from "react";
import { UserGroupIcon, NoSymbolIcon, TrashIcon } from "@heroicons/react/24/outline";

const options = [
  { value: "have_or_expecting", label: "I have/expecting a child", icon: UserGroupIcon },
  { value: "no_children", label: "I do not have children", icon: NoSymbolIcon },
];

const TRAITS = [
  "Happy",
  "Calm",
  "Living with disability",
  "Curious",
  "Playful",
  "Shy",
];

const Children: React.FC = () => {
  const [selected, setSelected] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [gender, setGender] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [traits, setTraits] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showExpectingModal, setShowExpectingModal] = useState(false);
  const [expectingDate, setExpectingDate] = useState("");
  const [expectingLoading, setExpectingLoading] = useState(false);
  const [expectingError, setExpectingError] = useState("");

  const handleOptionChange = (val: string) => setSelected(val);

  const handleTraitChange = (trait: string) => {
    if (traits.includes(trait)) {
      setTraits(traits.filter((t) => t !== trait));
    } else if (traits.length < 3) {
      setTraits([...traits, trait]);
    }
  };

  const handleChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender || !dob || traits.length === 0) {
      setError("Please fill all fields and select up to 3 traits.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/v1/household_kids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          gender,
          date_of_birth: dob,
          traits,
        }),
      });
      if (!res.ok) throw new Error("Failed to save child. Please try again.");
      const saved = await res.json();
      setChildrenList([...childrenList, saved]);
      setShowModal(false);
      setGender("");
      setDob("");
      setTraits([]);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChild = (idx: number) => {
    setChildrenList(childrenList.filter((_, i) => i !== idx));
  };

  const handleExpectingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpectingError("");
    setExpectingLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/v1/household_kids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          is_expecting: true,
          expected_date: expectingDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to save expecting child. Please try again.");
      const saved = await res.json();
      setChildrenList([...childrenList, saved]);
      setShowExpectingModal(false);
      setExpectingDate("");
    } catch (err: any) {
      setExpectingError(err.message || "An error occurred.");
    } finally {
      setExpectingLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form className="bg-white border p-8 rounded-xl shadow-lg flex flex-col gap-8">
        <h2 className="text-2xl font-extrabold text-primary mb-4 text-center">Children</h2>
        <div className="flex flex-col gap-5">
          {options.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer shadow-sm text-lg font-medium ${selected === opt.value ? "border-primary-500 bg-primary-50 text-primary-900" : "border-gray-200 bg-white hover:bg-gray-50"}`}
            >
              <input
                type="radio"
                name="children"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => handleOptionChange(opt.value)}
                className="form-radio h-5 w-5 text-primary-600 border-gray-300 mr-2"
              />
              <opt.icon className="h-7 w-7 text-primary-500" aria-hidden="true" />
              <span>{opt.label}</span>
            </label>
          ))}

          {selected === "have_or_expecting" && (
            <>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModal(true)} className="bg-primary-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary-700">Add child</button>
                <button type="button" onClick={() => setShowExpectingModal(true)} className="bg-primary-100 text-primary-700 px-5 py-2 rounded-lg font-semibold border border-primary-200 hover:bg-primary-200">I am expecting a child</button>
              </div>

              {childrenList.length > 0 && (
                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr>
                        <th className="py-2 px-3 text-left">Gender</th>
                        <th className="py-2 px-3 text-left">Date of Birth</th>
                        <th className="py-2 px-3 text-left">Traits</th>
                        <th className="py-2 px-3 text-left"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {childrenList.map((child, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="py-2 px-3 capitalize">{child.gender}</td>
                          <td className="py-2 px-3">{child.date_of_birth || child.dob || child.expected_date}</td>
                          <td className="py-2 px-3">
                            {Array.isArray(child.traits) ? (
                              child.traits.map((t: string) => (
                                <span key={t} className="inline-block bg-primary-100 text-primary-800 rounded px-2 py-1 text-xs font-medium mr-1 mb-1">{t}</span>
                              ))
                            ) : (
                              child.is_expecting && <span className="italic text-gray-400">Expecting</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <button type="button" onClick={() => handleDeleteChild(idx)} className="text-red-500 hover:text-red-700">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </form>

      {showModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-xl font-bold text-primary mb-5 text-center">Add Child</h3>
            <form onSubmit={handleChildSubmit} className="flex flex-col gap-6">
              <div>
                <div className="mb-2 font-semibold text-gray-700">Gender</div>
                <div className="flex gap-7">
                  {['male', 'female'].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        className="form-radio h-5 w-5 text-primary-600"
                      />
                      <span className="capitalize">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="input-primary w-full"
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Traits <span className="text-xs text-gray-400">(Select up to 3)</span></label>
                <div className="flex flex-wrap gap-3">
                  {TRAITS.map(trait => (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => handleTraitChange(trait)}
                      disabled={traits.length === 3 && !traits.includes(trait)}
                      className={`px-4 py-2 rounded-lg border text-base font-medium ${traits.includes(trait) ? 'bg-primary-100 border-primary-500 text-primary-800' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-primary-50'} ${traits.length === 3 && !traits.includes(trait) ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <button type="submit" className="bg-primary-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary-700" disabled={loading}>
                {loading ? "Saving..." : "Save Child"}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">×</button>
            </form>
          </div>
        </div>
      )}

      {showExpectingModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-xl font-bold text-primary mb-5 text-center">Expecting a Child</h3>
            <form onSubmit={handleExpectingSubmit} className="flex flex-col gap-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Expected Date of Birth</label>
                <input
                  type="date"
                  value={expectingDate}
                  onChange={e => setExpectingDate(e.target.value)}
                  className="form-input w-full border-gray-300 rounded"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              {expectingError && <div className="text-red-500 text-sm text-center">{expectingError}</div>}
              <button type="submit" className="bg-primary-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary-700" disabled={expectingLoading}>
                {expectingLoading ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={() => setShowExpectingModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">×</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Children;
