import axios from "axios";
const prodAPI = "https://mimo-backend.herokuapp.com/";
const devAPI = "http://localhost:4000/";
export const getMsgs = async () => {
	const res = await axios.get(prodAPI);
	// console.log(res);
	return res.data;
};
export const getUser = async (userObj) => {
	const res = await axios.get(`${prodAPI}${userObj}`);
	// console.log(res);
	return res;
};
export const postUser = async (newUserObj) => {
	return await axios.post(`${prodAPI}user`, newUserObj);
};
export const postActivationCode = async (id) => {
	console.log(id);
	return await axios.post(`${prodAPI}code`, id);
};
