import React, { useState, useEffect } from 'react';

function Profile({ onUpdate }) {
  const [profile, setProfile] = useState({
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '123-456-7890',
  address: '123 Main St, City',
  summary: 'Passionate developer with 3+ years of experience...',
  skills: 'React, Node.js, MongoDB',
  experience: [
    {
      title: '',
      company: '',
      location: '',
      duration: '',
      description: ''
    }
  ],
  education: [
    {
      degree: '',
      school: '',
      location: '',
      duration: ''
    }
  ]
});


  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (savedProfile) {
      setProfile(savedProfile);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    onUpdate(profile);
  }, [profile, onUpdate]);

  const handleChange = (e, index, section) => {
    const { name, value } = e.target;
    const updatedSection = [...profile[section]];
    updatedSection[index][name] = value;
    setProfile({ ...profile, [section]: updatedSection });
  };

  const handleProfileFieldChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const addEntry = (section) => {
    const newEntry = section === 'experience'
      ? { title: '', company: '', location: '', duration: '', description: '' }
      : { degree: '', school: '', location: '', duration: '' };

    setProfile({ ...profile, [section]: [...profile[section], newEntry] });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>

      {/* Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input name="name" value={profile.name} onChange={handleProfileFieldChange} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input name="email" value={profile.email} onChange={handleProfileFieldChange} className="w-full p-2 border rounded" />
        </div>
      </div>

      {/* Experience */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Work Experience</h3>
        {profile.experience.map((exp, index) => (
          <div key={index} className="w-half space-y-2  p-4 mb-2 rounded-md">
            <input
              placeholder="Job Title"
              name="title"
              value={exp.title}
              onChange={(e) => handleChange(e, index, 'experience')}
              className="w-full p-2 border rounded"
            />
            <input
              placeholder="Company"
              name="company"
              value={exp.company}
              onChange={(e) => handleChange(e, index, 'experience')}
              className="w-full p-2 border rounded"
            />
            <input
              placeholder="Location"
              name="location"
              value={exp.location}
              onChange={(e) => handleChange(e, index, 'experience')}
              className="w-full p-2 border rounded"
            />
            <input
              placeholder="Duration (e.g. Jan 2023 - Present)"
              name="duration"
              value={exp.duration}
              onChange={(e) => handleChange(e, index, 'experience')}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Description"
              name="description"
              value={exp.description}
              onChange={(e) => handleChange(e, index, 'experience')}
              className="ml-0 w-full p-2 border rounded"
              rows="3"
            />
          </div>
        ))}
        <button
          onClick={() => addEntry('experience')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Experience
        </button>
      </div>

      {/* Education */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Education</h3>
        {profile.education.map((edu, index) => (
          <div key={index} className="space-y-2 p-4 mb-4 rounded-md">
            <input
              placeholder="Degree"
              name="degree"
              value={edu.degree}
              onChange={(e) => handleChange(e, index, 'education')}
              className="w-full p-2 border rounded"
            />
            <input
              placeholder="School"
              name="school"
              value={edu.school}
              onChange={(e) => handleChange(e, index, 'education')}
              className="w-full p-2 border rounded"
            />
            <input
              placeholder="Location"
              name="location"
              value={edu.location}
              onChange={(e) => handleChange(e, index, 'education')}
              className="w-full p-2 border rounded"
            />
            <input
              placeholder="Duration (e.g. Sept 2020 - Nov 2024)"
              name="duration"
              value={edu.duration}
              onChange={(e) => handleChange(e, index, 'education')}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}
        <button
          onClick={() => addEntry('education')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add Education
        </button>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Skills</label>
        <input
          name="skills"
          value={profile.skills}
          onChange={handleProfileFieldChange}
          placeholder="E.g., Python, React, SQL"
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
}

export default Profile;
