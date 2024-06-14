import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profileImage: null,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000");
      const data = await response.json();
      
        setUsers(data);
       
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("profileImage", formData.profileImage);

    try {
      const response = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: form,
      });
      const newUser = await response.json();
      setUsers((prevUsers) => [...prevUsers, newUser]);
      setFormData({ name: "", email: "", profileImage: null });
    } catch (err) {
      console.error("Error uploading user:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/users/${id}`, {
        method: "DELETE",
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <>
      <h3>Index Page</h3>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Name</label>
        <input
          type="text"
          name="name"
          placeholder="Name here"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          placeholder="Email here"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="profileImage"
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>
      </form>

      <h1>Data Table</h1>
      <table id="customers">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Image Filename</th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.filename}</td>
              <td>
                <button>Update</button>
              </td>
              <td>
                <button onClick={() => handleDelete(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default App;
